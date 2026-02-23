from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

User = get_user_model()


class AuthFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.email = "user@example.com"
        self.password = "StrongPass123"

    def test_register_returns_tokens(self):
        url = reverse("auth-register")
        response = self.client.post(
            url, {"email": self.email, "password": self.password}, format="json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["email"], self.email)

    def test_login_returns_tokens(self):
        User.objects.create_user(email=self.email, password=self.password)
        url = reverse("auth-login")
        response = self.client.post(
            url, {"email": self.email, "password": self.password}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_refresh_returns_new_access(self):
        User.objects.create_user(email=self.email, password=self.password)
        login = self.client.post(
            reverse("auth-login"),
            {"email": self.email, "password": self.password},
            format="json",
        )
        refresh = login.data["refresh"]
        response = self.client.post(
            reverse("auth-refresh"), {"refresh": refresh}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)

    def test_me_requires_auth(self):
        response = self.client.get(reverse("auth-me"))
        self.assertEqual(response.status_code, 401)

    def test_me_returns_user(self):
        User.objects.create_user(email=self.email, password=self.password)
        login = self.client.post(
            reverse("auth-login"),
            {"email": self.email, "password": self.password},
            format="json",
        )
        access = login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        response = self.client.get(reverse("auth-me"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], self.email)
