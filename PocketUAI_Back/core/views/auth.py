from django.shortcuts import render
from django.http import JsonResponse
from core.services.firebase import db, firebase_auth
import datetime
import json


#status: success, no_cookie, invalid_cookie, unknown, invalid_method, server_error, missing_fields, not_found, unauthorized
# Explanation of Response Statuses
#
# 1. success:
#    - Indicates that the operation was successful. The response includes a success message
#      and relevant data (e.g., user information or session details).
#    - Example use case: Successful user login, successful creation of a user, or a valid session.
#
# 2. no_cookie:
#    - This status is returned when no session cookie is found in the request. It typically means 
#      the user is not logged in or their session has expired.
#    - Example use case: The user makes a request that requires authentication, but no session cookie is present.
#
# 3. invalid_cookie:
#    - This status indicates that the session cookie provided is invalid or has expired. 
#      It prompts the user to log in again to obtain a valid session.
#    - Example use case: A request is made with a session cookie that cannot be verified or has been revoked.
#
# 4. unknown:
#    - This status is used when an unexpected error occurs during the processing of the request. 
#      It generally indicates a problem on the server-side that is not anticipated or handled by specific error cases.
#    - Example use case: A system error occurs that prevents the function from completing successfully, 
#      such as a database failure or a server crash.
#
# 5. invalid_method:
#    - This status indicates that the request method used is not valid for the specific API endpoint. 
#      For example, if a POST request is expected but a GET request is sent, this status will be returned.
#    - Example use case: A user attempts to access an endpoint using an incorrect HTTP method (e.g., GET instead of POST).
#
# 6. missing_fields:
#    - This status is returned when required fields are missing in the request body. 
#      The response provides a message indicating which fields are missing.
#    - Example use case: A user attempts to create a new user but fails to provide essential fields such as email or password.
#
# 7. not_found:
#    - This status indicates that the requested resource could not be found. It is commonly used in the case of 
#      invalid endpoints or non-existent user data.
#    - Example use case: A user attempts to access a resource (e.g., a user profile) that doesn't exist.
#
# 8. unauthorized:
#    - This status is returned when the user is not authorized to access the requested resource. 
#      It may occur when the user’s session is invalid or they do not have the proper permissions.
#    - Example use case: A user attempts to access another user's data without the proper authorization.
#
# 9. server_error:
#    - This status indicates that an unexpected error occurred on the server side. 
#      It is typically used when something goes wrong during the request processing that doesn't fall under 
#      specific error statuses (e.g., database failures, system errors).
#    - Example use case: A general server issue or unhandled exception during the processing of a request.

def create_user(request):
    """
    Creates a new user by accepting a POST request with the user's data, such as name, email, password, income, and expenses. 
    The function creates a new user in Firebase Authentication and stores the user data in the Firestore database.

    The function checks that all required fields are provided (name, last name, email, and password) and returns an error response 
    if any are missing. If successful, it returns a success response with the user's unique ID and email. If any error occurs during 
    the user creation process, a server error response is returned with details of the exception.

    Parameters:
    request (HttpRequest): The HTTP request containing the user data in JSON format.

    Returns:
    JsonResponse: A JSON response containing the status of the user creation process. 
                  Possible statuses: 
                  - "success" if the user is created successfully,
                  - "missing_fields" if any required fields are missing,
                  - "server_error" if an error occurs during the process,
                  - "invalid_method" if the request method is not POST.
    """
    if request.method == "POST":
        try:
            # Parse the JSON body of the request
            data = json.loads(request.body)
            name = data.get("name")
            last = data.get("last")
            email = data.get("email")
            password = data.get("password")
            income = data.get("income", 0)
            expenses = data.get("expenses", [])

            # Check if all required fields are provided
            if email is None or password is None or name is None or last is None:
                return JsonResponse({
                    "status": "missing_fields",
                    "message": "All fields are required."
                }, status=400)

            # Create user in Firebase Authentication
            user = firebase_auth.create_user(
                email=email,
                password=password,
                display_name=f"{name} {last}",
            )

            # Prepare user data for Firestore
            user_data = {
                "name": name,
                "last": last,
                "email": email,
                "income": income,
                "expenses": expenses,
            }
            
            # Store user data in Firestore
            db.collection("user").document(user.uid).set(user_data)

            # Return success response with user details
            return JsonResponse({
                "status": "success",
                "message": "User created successfully",
                "user_id": user.uid,
                "email": email
            }, status=201)
        except Exception as e:
            # Return error response if an exception occurs
            return JsonResponse({
                "status": "server_error",
                "message": "An error occurred while creating the user.",
                "details": str(e)
            }, status=500)
    else:
        # Return error response if the request method is not POST
        return JsonResponse({
            "status": "invalid_method",
            "message": "Invalid request method."
        }, status=405)
  
