from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwnerOrReadOnlyDefault(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if getattr(obj, "user_id", None) is None:
            return False
        return obj.user_id == request.user.id
