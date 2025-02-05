from django.conf import settings  # Import Django settings to access environment-specific configurations
import firebase_admin  # Import Firebase Admin SDK to interact with Firebase services
from firebase_admin import credentials, firestore, auth  # Import specific modules for credentials, Firestore DB, and authentication

# Load Firebase credentials from the path defined in Django settings
cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)

# Initialize the Firebase application with the given credentials
firebase_admin.initialize_app(cred)

# Create a Firestore client instance to interact with the Firestore database
db = firestore.client()

# Create an instance for Firebase Authentication to handle user authentication tasks
firebase_auth = auth