def login_user(request):
    """
    Authenticates a user based on the provided ID token. The function verifies the ID token received in the request body,
    creates a session cookie for the authenticated user, and returns a success response with the user's information. 
    The session cookie is set in the HTTP response with a specified expiration time.

    If the ID token is missing or invalid, an error response is returned. If the authentication is successful, the 
    session cookie is set with a 10-day expiration, and a success message with the user's information is returned. 
    If any unexpected errors occur during the process, a server error response is returned.

    Parameters:
    request (HttpRequest): The HTTP request containing the user's ID token in JSON format.

    Returns:
    JsonResponse: A JSON response containing the status of the login process. 
                  Possible statuses:
                  - "success" if login is successful and the session cookie is set,
                  - "missing_fields" if the ID token is missing from the request,
                  - "server_error" if an error occurs during the authentication process,
                  - "invalid_method" if the request method is not POST.
    """
    if request.method == "POST":
        try:
            # Parse the JSON body of the request
            data = json.loads(request.body)
            id_token = data.get("idToken")

            # Check if the id_token is provided
            if not id_token:
                return JsonResponse({
                    "status": "missing_fields",
                    "message": "User id_token not found."
                }, status=400)

            # Verify the ID token using Firebase Authentication
            decoded_claims = firebase_auth.verify_id_token(id_token)
            
            # Create session cookie with a 10-day expiration time
            expires_in = datetime.timedelta(days=10)
            session_cookie = firebase_auth.create_session_cookie(id_token, expires_in=expires_in)
            
            # Prepare response with user information and success message
            response = JsonResponse({
                "status": "success",
                "message": "Login successful.",
                "user": decoded_claims
            }, status=201)
            
            # Set the session cookie in the response
            expires = datetime.datetime.now() + expires_in
            response.set_cookie(
                'session', session_cookie, expires=expires, httponly=True, secure=True)
            
            return response
        except Exception as e:
            # Return error response if an exception occurs
            return JsonResponse({
                "status": "server_error",
                "message": "An unexpected error occurred. Please try again later.",
                "details": str(e)
            }, status=500)
    else:
       # Return error response if the request method is not POST
       return JsonResponse({
            "status": "invalid_method",
            "message": "Invalid request method."
        }, status=405)

def check_cookie_user(request):
    """
    Checks if the session cookie provided in the request is valid and not expired. If the session cookie is found and valid,
    the user's claims are returned with a success message. If the session cookie is invalid or expired, the user is prompted 
    to log in again, and the session cookie is removed from the response. If any unexpected errors occur during the process, 
    a server error response is returned.

    Parameters:
    request (HttpRequest): The HTTP request containing the session cookie to verify.

    Returns:
    JsonResponse: A JSON response containing the status of the session validation process. 
                  Possible statuses:
                  - "success" if the session cookie is valid and the user is authenticated,
                  - "no_cookie" if the session cookie is not found in the request,
                  - "invalid_cookie" if the session cookie is invalid or expired,
                  - "unknown" if an unexpected error occurs during session verification,
                  - "invalid_method" if the request method is not POST.
    """
    if request.method == "POST":
        # Retrieve the session cookie from the request
        session_cookie = request.COOKIES.get('session')
        
        # If no session cookie is found, return an error response
        if not session_cookie:
            return JsonResponse({
                "status": "no_cookie",
                "message": "Session cookie not found. Please log in again."
            }, status=400)

        try:
            # Verify the session cookie using Firebase Authentication
            decoded_claims = firebase_auth.verify_session_cookie(session_cookie, check_revoked=True)
            
            # If the session cookie is valid, return a success response with the user claims
            return JsonResponse({
                "status": "success",
                "message": "Session is valid",
                "user": decoded_claims
            }, status=200)
        
        except firebase_auth.InvalidSessionCookieError:
            # If the session cookie is invalid or expired, return an error response and clear the cookie
            response = JsonResponse({
                "status": "invalid_cookie",
                "message": "Session cookie is invalid or expired. Please log in again."
            }, status=401)
            response.set_cookie('session', '', expires=0)
            return response
        
        except Exception as e:
            # If an unexpected error occurs, return a server error response
            return JsonResponse({
                "status": "unknown",
                "message": "An unexpected error occurred. Please try again later.",
                "details": str(e)
            }, status=500)
    
    else:
        # Return an error response if the request method is not POST
        return JsonResponse({
            "status": "invalid_method",
            "message": "Invalid request method."
        }, status=405)

        
