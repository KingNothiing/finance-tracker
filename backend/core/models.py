from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


class Account(models.Model):
    TYPE_CHOICES = [
        ("cash", "Cash"),
        ("card", "Card"),
        ("deposit", "Deposit"),
        ("other", "Other"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="accounts")
    name = models.CharField(max_length=120)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="cash")
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.name} ({self.type})"


class Category(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="categories", null=True, blank=True
    )
    name = models.CharField(max_length=120)
    icon = models.CharField(max_length=120, blank=True, default="")
    color = models.CharField(max_length=30, blank=True, default="")
    default_account = models.ForeignKey(
        Account, on_delete=models.SET_NULL, null=True, blank=True, related_name="categories"
    )
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name


class Transaction(models.Model):
    TYPE_CHOICES = [
        ("expense", "Expense"),
        ("income", "Income"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions")
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="transactions")
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="transactions"
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default="expense")
    note = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.type} {self.amount}"


class PlannedPurchase(models.Model):
    STATUS_CHOICES = [
        ("planned", "Planned"),
        ("done", "Done"),
        ("canceled", "Canceled"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="planned_purchases")
    name = models.CharField(max_length=150)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True, default="")
    link = models.URLField(blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="planned")
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name

# Create your models here.
