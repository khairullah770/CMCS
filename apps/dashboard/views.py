from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required
def dashboard(request):
    role = getattr(request.user, "role", "employee")
    return render(
        request,
        "dashboard/home.html",
        {
            "role": role,
            "role_label": request.user.get_role_display(),
            "is_ceo": request.user.has_role("ceo"),
            "is_production": request.user.has_role("production"),
            "is_finance": request.user.has_role("finance"),
            "is_hr": request.user.has_role("hr"),
        },
    )
