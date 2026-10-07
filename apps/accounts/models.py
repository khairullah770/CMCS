from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        CEO = "ceo", "CEO"
        PRODUCTION = "production", "Production"
        FINANCE = "finance", "Finance"
        HR = "hr", "HR & People"
        EMPLOYEE = "employee", "Employee"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.EMPLOYEE)
    department = models.CharField(max_length=120, blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True)

    def has_role(self, *roles: str) -> bool:
        return self.role in roles or self.is_superuser
