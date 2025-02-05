from core.services.planModel import create_plan
from core.services.regresionModel import get_points 
from django.shortcuts import render
from django.http import JsonResponse
from core.views.auth import check_cookie_for_functions
from datetime import datetime
import json

def create_new_plan(request):
    """
    Handles the creation of a new financial plan based on user input.

    Args:
        request (HttpRequest): The HTTP request containing the financial plan data.

    Returns:
        JsonResponse: A JSON response indicating success or failure in creating the plan.
    """
    if request.method == "POST":
        try:
            # Validate the user's session with cookie check
            cookie_response = check_cookie_for_functions(request)
            response_data = json.loads(cookie_response.content)
            if response_data.get("status") != "success":
                return cookie_response
            
            # Parse the JSON request body
            data = json.loads(request.body)

            # Define required fields and check for any missing ones
            required_fields = ["income", "last_saving", "expenses", "goal", "duration", "goal_name"]
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return JsonResponse({
                    "status": "missing_fields",
                    "message": f"Required fields are missing: {', '.join(missing_fields)}."
                }, status=400)

            # Validate expense categories to ensure all required types are present
            expenses = data.get("expenses", [])
            expense_categories = {"food", "housing", "health", "transportation", "university", "non-essential"}

            received_categories = set()
            for expense in expenses:
                if "type" in expense:
                    received_categories.add(expense["type"])

            missing_categories = [category for category in expense_categories if category not in received_categories]

            if missing_categories:
                return JsonResponse({
                    "status": "missing_expenses",
                    "message": f"Missing expense categories: {', '.join(missing_categories)}."
                }, status=400)

            # Create the financial plan using the service function
            plan_response = create_plan(data)            
            return JsonResponse(plan_response, status=200)

        except Exception as e:
            # Handle any server errors
            return JsonResponse({
                "status": "server_error",
                "message": "An error occurred while creating the user.",
                "details": str(e)
            }, status=500)
    else:
        # Return 405 if the request method is invalid
        return JsonResponse({
            "status": "invalid_method",
            "message": "Invalid request method."
        }, status=405)
   
   
def get_points_regression(request):
    """
    Handles the retrieval of regression points for a financial plan's progress over months.

    Args:
        request (HttpRequest): The HTTP request containing the regression data.

    Returns:
        JsonResponse: A JSON response containing the computed regression points or an error message.
    """
    if request.method == "POST":
        try:
            # Validate the user's session with cookie check
            cookie_response = check_cookie_for_functions(request)
            response_data = json.loads(cookie_response.content)
            if response_data.get("status") != "success":
                return cookie_response
            
            # Parse the JSON request body
            data = json.loads(request.body)
            
            # Extract necessary data fields for regression
            months = data.get("months")
            progress = data.get("progress")
            duration = data.get("duration")
            
            # Validate required fields
            if months is None or progress is None or duration is None:
                return JsonResponse({
                    "status": "missing_fields",
                    "message": "Required fields are missing: months, progress, duration."
                }, status=400)
            
            # Ensure 'months' and 'progress' lists have the same length
            if len(months) != len(progress):
                return JsonResponse({
                    "status": "invalid_data",
                    "message": "Length of 'months' and 'progress' must match."
                }, status=400)
            
            # Compute the regression points using the service function
            points_response = get_points(data)
            
            return JsonResponse(points_response, status=200)
        
        except Exception as e:
            # Handle any server errors
            return JsonResponse({
                "status": "server_error",
                "message": "An error occurred while creating the user.",
                "details": str(e)
            }, status=500)
    else:
        # Return 405 if the request method is invalid
        return JsonResponse({
            "status": "invalid_method",
            "message": "Invalid request method."
        }, status=405)
