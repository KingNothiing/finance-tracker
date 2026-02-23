from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import RegisterView, MeView, health
from .viewsets import AccountViewSet, CategoryViewSet, PlannedPurchaseViewSet, TransactionViewSet

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("accounts", AccountViewSet, basename="account")
router.register("transactions", TransactionViewSet, basename="transaction")
router.register("planned-purchases", PlannedPurchaseViewSet, basename="planned-purchase")

urlpatterns = [
    path("health/", health, name="health"),
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="auth-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
]

urlpatterns += router.urls
