from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from core.models import Account, Category, Transaction

User = get_user_model()


class AnalyticsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email="user1@example.com", password="StrongPass123")
        login = self.client.post(
            reverse("auth-login"),
            {"email": "user1@example.com", "password": "StrongPass123"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        self.account = Account.objects.create(user=self.user, name="Card", type="card")
        self.category = Category.objects.create(user=self.user, name="Food")

    def test_summary_requires_month(self):
        response = self.client.get(reverse("analytics-summary"))
        self.assertEqual(response.status_code, 400)

    def test_summary_calculates_totals(self):
        month = timezone.localdate().strftime("%Y-%m")
        today = timezone.localdate()
        Transaction.objects.create(
            user=self.user,
            account=self.account,
            category=self.category,
            amount="100.00",
            date=today,
            type="expense",
        )
        Transaction.objects.create(
            user=self.user,
            account=self.account,
            category=self.category,
            amount="50.00",
            date=today,
            type="income",
        )
        response = self.client.get(reverse("analytics-summary"), {"month": month})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_expense"], 100.0)
        self.assertEqual(response.data["total_income"], 50.0)
        self.assertEqual(response.data["today_expense"], 100.0)

    def test_categories_endpoint(self):
        month = date(2025, 1, 1).strftime("%Y-%m")
        Transaction.objects.create(
            user=self.user,
            account=self.account,
            category=self.category,
            amount="200.00",
            date=date(2025, 1, 5),
            type="expense",
        )
        response = self.client.get(reverse("analytics-categories"), {"month": month})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["total"], 200.0)
        self.assertEqual(response.data[0]["percent"], 100.0)

    def test_daily_endpoint(self):
        month = date(2025, 2, 1).strftime("%Y-%m")
        Transaction.objects.create(
            user=self.user,
            account=self.account,
            category=self.category,
            amount="10.00",
            date=date(2025, 2, 3),
            type="expense",
        )
        Transaction.objects.create(
            user=self.user,
            account=self.account,
            category=self.category,
            amount="5.00",
            date=date(2025, 2, 3),
            type="income",
        )
        response = self.client.get(reverse("analytics-daily"), {"month": month})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["total_expense"], 10.0)
        self.assertEqual(response.data[0]["total_income"], 5.0)
