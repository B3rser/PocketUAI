import numpy as np  # Library for numerical computations
import matplotlib.pyplot as plt  # Library for plotting (though not used here)
from sklearn.preprocessing import PolynomialFeatures  # To create polynomial features for regression
from sklearn.linear_model import LinearRegression  # Linear regression model

def get_points(data):
    """
    Generates a financial progress projection based on the user's monthly input and a polynomial regression model.
    
    Parameters:
    data (dict): Dictionary containing the following keys:
        - "months" (list or array): Months corresponding to user progress data.
        - "progress" (list or array): User's financial progress for each month.
        - "duration" (int): Total number of months to project.
        - "poly_degree" (int, optional): Degree of the polynomial for the regression model (default is 3).

    Returns:
    dict: Result dictionary containing:
        - "status" (str): Status message, either "success" or "server_error".
        - "message" (str): Descriptive message of the operation result.
        - "data" (dict, optional): Contains:
            - "all_months" (list): List of all months, including projected ones.
            - "projection" (list): List of predicted financial progress values.
        - "details" (str, optional): Error details if an exception occurs.
    """
    try:
        # Convert months and progress data to NumPy arrays
        months = np.array(data.get("months"))
        progress = np.array(data.get("progress"))

        # Get the total duration and polynomial degree for the regression
        duration = data.get("duration")
        poly_degree = data.get("poly_degree", 1)

        # Transform the input features to polynomial features
        poly = PolynomialFeatures(degree=poly_degree)
        X = poly.fit_transform(months.reshape(-1, 1))

        # Initialize and train the linear regression model
        model = LinearRegression()
        model.fit(X, progress)

        # Generate month indices for the entire duration, including future projections
        all_months = np.arange(0, duration + 1).reshape(-1, 1)

        # Transform the month indices into polynomial features
        X_all_months = poly.transform(all_months)

        # Predict the progress for all months
        projection = model.predict(X_all_months)

        # Return the projection results as a success response
        return {
            "status": "success",
            "message": "Projection generated successfully.",
            "data": {
                "all_months": all_months.flatten().tolist(),
                "projection": projection.tolist(),
            }
        }

    except Exception as e:
        # Return error details in case of a failure
        return {
            "status": "server_error",
            "message": "An error occurred while generating the projection.",
            "details": str(e)
        }
