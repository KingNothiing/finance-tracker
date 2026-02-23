from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Account, Category, PlannedPurchase, Transaction

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "email", "password")

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email")


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ("id", "name", "type", "balance", "created_at")
        read_only_fields = ("id", "created_at")


class CategorySerializer(serializers.ModelSerializer):
    default_account_id = serializers.PrimaryKeyRelatedField(
        source="default_account",
        queryset=Account.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Category
        fields = ("id", "name", "icon", "color", "default_account_id", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_default_account_id(self, value):
        user = self.context["request"].user
        if value is not None and value.user_id != user.id:
            raise serializers.ValidationError("Account does not belong to user.")
        return value


class TransactionSerializer(serializers.ModelSerializer):
    account_id = serializers.PrimaryKeyRelatedField(
        source="account", queryset=Account.objects.all(), required=False
    )
    category_id = serializers.PrimaryKeyRelatedField(
        source="category", queryset=Category.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Transaction
        fields = (
            "id",
            "account_id",
            "category_id",
            "amount",
            "date",
            "type",
            "note",
            "created_at",
        )
        read_only_fields = ("id", "created_at")

    def validate(self, attrs):
        user = self.context["request"].user
        account = attrs.get("account")
        category = attrs.get("category")
        if account and account.user_id != user.id:
            raise serializers.ValidationError({"account_id": "Account does not belong to user."})
        if category and category.user_id is not None and category.user_id != user.id:
            raise serializers.ValidationError({"category_id": "Category does not belong to user."})
        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        if "account" not in validated_data:
            category = validated_data.get("category")
            if category and category.default_account_id:
                validated_data["account"] = category.default_account
            else:
                raise serializers.ValidationError(
                    {"account_id": "Account is required if category has no default account."}
                )
        validated_data["user"] = user
        return super().create(validated_data)


class PlannedPurchaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlannedPurchase
        fields = (
            "id",
            "name",
            "price",
            "description",
            "link",
            "status",
            "created_at",
        )
        read_only_fields = ("id", "created_at")
