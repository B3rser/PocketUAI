from django.shortcuts import render
from django.http import JsonResponse
from core.services.firebase import db
from core.views.auth import check_cookie_for_functions
import json

def get_user(request, user_id):
    """
    This function is responsible for retrieving the user data based on the provided 
    user_id. It expects a POST request to fetch the user's information from the database. 
    Before accessing the user data, the function validates the user's session by checking 
    the cookie. If the user exists, the function returns the user data. If the user doesn't
    exist, a 404 error is returned. In case of any server error, the function returns a 
    500 error with details of the exception.
    
    """
    # Check if the request method is POST (used for retrieving data)
    if request.method == "POST":
        try:
            # Verify the user's session by checking the cookie
            cookie_response = check_cookie_for_functions(request, user_id)
            response_data = json.loads(cookie_response.content)
            if response_data.get("status") != "success":
                return cookie_response
            
            # Access the user document in the database using the "user_id"
            user_ref = db.collection("user").document(user_id)
            user = user_ref.get()

            # If the user exists, return the user data
            if user.exists:
                return JsonResponse({
                    "status": "success",
                    "message": "User retrieved successfully.",
                    "user": user.to_dict()  # Convert the document to a dictionary and return
                }, status=200)
            else:
                # If the user is not found, return an error
                return JsonResponse({
                    "status": "not_found",
                    "message": "User not found."
                }, status=404)
        except Exception as e:
            # If an unexpected error occurs, catch the exception and return a server error
            return JsonResponse({
                "status": "server_error",
                "message": "An error occurred while retrieving the user.",
                "details": str(e)  # Details of the error
            }, status=500)
    else:
        # If the method is not POST, return an invalid method error
        return JsonResponse({
            "status": "invalid_method",
            "message": "Invalid request method."
        }, status=405)


# def add_user(request):
#     if request.method == "POST":
#         try:
#             data = json.loads(request.body)
            
#             if "name" not in data or "email" not in data:
#                 return JsonResponse({
#                     "status": "missing_fields",
#                     "message": "Required fields are missing (e.g., name, email)."
#                 }, status=400)
            
#             doc_ref = db.collection("user").document()
#             doc_ref.set(data)
#             return JsonResponse({
#                 "status": "success",
#                 "message": "User added successfully.",
#                 "id": doc_ref.id
#             }, status=201)
#         except Exception as e:
#             return JsonResponse({
#                 "status": "server_error",
#                 "message": "An error occurred while adding the user.",
#                 "details": str(e)
#             }, status=500)
#     else:
#         return JsonResponse({
#             "status": "invalid_method",
#             "message": "Invalid request method."
#         }, status=405)

def update_user(request, user_id):
    """
    This function is used to update the user's information in the database. It expects a PUT request, 
    which includes data that can be used to modify the user's profile. The function validates the 
    session by checking the user's cookie, filters the provided data based on the allowed fields 
    (name, last, email, income, and expenses), and then updates the user's information in the database. 
    If the user exists, the data is updated; if the user does not exist, a 404 error is returned. 
    In case of any server error, a 500 error with the exception details is returned.

    """
    # Check if the request method is PUT (used for updating data)
    if request.method == "PUT":
        try:
            # Parse the request body to get the data sent for the update
            data = json.loads(request.body)
            
            # Verify the user's session by checking the cookie
            cookie_response = check_cookie_for_functions(request, user_id)
            response_data = json.loads(cookie_response.content)
            if response_data.get("status") != "success":
                return cookie_response
            
            # Define the allowed fields that can be updated
            allowed_fields = ["name", "last", "email", "income", "expenses"]
            # Filter the data to only include the allowed fields
            filtered_data = {key: value for key, value in data.items() if key in allowed_fields}
            
            # If no valid fields are provided for the update, return an error
            if not filtered_data:
                return JsonResponse({
                    "status": "missing_fields",
                    "message": "No valid fields provided for the update."
                }, status=400)

            # Access the user document in the database using the "user_id"
            doc_ref = db.collection("user").document(user_id)
            doc = doc_ref.get()

            # If the user exists, update the user data with the filtered data
            if doc.exists:
                doc_ref.update(filtered_data)
                return JsonResponse({
                    "status": "success",
                    "message": "User updated successfully."
                }, status=200)
            else:
                # If the user does not exist, return a "not found" error
                return JsonResponse({
                    "status": "not_found",
                    "message": "User not found."
                }, status=404)
        except Exception as e:
            # If an unexpected error occurs, catch the exception and return a server error
            return JsonResponse({
                "status": "server_error",
                "message": "An error occurred while updating the user.",
                "details": str(e)  # Details of the error
            }, status=500)
    else:
        # If the method is not PUT, return an invalid method error
        return JsonResponse({
            "status": "invalid_method",
            "message": "Invalid request method."
        }, status=405)


# def delete_user(request, user_id):
#     if request.method == "DELETE":
#         try:
#             doc_ref = db.collection("user").document(user_id)
#             doc = doc_ref.get()

#             if doc.exists:
#                 doc_ref.delete()
#                 return JsonResponse({
#                     "status": "success",
#                     "message": "User deleted successfully."
#                 }, status=200)
#             else:
#                 return JsonResponse({
#                     "status": "not_found",
#                     "message": "User not found."
#                 }, status=404)
#         except Exception as e:
#             return JsonResponse({
#                 "status": "server_error",
#                 "message": "An error occurred while deleting the user.",
#                 "details": str(e)
#             }, status=500)
#     else:
#         return JsonResponse({
#             "status": "invalid_method",
#             "message": "Invalid request method."
#         }, status=405)
