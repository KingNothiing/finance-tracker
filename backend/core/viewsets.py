from django.db import models
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Account, Category, PlannedPurchase, Transaction
from .permissions import IsOwnerOrReadOnlyDefault
from .serializers import (
    AccountSerializer,
    CategorySerializer,
    PlannedPurchaseSerializer,
    TransactionSerializer,
)


class UserOwnedQuerysetMixin:
    def get_queryset(self):
        return self.model.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AccountViewSet(UserOwnedQuerysetMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AccountSerializer
    model = Account


class CategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnlyDefault]
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(
            models.Q(user=self.request.user) | models.Q(user__isnull=True)
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionViewSet(UserOwnedQuerysetMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer
    model = Transaction

    def get_queryset(self):
        qs = Transaction.objects.filter(user=self.request.user)
        params = self.request.query_params
        date_from = params.get("from")
        date_to = params.get("to")
        category_id = params.get("category_id")
        account_id = params.get("account_id")
        tx_type = params.get("type")

        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        if category_id:
            qs = qs.filter(category_id=category_id)
        if account_id:
            qs = qs.filter(account_id=account_id)
        if tx_type:
            qs = qs.filter(type=tx_type)
        return qs


class PlannedPurchaseViewSet(UserOwnedQuerysetMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PlannedPurchaseSerializer
    model = PlannedPurchase
