from django.urls import path  # Import Django's path function for defining URL patterns
from core.views import financialPlan, auth, history, tracking, user, models  # Import view modules for various API endpoints

# Define URL patterns for the API endpoints
urlpatterns = [
    # Financial Plan Endpoints
    path("api/financialPlan/<str:plan_id>/", financialPlan.get_plan, name="get_plan"),  # Retrieve a specific financial plan by its ID
    path("api/financialPlan/", financialPlan.add_plan, name="add_plan"),  # Create a new financial plan
    path("api/financialPlan/up/<str:plan_id>/", financialPlan.update_plan, name="update_plan"),  # Update an existing financial plan
    path("api/financialPlan/de/<str:plan_id>/", financialPlan.delete_plan, name="delete_plan"),  # Delete a financial plan by its ID

    # Authentication Endpoints
    path("api/auth/signup/", auth.create_user, name="create_user"),  # Sign up a new user
    path("api/auth/login/", auth.login_user, name="login_user"),  # Log in an existing user
    path("api/auth/checkcookie/", auth.check_cookie_user, name="check_cookie_user"),  # Check if a user session is active based on cookies
    path("api/auth/logout/", auth.logout_user, name="logout_user"),  # Log out a user

    # History Endpoints
    path("api/history/<str:user_id>/", history.get_history, name="get_history"),  # Retrieve a user's financial history by user ID
    path("api/history/", history.add_history, name="add_history"),  # Add a new entry to the user's financial history
    path("api/history/up/<str:history_id>/", history.update_history, name="update_history"),  # Update a specific history entry by history ID
    path("api/history/de/<str:history_id>/", history.delete_history, name="delete_history"),  # Delete a specific history entry by ID
    path("api/history/deall/<str:user_id>/", history.delete_all_history, name="delete_all_history"),  # Delete all history entries for a user

    # Tracking Endpoints
    path("api/tracking/<str:user_id>/", tracking.get_tracking, name="get_tracking"),  # Retrieve financial tracking data for a specific user
    path("api/tracking/", tracking.add_tracking, name="add_tracking"),  # Add new tracking data
    path("api/tracking/up/<str:tracking_id>/", tracking.update_tracking, name="update_tracking"),  # Update tracking data by tracking ID
    path("api/tracking/de/<str:tracking_id>/", tracking.delete_tracking, name="delete_tracking"),  # Delete tracking data by ID

    # User Endpoints
    path("api/user/<str:user_id>/", user.get_user, name="get_user"),  # Retrieve user information by user ID
    # path("api/user/", user.add_user, name="add_user"),  # Add a new user (commented out)
    path("api/user/up/<str:user_id>/", user.update_user, name="update_user"),  # Update a user's information by user ID
    # path("api/user/<str:user_id>/delete/", user.delete_user, name="delete_user"),  # Delete a user by ID (commented out)

    # Model-Related Endpoints
    path("api/models/create_new_plan/", models.create_new_plan, name="create_new_plan"),  # Generate a new financial plan using models
    path("api/models/get_points_regression/", models.get_points_regression, name="get_points_regression"),  # Retrieve regression points for progress tracking
]
