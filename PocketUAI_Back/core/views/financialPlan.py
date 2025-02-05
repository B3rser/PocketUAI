from django.shortcuts import render  # Provides shortcuts for view rendering
from django.http import JsonResponse  # Handles JSON responses for API endpoints
from core.services.firebase import db  # Firebase database client for Firestore
from core.views.auth import check_cookie_for_functions  # Middleware to verify user authentication through cookies
from datetime import datetime  # Module for handling date and time
import json  # Library for handling JSON data

def get_plan(request, plan_id):
    """
    Handles retrieving a specific financial plan by its unique ID.
    
    Args:
        request (HttpRequest): The incoming HTTP request object.
        plan_id (str): Unique identifier for the financial plan.

    Returns:
        JsonResponse: A JSON response with the plan data or an error message.
    """
    # Check if the request is a POST request
    if request.method == "POST":
        try:
            # Check if the user is authorized using cookies
            cookie_response = check_cookie_for_functions(request, plan_id)
            response_data = json.loads(cookie_response.content)
            
            # If cookie validation fails, return the cookie_response
            if response_data.get("status") != "success":
                return cookie_response
            
            # Reference the specific financial plan in the Firestore database
            plans_ref = db.collection("financialPlan").document(plan_id)
            query = plans_ref.get()

            # Check if the financial plan exists in the database
            if query.exists:
                return JsonResponse({
                    "status": "success",
                    "message": "Plan retrieved successfully.",
                    "financialPlan": query.to_dict() # Return the plan data as a dictionary
                }, status=200)
            else:
                return JsonResponse({
                    "status": "not_found",
                    "message": "No plan found for the user." # Notify the user if no plan was found
                }, status=404)
        
        # Handle any server errors during the process
        except Exception as e:
            return JsonResponse({
                "status": "server_error",
                "message": "An error occurred while retrieving the plan.", # General server error message
                "details": str(e) # Include exception details for debugging
            }, status=500)
    else:
        # Return a 405 response if the method is not POST
        return JsonResponse({
            "status": "invalid_method",
            "message": "Invalid request method." # Notify the user of the incorrect request method
        }, status=405)

def add_plan(request):
    """
    Handles the creation of a new financial plan for a user.
    
    Args:
        request (HttpRequest): The incoming HTTP request object containing the financial plan data.

    Returns:
        JsonResponse: A JSON response indicating the success or failure of the plan creation.
    """
    # Ensure the request is a POST request
    if request.method == "POST":
        try:
            # Parse the request body to extract the JSON data
            data = json.loads(request.body)
            
            # Check if the user is authorized by validating the cookie
            cookie_response = check_cookie_for_functions(request)
            response_data = json.loads(cookie_response.content)
            
            # Return an error response if cookie validation fails
            if response_data.get("status") != "success":
                return cookie_response
            
            # Extract the user ID from the cookie response
            user_id = response_data.get("user", {}).get("uid")
            if user_id is None:
                return JsonResponse({
                    "status": "invalid_cookie",
                    "message": "Failed to retrieve user ID from session."  # Notify if the user ID is missing
                }, status=401)
                
            # Extract required fields from the request data
            expenses = data.get("expenses")
            saving = data.get("saving")
            duration = data.get("duration")
            goal_name = data.get("goal_name")
            goal = data.get("goal")
            date = data.get("date", datetime.now().strftime("%Y-%m-%d"))  # Default to the current date if not provided
            
            # Validate that all required fields are present
            if expenses is None or saving is None or duration is None or goal_name is None or goal is None:
                return JsonResponse({
                    "status": "missing_fields",
                    "message": "All required fields must be provided: expenses, saving, duration, goal_name, goal."  # Error if any field is missing
                }, status=400)

            # Prepare the financial plan data for storage
            plan_data = {
                "expenses": expenses,
                "saving": saving,
                "duration": duration,
                "goal_name": goal_name,
                "goal": goal,
                "date": date,
            }
                
            # Reference to the user's document in the financialPlan Firestore collection
            doc_ref = db.collection("financialPlan").document(user_id)
            
            # Save the financial plan data in Firestore
            doc_ref.set(plan_data)
            
            # Return a success response with the document ID
            return JsonResponse({
                "status": "success",
                "message": "Plan added successfully.",
                "id": doc_ref.id  # Provide the document ID for reference
            }, status=201)
        
        # Handle any server errors during the process
        except Exception as e:
            return JsonResponse({
                "status": "server_error",
                "message": "An error occurred while adding the plan.",  # General error message
                "details": str(e)  # Include exception details for debugging
            }, status=500)
    else:
        # Return a 405 response if the request method is not POST
        return JsonResponse({
            "status": "invalid_method",
            "message": "Invalid request method."  # Notify the user of the incorrect request method
        }, status=405)


