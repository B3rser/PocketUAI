from django.shortcuts import render
from django.http import JsonResponse
from core.services.firebase import db
from core.views.auth import check_cookie_for_functions
import json

def get_tracking(request, user_id):
    """
    Retrieve tracking data for a specific user.

    This function handles a POST request to retrieve tracking information stored in the "tracking" collection
    for a given user identified by `user_id`. It performs cookie validation, fetches the tracking document from
    the database, and returns the tracking data if it exists.

    Parameters:
    - request (HttpRequest): The HTTP request object containing metadata about the request.
    - user_id (str): The unique identifier of the user whose tracking data is being requested.

    Workflow:
    1. Validate the user's session by checking the cookie using `check_cookie_for_functions`.
    2. Retrieve the tracking document from the "tracking" collection using the `user_id`.
    3. Return the tracking data if found, or a "not found" response if no data is available.

    Returns:
    - JsonResponse: 
        - Success (200) with tracking data if found.
        - Not found (404) if no tracking data exists for the given user.
        - Server error (500) if an exception occurs.
        - Invalid method (405) if the request method is not POST.

    Error Handling:
    - Handles exceptions and returns appropriate error messages in the response.

    Example Response (Success):
    {
        "status": "success",
        "message": "Tracking data retrieved successfully.",
        "tracking": { ...tracking data... }
    }
    """
    if request.method == "POST":
        try:
            # Validate cookie and retrieve user information
            cookie_response = check_cookie_for_functions(request, user_id)
            response_data = json.loads(cookie_response.content)
            if response_data.get("status") != "success":
                return cookie_response
            
            # Retrieve the tracking document for the user
            tracking_ref = db.collection("tracking").document(user_id)
            query = tracking_ref.get()

            if query.exists:
                return JsonResponse({
                    "status": "success",
                    "message": "Tracking data retrieved successfully.",
                    "tracking": query.to_dict()
                }, status=200)
            else:
                return JsonResponse({
                    "status": "not_found",
                    "message": "No tracking data found for the user and plan."
                }, status=404)
        except Exception as e:
            return JsonResponse({
                "status": "server_error",
                "message": "An error occurred while retrieving the tracking data.",
                "details": str(e)
            }, status=500)
    else:
        return JsonResponse({
            "status": "invalid_method",
            "message": "Invalid request method."
        }, status=405)


def add_tracking(request):
    """
    Add tracking data for a user.

    This function handles a POST request to store tracking information for a user. 
    It validates the request, retrieves the user ID from the session, and saves the 
    tracking data to the "tracking" collection in the database.

    Parameters:
    - request (HttpRequest): The HTTP request object containing the body with tracking data.

    Expected JSON Payload:
    {
        "month": "January",
        "saving": 1000,
        "advance": 50
    }

    Workflow:
    1. Parse and validate the JSON request payload.
    2. Validate the user's session using `check_cookie_for_functions` to retrieve the user ID.
    3. Ensure all required fields (`month`, `saving`, `advance`) are present in the payload.
    4. Save the tracking data to the database with the user ID as the document identifier.
    5. Return a success response with the document ID.

    Returns:
    - JsonResponse:
        - Success (201) if tracking data is added successfully.
        - Missing fields (400) if any required field is missing.
        - Invalid cookie (401) if user ID retrieval fails.
        - Server error (500) if an exception occurs.
        - Invalid method (405) if the request method is not POST.

    Error Handling:
    - Captures and returns detailed error messages when exceptions occur.

    Example Response (Success):
    {
        "status": "success",
        "message": "Tracking data added successfully.",
        "id": "<document_id>"
    }
    """
    if request.method == "POST":
        try:
            # Parse request data
            data = json.loads(request.body)

            # Validate the user session
            cookie_response = check_cookie_for_functions(request)
            response_data = json.loads(cookie_response.content)
            if response_data.get("status") != "success":
                return cookie_response
            
            # Retrieve user ID from the session data
            user_id = response_data.get("user", {}).get("uid")
            if user_id is None:
                return JsonResponse({
                    "status": "invalid_cookie",
                    "message": "Failed to retrieve user ID from session."
                }, status=401)
            
            # Extract required fields
            month = data.get("month")
            saving = data.get("saving")
            advance = data.get("advance")
            
            if month is None or saving is None or advance is None:
                return JsonResponse({
                    "status": "missing_fields",
                    "message": "All required fields must be provided: month, saving, advance."
                }, status=400)

            # Create tracking data object
            tracking_data = {
                "month": month,
                "saving": saving,
                "advance": advance,
            }
            
            # Save tracking data to the database
            doc_ref = db.collection("tracking").document(user_id)
            doc_ref.set(tracking_data)
            
            return JsonResponse({
                "status": "success",
                "message": "Tracking data added successfully.",
                "id": doc_ref.id
            }, status=201)
        except Exception as e:
            return JsonResponse({
                "status": "server_error",
                "message": "An error occurred while adding the tracking data.",
                "details": str(e)
            }, status=500)
    else:
        return JsonResponse({
            "status": "invalid_method",
            "message": "Invalid request method."
        }, status=405)