def logout_user(request):
    """
    Logs out the user by removing the session cookie from the client's browser. A success message is returned
    confirming the session has been closed successfully. If the request method is not POST, an error message 
    indicating an invalid method is returned.

    Parameters:
    request (HttpRequest): The HTTP request that triggers the logout process.

    Returns:
    JsonResponse: A JSON response containing the status of the logout process.
                  Possible statuses:
                  - "success" if the session was closed successfully.
                  - "invalid_method" if the request method is not POST.
    """
    if request.method == "POST":
        # Create the response confirming successful logout
        response = JsonResponse({
            'status': 'success',
            'message': 'Session closed successfully'
        }, status=200)
        
        # Remove the session cookie by setting it to expire immediately
        response.set_cookie('session', expires=0)
        
        return response
    else:
        # Return error if the request method is not POST
        return JsonResponse({
            "status": "invalid_method",
            "message": "Invalid request method."
        }, status=405)

def check_cookie_for_functions(request, id=None):
    """
    Verifies the validity of the session cookie. If the session cookie is valid, the user's claims are returned
    with a success message. If an ID is provided, the function checks if the user ID in the session matches the 
    provided ID; if they don't match, an unauthorized response is returned. If the session cookie is invalid or 
    expired, the user is prompted to log in again. In case of unexpected errors, a server error response is returned.

    Parameters:
    request (HttpRequest): The HTTP request containing the session cookie to verify.
    id (str, optional): The user ID to check against the session. If provided, the function ensures the user 
                         ID in the session matches this ID. Defaults to None.

    Returns:
    JsonResponse: A JSON response containing the status of the session verification process.
                  Possible statuses:
                  - "success" if the session cookie is valid and the user ID matches (if provided),
                  - "no_cookie" if the session cookie is not found in the request,
                  - "invalid_cookie" if the session cookie is invalid or expired,
                  - "unauthorized" if the user ID in the session does not match the provided ID,
                  - "unknown" if an unexpected error occurs during the process,
                  - "invalid_method" if the request method is not POST.
    """
    # Retrieve the session cookie from the request
    session_cookie = request.COOKIES.get('session')

    # If no session cookie is found, return an error response
    if not session_cookie:
        return JsonResponse({
            "status": "no_cookie",
            "message": "Session cookie not found. Please log in again."
        }, status=400)

    try:
        # Verify the session cookie using Firebase Authentication
        decoded_claims = firebase_auth.verify_session_cookie(session_cookie, check_revoked=True)

        # If an ID is provided and it doesn't match the user ID in the session, return an unauthorized response
        if id and decoded_claims.get("uid") != id:
            response = JsonResponse({
                "status": "unauthorized",
                "message": "User ID does not match the session."
            }, status=403)
            response.set_cookie('session', '', expires=0)
            return response

        # If the session is valid, return the user claims with a success message
        return JsonResponse({
            "status": "success",
            "message": "Session is valid",
            "user": decoded_claims
        }, status=200)

    except firebase_auth.InvalidSessionCookieError:
        # If the session cookie is invalid or expired, return an error response and clear the cookie
        response = JsonResponse({
            "status": "invalid_cookie",
            "message": "Session cookie is invalid or expired. Please log in again."
        }, status=401)
        response.set_cookie('session', '', expires=0)
        return response

    except Exception as e:
        # If an unexpected error occurs, return a server error response
        return JsonResponse({
            "status": "unknown",
            "message": "An unexpected error occurred. Please try again later.",
            "details": str(e)
        }, status=500)
