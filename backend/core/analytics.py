from calendar import monthrange
from datetime import date, datetime

from django.db import models
from django.db.models import Sum
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Transaction


def _parse_month(value: str) -> tuple[date, date]:
    try:
        dt = datetime.strptime(value, "%Y-%m")
    except ValueError as exc:
        raise ValueError("Invalid month format. Use YYYY-MM.") from exc
    first = date(dt.year, dt.month, 1)
    last = date(dt.year, dt.month, monthrange(dt.year, dt.month)[1])
    return first, last


class AnalyticsSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        month = request.query_params.get("month")
        if not month:
            return Response({"detail": "month is required (YYYY-MM)."}, status=400)
        try:
            first, last = _parse_month(month)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=400)

        qs = Transaction.objects.filter(user=request.user, date__range=(first, last))
        total_income = qs.filter(type="income").aggregate(total=Sum("amount"))["total"] or 0
        total_expense = qs.filter(type="expense").aggregate(total=Sum("amount"))["total"] or 0

        days_in_month = (last - first).days + 1
        avg_daily_expense = float(total_expense) / days_in_month if days_in_month else 0

        today = timezone.localdate()
        today_expense = (
            Transaction.objects.filter(
                user=request.user, type="expense", date=today
            ).aggregate(total=Sum("amount"))["total"]
            or 0
        )

        return Response(
            {
                "total_income": float(total_income),
                "total_expense": float(total_expense),
                "avg_daily_expense": float(avg_daily_expense),
                "today_expense": float(today_expense),
            }
        )


class AnalyticsCategoriesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        month = request.query_params.get("month")
        if not month:
            return Response({"detail": "month is required (YYYY-MM)."}, status=400)
        try:
            first, last = _parse_month(month)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=400)

        qs = (
            Transaction.objects.filter(
                user=request.user, type="expense", date__range=(first, last)
            )
            .values("category_id")
            .annotate(total=Sum("amount"))
        )
        total_expense = sum(float(row["total"]) for row in qs) if qs else 0
        result = []
        for row in qs:
            total = float(row["total"])
            percent = (total / total_expense * 100) if total_expense else 0
            result.append(
                {
                    "category_id": row["category_id"],
                    "total": total,
                    "percent": percent,
                }
            )
        return Response(result)


class AnalyticsDailyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        month = request.query_params.get("month")
        if not month:
            return Response({"detail": "month is required (YYYY-MM)."}, status=400)
        try:
            first, last = _parse_month(month)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=400)

        qs = (
            Transaction.objects.filter(user=request.user, date__range=(first, last))
            .values("date")
            .annotate(
                total_expense=Sum("amount", filter=models.Q(type="expense")),
                total_income=Sum("amount", filter=models.Q(type="income")),
            )
            .order_by("date")
        )
        result = []
        for row in qs:
            result.append(
                {
                    "date": row["date"].isoformat(),
                    "total_expense": float(row["total_expense"] or 0),
                    "total_income": float(row["total_income"] or 0),
                }
            )
        return Response(result)
