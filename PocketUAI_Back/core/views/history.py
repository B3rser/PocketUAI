from django.shortcuts import render
from django.http import JsonResponse
from core.services.firebase import db
from core.views.auth import check_cookie_for_functions
import json

# This function retrieves the user's history based on the user ID.
# It accepts POST requests and expects to get the history of a user from the "history" collection in the database.

def get_history(request, user_id):
    # Check if the HTTP request method is POST
    if request.method == "POST":
        try:
            # Check user session and validate the request
            cookie_response = check_cookie_for_functions(request, user_id)
            response_data = json.loads(cookie_response.content)
            
            # If the session is not valid, return the response from the cookie check
            if response_data.get("status") != "success":
                return cookie_response
            
            # Query the database for history of the specified user
            history_ref = db.collection("history")
            query = history_ref.where("id_user", "==", user_id).get()
            
            # Check if the query returns any history data
            if query:
                # Convert the retrieved documents to dictionaries and return them in the response
                history_list = [{**doc.to_dict(), "id": doc.id} for doc in query]
                return JsonResponse({
                    "status": "success",
                    "message": "History retrieved successfully.",
                    "history": history_list
                }, status=200)
            else:
                # If no history data is found for the user, return a "not found" response
                return JsonResponse({
                    "status": "not_found",
                    "message": "No history found for the user."
                }, status=404)
        except Exception as e:
            # Handle any errors that occur during the process and return a server error response
            return JsonResponse({
                "status": "server_error",
                "message": "An error occurred while retrieving the history.",
                "details": str(e)
            }, status=500)
    else:
        # If the request method is not POST, return a method not allowed response
        return JsonResponse({
            "status": "invalid_method",
            "message": "Invalid request method."
        }, status=405)


def add_history(request):
    
    # This function adds a new history record for a user.
    # It accepts POST requests and adds a history entry to the "history" collection in the database.

    # Check if the HTTP request method is POST
    if request.method == "POST":
        try:
            # Parse the incoming JSON request body
            data = json.loads(request.body)
            
            # Check user session and validate the request
            cookie_response = check_cookie_for_functions(request)
            response_data = json.loads(cookie_response.content)
            
            # If the session is not valid, return the response from the cookie check
            if response_data.get("status") != "success":
                return cookie_response
            
            # Retrieve user ID from session data
            user_id = response_data.get("user", {}).get("uid")
            if user_id is None:
                return JsonResponse({
                    "status": "invalid_cookie",
                    "message": "Failed to retrieve user ID from session."
                }, status=401)
                
            # Retrieve the required fields from the request data
            month = data.get("month")
            expenses = data.get("expenses")
            saving = data.get("saving")

            # Check if any required fields are missing
            if month is None or expenses is None or saving is None :
                return JsonResponse({
                    "status": "missing_fields",
                    "message": "All required fields must be provided: month, expenses, saving."
                }, status=400)
                
            # Create the history data to be added to the database
            history_data = {
                "month": month,
                "expenses": expenses,
                "saving": saving,
                "id_user": user_id,
            }
            
            # Add the history data to the "history" collection in the database
            doc_ref = db.collection("history").document()
            doc_ref.set(history_data)
            
            # Return a success response with the document ID
            return JsonResponse({
                "status": "success",
                "message": "History added successfully.",
                "id": doc_ref.id
            }, status=201)
        except Exception as e:
            # Handle any errors that occur during the process and return a server error response
            return JsonResponse({
                "status": "server_error",
                "message": "An error occurred while adding the history.",
                "details": str(e)
            }, status=500)
    else:
        # If the request method is not POST, return a method not allowed response
        return JsonResponse({
            "status": "invalid_method",
            "message": "Invalid request method."
        }, status=405)

# This function updates an existing history record for a user.
# It accepts PUT requests and updates a specific history entry in the "history" collection in the database.

