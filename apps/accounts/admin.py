from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class UserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (("CTMS profile", {"fields": ("role", "department", "avatar")}),)
    list_display = ("username", "email", "role", "department", "is_active")
    list_filter = ("role", "department", "is_active")