def update_plan(request, plan_id):
    """
    Updates an existing financial plan for a specific user.
    
    Args:
        request (HttpRequest): The incoming HTTP request containing the updated plan data.
        plan_id (str): The ID of the financial plan to be updated.

    Returns:
        JsonResponse: A JSON response indicating the success or failure of the update operation.
    """
    # Ensure the request method is PUT
    if request.method == "PUT":
        try:
            # Parse the request body to extract the JSON data
            data = json.loads(request.body)
            
            # Validate user authorization by checking the session cookie
            cookie_response = check_cookie_for_functions(request, plan_id)
            response_data = json.loads(cookie_response.content)
            
            # Return an error response if cookie validation fails
            if response_data.get("status") != "success":
                return cookie_response
            
            # Define the list of fields that are allowed to be updated
            allowed_fields = ["expenses", "saving", "duration", "goal_name", "goal", "date"]
            
            # Filter the input data to only include allowed fields
            filtered_data = {key: value for key, value in data.items() if key in allowed_fields}
            
            # Return an error if no valid fields are provided
            if not filtered_data:
                return JsonResponse({
                    "status": "missing_fields",
                    "message": "No valid fields provided for the update."  # Notify if no updatable fields are found
                }, status=400)
            
            # Reference the financial plan document by ID
            doc_ref = db.collection("financialPlan").document(plan_id)
            
            # Check if the document exists in Firestore
            doc = doc_ref.get()

            if doc.exists:
                # Update the document with the filtered data
                doc_ref.update(filtered_data)
                return JsonResponse({
                    "status": "success",
                    "message": "Plan updated successfully."  # Confirm the successful update
                }, status=200)
            else:
                # Return a 404 response if the plan doesn't exist
                return JsonResponse({
                    "status": "not_found",
                    "message": "Plan not found."  # Notify that the plan was not found
                }, status=404)
        except Exception as e:
            # Handle any server errors during the update process
            return JsonResponse({
                "status": "server_error",
                "message": "An error occurred while updating the plan.",  # General error message
                "details": str(e)  # Include exception details for debugging
            }, status=500)
    else:
        # Return a 405 response if the request method is not PUT
        return JsonResponse({
            "status": "invalid_method",
            "message": "Invalid request method."  # Notify the user of the incorrect request method
        }, status=405)


def delete_plan(request, plan_id):
    """
    Deletes a specific financial plan from the database.

    Args:
        request (HttpRequest): The incoming HTTP request to delete a financial plan.
        plan_id (str): The ID of the financial plan to be deleted.

    Returns:
        JsonResponse: A JSON response indicating the success or failure of the deletion operation.
    """
    # Ensure the request method is DELETE
    if request.method == "DELETE":
        try:
            # Validate user authorization by checking the session cookie
            cookie_response = check_cookie_for_functions(request, plan_id)
            response_data = json.loads(cookie_response.content)
            
            # Return an error response if cookie validation fails
            if response_data.get("status") != "success":
                return cookie_response
            
            # Reference the financial plan document by ID
            doc_ref = db.collection("financialPlan").document(plan_id)
            doc = doc_ref.get()

            if doc.exists:
                # Delete the document if it exists
                doc_ref.delete()
                return JsonResponse({
                    "status": "success",
                    "message": f"Plan with ID '{plan_id}' deleted successfully."  # Confirm the successful deletion
                }, status=200)
            else:
                # Return a 404 response if the plan doesn't exist
                return JsonResponse({
                    "status": "not_found",
                    "message": "Plan not found."  # Notify that the plan was not found
                }, status=404)
        except Exception as e:
            # Handle any server errors during the deletion process
            return JsonResponse({
                "status": "server_error",
                "message": "An error occurred while deleting the plan.",  # General error message
                "details": str(e)  # Include exception details for debugging
            }, status=500)
    else:
        # Return a 405 response if the request method is not DELETE
        return JsonResponse({
            "status": "invalid_method",
            "message": "Invalid request method."  # Notify the user of the incorrect request method
        }, status=405)