def update_history(request, history_id):
    # Check if the HTTP request method is PUT
    if request.method == "PUT":
        try:
            # Parse the incoming JSON request body
            data = json.loads(request.body)
            
            # Check user session and validate the request
            cookie_response = check_cookie_for_functions(request)
            response_data = json.loads(cookie_response.content)
            
            # If the session is not valid, return the response from the cookie check
            if response_data.get("status") != "success":
                return cookie_response
            
            # Define allowed fields for updating the history record
            allowed_fields = ["month", "expenses", "saving"]
            
            # Filter the data to keep only the allowed fields
            filtered_data = {key: value for key, value in data.items() if key in allowed_fields}
            
            # If no valid fields were provided, return a response indicating missing fields
            if not filtered_data:
                return JsonResponse({
                    "status": "missing_fields",
                    "message": "No valid fields provided for the update."
                }, status=400)
            
            # Retrieve the history document using the provided history ID
            doc_ref = db.collection("history").document(history_id)
            doc = doc_ref.get()

            # If the document exists, update it with the filtered data
            if doc.exists:
                doc_ref.update(filtered_data)
                return JsonResponse({
                    "status": "success",
                    "message": "History updated successfully."
                }, status=200)
            else:
                # If the document does not exist, return a "not found" response
                return JsonResponse({
                    "status": "not_found",
                    "message": "History not found."
                }, status=404)
        except Exception as e:
            # Handle any errors that occur during the process and return a server error response
            return JsonResponse({
                "status": "server_error",
                "message": "An error occurred while updating the history.",
                "details": str(e)
            }, status=500)
    else:
        # If the request method is not PUT, return a method not allowed response
        return JsonResponse({
            "status": "invalid_method",
            "message": "Invalid request method."
        }, status=405)


def delete_history(request, history_id):
    
    # This function deletes a specific history record for a user.
    # It accepts DELETE requests and removes a history entry from the "history" collection in the database.

    # Check if the HTTP request method is DELETE
    if request.method == "DELETE":
        try:
            # Check user session and validate the request
            cookie_response = check_cookie_for_functions(request)
            response_data = json.loads(cookie_response.content)
            
            # If the session is not valid, return the response from the cookie check
            if response_data.get("status") != "success":
                return cookie_response
            
            # Retrieve the history document using the provided history ID
            doc_ref = db.collection("history").document(history_id)
            doc = doc_ref.get()

            # If the document exists, delete it
            if doc.exists:
                doc_ref.delete()
                return JsonResponse({
                    "status": "success",
                    "message": "History deleted successfully."
                }, status=200)
            else:
                # If the document does not exist, return a "not found" response
                return JsonResponse({
                    "status": "not_found",
                    "message": "History not found."
                }, status=404)
        except Exception as e:
            # Handle any errors that occur during the process and return a server error response
            return JsonResponse({
                "status": "server_error",
                "message": "An error occurred while deleting the history.",
                "details": str(e)
            }, status=500)
    else:
        # If the request method is not DELETE, return a method not allowed response
        return JsonResponse({
            "status": "invalid_method",
            "message": "Invalid request method."
        }, status=405)
        
def delete_all_history(request, user_id):
    
    # This function deletes all history records for a specific user.
    # It accepts DELETE requests and removes all history entries for a given user from the "history" collection in the database.

    # Check if the HTTP request method is DELETE
    if request.method == "DELETE":
        try:
            # Check user session and validate the request
            cookie_response = check_cookie_for_functions(request, user_id)
            response_data = json.loads(cookie_response.content)
            
            # If the session is not valid, return the response from the cookie check
            if response_data.get("status") != "success":
                return cookie_response
            
            # Retrieve all history records for the user using the provided user ID
            history_ref = db.collection("history")
            query = history_ref.where("id_user", "==", user_id).get()

            # If no history records are found for the user, return a "not found" response
            if not query:
                return JsonResponse({
                    "status": "not_found",
                    "message": "No history found for the user."
                }, status=404)
                
            # Delete all history records for the user
            for doc in query:
                doc.reference.delete()
                
            # Return a success response after deleting all history records
            return JsonResponse({
                "status": "success",
                "message": f"All history records for user '{user_id}' were deleted successfully."
            }, status=200)
            
        except Exception as e:
            # Handle any errors that occur during the process and return a server error response
            return JsonResponse({
                "status": "server_error",
                "message": "An error occurred while deleting the history.",
                "details": str(e)
            }, status=500)
    else:
        # If the request method is not DELETE, return a method not allowed response
        return JsonResponse({
            "status": "invalid_method",
            "message": "Invalid request method."
        }, status=405)
