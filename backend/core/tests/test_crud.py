from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from core.models import Account, Category, PlannedPurchase, Transaction

User = get_user_model()


class CrudTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email="user1@example.com", password="StrongPass123")
        self.other = User.objects.create_user(email="user2@example.com", password="StrongPass123")
        login = self.client.post(
            reverse("auth-login"),
            {"email": "user1@example.com", "password": "StrongPass123"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")

    def test_account_crud_and_isolation(self):
        create = self.client.post(
            "/api/accounts/",
            {"name": "Cash", "type": "cash", "balance": "1000.00"},
            format="json",
        )
        self.assertEqual(create.status_code, 201)
        account_id = create.data["id"]

        list_resp = self.client.get("/api/accounts/")
        self.assertEqual(list_resp.status_code, 200)
        self.assertEqual(len(list_resp.data), 1)

        Account.objects.create(user=self.other, name="Other", type="cash", balance=0)
        list_resp = self.client.get("/api/accounts/")
        self.assertEqual(len(list_resp.data), 1)

        detail = self.client.get(f"/api/accounts/{account_id}/")
        self.assertEqual(detail.status_code, 200)

    def test_category_default_account_and_permissions(self):
        account = Account.objects.create(user=self.user, name="Card", type="card", balance=0)
        default_cat = Category.objects.create(name="Food", user=None)

        list_resp = self.client.get("/api/categories/")
        self.assertEqual(list_resp.status_code, 200)
        self.assertEqual(len(list_resp.data), 1)

        create = self.client.post(
            "/api/categories/",
            {"name": "MyCat", "default_account_id": account.id},
            format="json",
        )
        self.assertEqual(create.status_code, 201)

        patch_default = self.client.patch(
            f"/api/categories/{default_cat.id}/",
            {"name": "Changed"},
            format="json",
        )
        self.assertEqual(patch_default.status_code, 403)

        delete_default = self.client.delete(f"/api/categories/{default_cat.id}/")
        self.assertEqual(delete_default.status_code, 403)

    def test_transaction_uses_category_default_account(self):
        account = Account.objects.create(user=self.user, name="Card", type="card", balance=0)
        category = Category.objects.create(user=self.user, name="Food", default_account=account)

        create = self.client.post(
            "/api/transactions/",
            {
                "category_id": category.id,
                "amount": "250.00",
                "date": date.today().isoformat(),
                "type": "expense",
            },
            format="json",
        )
        self.assertEqual(create.status_code, 201)
        transaction_id = create.data["id"]
        tx = Transaction.objects.get(id=transaction_id)
        self.assertEqual(tx.account_id, account.id)

    def test_transaction_requires_account_if_no_default(self):
        category = Category.objects.create(user=self.user, name="NoDefault")
        create = self.client.post(
            "/api/transactions/",
            {
                "category_id": category.id,
                "amount": "100.00",
                "date": date.today().isoformat(),
                "type": "expense",
            },
            format="json",
        )
        self.assertEqual(create.status_code, 400)

    def test_planned_purchase_crud(self):
        create = self.client.post(
            "/api/planned-purchases/",
            {
                "name": "Phone",
                "price": "20000.00",
                "description": "New phone",
                "link": "https://example.com",
                "status": "planned",
            },
            format="json",
        )
        self.assertEqual(create.status_code, 201)

        list_resp = self.client.get("/api/planned-purchases/")
        self.assertEqual(list_resp.status_code, 200)
        self.assertEqual(len(list_resp.data), 1)