def update_tracking(request, tracking_id):
    
    """
    This function is responsible for updating the tracking data of a user. It first 
    ensures that the request method is PUT (the correct method for updating resources). 
    Then it verifies the user's session using a cookie check. The function filters the fields 
    in the request body to only include valid fields (month, saving, advance) and updates the 
    tracking data for the given tracking_id in the database. If the provided fields are
    invalid or the document does not exist, appropriate error messages are returned. 
    If everything goes as expected, the tracking data is updated successfully.
    
    """
    # Check if the request method is PUT (used for updating resources)
    if request.method == "PUT":
        try:
            # Load the data from the request body (in JSON format)
            data = json.loads(request.body)
            
            # Verify the user's session by checking the cookie
            cookie_response = check_cookie_for_functions(request, tracking_id)
            response_data = json.loads(cookie_response.content)
            if response_data.get("status") != "success":
                return cookie_response
            
            # Define the allowed fields that can be updated: "month", "saving", "advance"
            allowed_fields = ["month", "saving", "advance"]
            
            # Filter the data to only keep valid fields (those in allowed_fields)
            filtered_data = {key: value for key, value in data.items() if key in allowed_fields}
            
            # If no valid fields are provided, return an error
            if not filtered_data:
                return JsonResponse({
                    "status": "missing_fields",
                    "message": "No valid fields provided for the update."
                }, status=400)
            
            # Access the tracking document in the database using the "tracking_id"
            doc_ref = db.collection("tracking").document(tracking_id)
            doc = doc_ref.get()

            # If the tracking document exists, update it with the filtered data
            if doc.exists:
                doc_ref.update(filtered_data)
                return JsonResponse({
                    "status": "success",
                    "message": "Tracking data updated successfully."
                }, status=200)
            else:
                # If the document is not found, return an error
                return JsonResponse({
                    "status": "not_found",
                    "message": "Tracking data not found."
                }, status=404)
        except Exception as e:
            # If an unexpected error occurs, catch the exception and return a server error
            return JsonResponse({
                "status": "server_error",
                "message": "An error occurred while updating the tracking data.",
                "details": str(e)  # Details of the error
            }, status=500)
    else:
        # If the method is not PUT, return an invalid method error
        return JsonResponse({
            "status": "invalid_method",
            "message": "Invalid request method."
        }, status=405)


def delete_tracking(request, tracking_id):
    
    """
    This function is responsible for deleting the tracking data of a user. 
    It first checks that the request method is DELETE, which is the correct method 
    for deleting resources. The function then validates the user's session through 
    a cookie check. If the tracking data corresponding to the tracking_id exists in
    the database, it is deleted. If the tracking data does not exist, an error message
    is returned. In case of any unexpected errors, the function catches them 
    and returns a server error message.
    
    """
    # Check if the request method is DELETE (used for deleting resources)
    if request.method == "DELETE":
        try:
            # Verify the user's session by checking the cookie
            cookie_response = check_cookie_for_functions(request, tracking_id)
            response_data = json.loads(cookie_response.content)
            if response_data.get("status") != "success":
                return cookie_response
            
            # Access the tracking document in the database using the "tracking_id"
            doc_ref = db.collection("tracking").document(tracking_id)
            doc = doc_ref.get()

            # If the tracking document exists, delete it
            if doc.exists:
                doc_ref.delete()
                return JsonResponse({
                    "status": "success",
                    "message": f"Tracking data with ID '{tracking_id}' deleted successfully."
                }, status=200)
            else:
                # If the document is not found, return an error
                return JsonResponse({
                    "status": "not_found",
                    "message": "Tracking data not found."
                }, status=404)
        except Exception as e:
            # If an unexpected error occurs, catch the exception and return a server error
            return JsonResponse({
                "status": "server_error",
                "message": "An error occurred while deleting the tracking data.",
                "details": str(e)  # Details of the error
            }, status=500)
    else:
        # If the method is not DELETE, return an invalid method error
        return JsonResponse({
            "status": "invalid_method",
            "message": "Invalid request method."
        }, status=405)

