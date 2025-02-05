import json
import pickle
from datetime import datetime
import pandas as pd
from sklearn.tree import DecisionTreeClassifier 
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # Gets the absolute path of the current file and sets BASE_DIR to its directory
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")  # Path to the serialized machine learning model
PLANS_PATH = os.path.join(BASE_DIR, "plans.json")  # Path to the JSON file containing base financial plans
MINS_PATH = os.path.join(BASE_DIR, "mins.json")  # Path to the JSON file containing minimum expense requirements
RULES_PATH = os.path.join(BASE_DIR, "association_rules_class.csv")  # Path to the CSV file containing association rules

def check_for_error(result):
    """
    Checks whether the provided result indicates an error.
    
    Parameters:
    result (dict): A dictionary possibly containing a "status" key.
    
    Returns:
    dict or None: The result if an error status is found, otherwise None.
    """
    if isinstance(result, dict) and result.get("status") != "successful":
        return result
    return None

def load_model():
    """
    Loads the machine learning model from the specified path.
    
    Returns:
    dict or object: The loaded model if successful, otherwise an error dictionary.
    
    Possible error statuses:
    - "load_error" if the file is missing, corrupted, or an unexpected error occurs.
    """
    try:
        with open(MODEL_PATH, 'rb') as f:
            return pickle.load(f)
    except FileNotFoundError:
        return {"status": "load_error", "message": f"Model file '{MODEL_PATH}' not found"}
    except pickle.UnpicklingError:
        return {"status": "load_error", "message": "Error unpickling the model. The file may be corrupted"}
    except Exception as e:
        return {"status": "load_error", "message": f"An unexpected error occurred: {e}"}

def load_rules():
    """
    Loads the association rules from a CSV file.
    
    Returns:
    pd.DataFrame or dict: The rules DataFrame if successful, otherwise an error dictionary.
    
    Possible error statuses:
    - "load_error" if the file is missing, empty, improperly formatted, or an unexpected error occurs.
    """
    try:
        rules_df = pd.read_csv(RULES_PATH)
        return rules_df
    except FileNotFoundError:
        return {"status": "load_error", "message": f"Rules file '{RULES_PATH}' not found."}
    except pd.errors.EmptyDataError:
        return {"status": "load_error", "message": "The rules file is empty."}
    except pd.errors.ParserError:
        return {"status": "load_error", "message": "Error parsing the rules file. Check the file format."}
    except Exception as e:
        return {"status": "load_error", "message": f"An unexpected error occurred: {e}"}

def load_plans():
    """
    Loads the base financial plans from a JSON file.
    
    Returns:
    dict: A dictionary with the status and either the plans or an error message.
    
    Possible error statuses:
    - "load_error" if the file is missing, improperly formatted, or an unexpected error occurs.
    """
    try:
        with open(PLANS_PATH, 'r') as file:
            plans = json.load(file)  
        return {"status": "successful", "plans": plans}
    except FileNotFoundError:
        return {"status": "load_error", "message": f"Plans file '{PLANS_PATH}' not found"}
    except json.JSONDecodeError:
        return {"status": "load_error", "message": "Error reading the plans file"}
    except Exception as e:
        return {"status": "load_error", "message": f"An unexpected error occurred: {e}"}

def load_minimums():
    """
    Loads the minimum expense requirements from a JSON file.
    
    Returns:
    dict: A dictionary with the status and either the minimums or an error message.
    
    Possible error statuses:
    - "load_error" if the file is missing, improperly formatted, or an unexpected error occurs.
    """
    try:
        with open(MINS_PATH, mode='r') as file:
            minimums = json.load(file)
        return {"status": "successful", "minimums": minimums}
    except FileNotFoundError:
        return {"status": "load_error", "message": "Minimums file not found"}
    except json.JSONDecodeError:
        return {"status": "load_error", "message": "Error reading the minimums file"}
    except Exception as e:
        return {"status": "load_error", "message": f"An unexpected error occurred: {e}"}

def process_transactions(user_data):
    """
    Processes user financial data to prepare it for further analysis.
    
    Parameters:
    user_data (dict): Dictionary containing user's financial data.
        Required keys: 'income' (float), 'last_saving' (float), 'expenses' (list of dicts).
        
    Returns:
    dict: 
        If successful, returns a dictionary with status 'successful' and the prepared data.
        If data is incomplete or incorrectly formatted, returns a dictionary with status 'load_error'.
    """
    income = user_data.get('income')
    last_saving = user_data.get('last_saving')
    expenses = user_data.get('expenses')

    if income is None or last_saving is None or not isinstance(expenses, list):
        return {"status": 'load_error', "message": "Invalid data: missing required fields or wrong format"}

    prepared_data = {
        "income": income,
        "last_saving": last_saving,
        "expenses": expenses
    }

    response = {
        "status": "successful",
        "prepared_data": prepared_data
    }
    return response

def process_goals(user_data):
    """
    Processes user goal data to prepare it for further analysis.
    
    Parameters:
    user_data (dict): Dictionary containing user's financial goal data.
        Required keys: 'goal' (float), 'duration' (int), 'goal_name' (str).
        
    Returns:
    dict: 
        If successful, returns a dictionary with status 'successful' and the prepared data.
        If data is incomplete, returns a dictionary with status 'load_error'.
    """
    goal = user_data.get('goal')
    duration = user_data.get('duration')
    goal_name = user_data.get('goal_name')

    if goal is None or duration is None or goal_name is None:
        return {"status": 'load_error', "message": "Incomplete data: missing required fields"}

    prepared_data = {
        "goal": goal,
        "duration": duration,
        "goal_name": goal_name,
    }

    response = {
        "status": "successful",
        "prepared_data": prepared_data
    }
    return response

def classify_data_dt(user_data, model):
    """
    Classifies financial data using a decision tree model.
    
    Parameters:
    user_data (dict): Dictionary containing financial data.
        Required keys: 'income' (float), 'expenses' (list of dicts).
    model (object): Trained decision tree model.
    
    Returns:
    dict:
        If successful, returns a dictionary with status 'successful' and the classification prediction.
        If data is incomplete or an error occurs during prediction, returns a dictionary with an appropriate error status.
    """
    income = user_data.get('income')
    expenses = user_data.get('expenses')

    if income is None or not isinstance(expenses, list):
        return {"status": "load_error", "message": "Invalid data: 'income' must be provided and 'expenses' must be a list"}

    expected_order = ["housing", "food", "transportation", "income", "non-essential", "health", "university"]
    
    # Extracting features from the expenses list
    features = [income] + [expense.get('expense', 0) for expense in expenses if isinstance(expense, dict)]
    feature_names = ["income"] + [expense.get('type', 0).lower().replace(" ", "_") 
                                   for i, expense in enumerate(expenses) if isinstance(expense, dict)]
    
    # Create a DataFrame and reorder the columns based on expected order
    features_df = pd.DataFrame([features], columns=feature_names)
    features_df = features_df[expected_order]

    try:
        prediction = model.predict(features_df)
    except Exception as e:
        return {"status": "exe_error", "message": f"Error during classification: {e}"}

    return {"status": "successful", "prediction": prediction.tolist()}

def classify_data_apriori(user_data, rules_df):
    """
    Classifies financial data using Apriori rules.
    
    Parameters:
    user_data (dict): Dictionary containing financial data.
        Required keys: 'income' (float), 'expenses' (list of dicts).
    rules_df (DataFrame): DataFrame containing Apriori rules with columns 'LeftHand' and 'RightHand'.
    
    Returns:
    dict:
        If successful, returns a dictionary with status 'successful' and the predicted class.
        If no matching class is found, returns a dictionary with status 'calc_error'.
        If data is incomplete, returns a dictionary with status 'load_error'.
    """
    income = user_data.get('income')
    expenses = user_data.get('expenses')

    if income is None or not isinstance(expenses, list):
        return {"status": "load_error", "message": "Invalid data: 'income' must be provided and 'expenses' must be a list"}

    # Extract features and feature names from user data
    features = [income] + [expense.get('expense', 0) for expense in expenses if isinstance(expense, dict)]
    feature_names = ["income"] + [expense.get('type', 0).lower().replace(" ", "_") 
                                  for expense in expenses if isinstance(expense, dict)]
    features_df = pd.DataFrame([features], columns=feature_names)

    class_counts = {}

    # Iterating through the rules to classify user data
    for _, row in rules_df.iterrows():
        clase = row["LeftHand"].split(" / ")[1].strip("',()")
        right_items = row["RightHand"].strip("()").split(", ")
        all_match = True

        # Matching user features against the rule conditions
        for item in right_items:
            if "/" in item:
                feature_range = item.strip("''").split("/")
                if len(feature_range) == 2:
                    feature = feature_range[0].strip()
                    min_val, max_val = map(float, feature_range[1].split("-"))

                    if feature in features_df.columns:
                        user_value = features_df.at[0, feature]
                        if not (min_val <= user_value <= max_val):
                            all_match = False

        if all_match:
            class_counts[clase] = class_counts.get(clase, 0) + 1  

    if class_counts:
        max_class = max(class_counts, key=class_counts.get)
        return {"status": "successful", "prediction": [max_class]}
    else:
        return {"status": "calc_error", "message": "No matching class found."}

def assign_plan(user_data, plans, model=None, rules=None, class_model="dt"):
    """
    Assigns a financial plan based on the user's financial data and classification results.
    
    Parameters:
    user_data (dict): Dictionary containing financial data.
        Required keys: 'income' (float), 'expenses' (list of dicts).
    plans (dict): Dictionary mapping plan names to plan details.
    model (object, optional): Trained decision tree model (required if class_model is 'dt').
    rules (DataFrame, optional): DataFrame containing Apriori rules (required if class_model is 'apriori').
    class_model (str): The classification model to use ('dt' for Decision Tree, 'apriori' for Apriori).
    
    Returns:
    dict:
        If successful, returns a dictionary with status 'successful' and the assigned plan.
        If an error occurs during classification or plan selection, returns an appropriate error status.
    """
    if class_model == "dt":
        if model is None:
            return {"status": "load_error", "message": "Decision tree model not provided."}
        classification_result = classify_data_dt(user_data, model)
    
    elif class_model == "apriori":
        if rules is None:
            return {"status": "load_error", "message": "Apriori rules not provided."}
        classification_result = classify_data_apriori(user_data, rules)

    else:
        return {"status": "load_error", "message": "The class_model parameter must be 'dt' or 'apriori'."}
    
    error = check_for_error(classification_result)
    if error:
        return error

    prediction = classification_result.get("prediction")
    if not prediction or not isinstance(prediction, list):
        return {"status": "exe_error", "message": "Invalid prediction format from classification"}
    
    # Determine the plan type based on the user's expenses
    ispayingHousing = any(expense['type'] == 'housing' and expense['expense'] > 0 for expense in user_data['expenses'])
    assigned_plan = f"{prediction[0]}A" if ispayingHousing else f"{prediction[0]}B"
    
    try:
        selected_plan = plans[assigned_plan]        
    except (IndexError, TypeError):
        return {"status": "exe_error", "message": "Plan index out of range or invalid"}

    return {
        "status": "successful",
        "assigned_plan": selected_plan
    }

def redistribute_to_meet_minimums(plan, income, minimums, adjustable_fields, isForeign):
    """
    Adjusts the spending plan to ensure that minimum requirements for essential expenses are met.

    Parameters:
    - plan (dict): A dictionary where keys are expense categories and values are percentage allocations of income.
    - income (float): The user's monthly income.
    - minimums (dict): A dictionary specifying the minimum required amounts for essential expense categories.
    - adjustable_fields (list): List of expense categories whose percentages can be adjusted.
    - isForeign (bool): Flag indicating if the user is living abroad (affects "housing" adjustments).

    Returns:
    - dict: A result dictionary containing:
      - "status" (str): Indicates if the redistribution was successful ("successful") or failed ("calc_error").
      - "message" (str, optional): Error message if redistribution fails.
      - "plan" (dict): The updated spending plan.

    Logic:
    - Identify categories needing an increase to meet minimums (`fields_to_adjust`).
    - Identify categories with surplus that can be reduced (`fields_with_surplus`).
    - Redistribute surplus amounts from eligible categories to deficit categories.
    - Ensure that no category exceeds a 25% reduction and that minimum requirements are met.
    - Return an error status if redistribution fails.
    """
    fields_to_adjust = [field for field in plan if field in minimums and income * plan[field] / 100 < minimums[field] and (field != "housing" or isForeign) ]
    fields_with_surplus = [field for field in plan if field not in adjustable_fields and field in minimums and  income * plan[field] / 100 > minimums[field] and (field != "housing" or isForeign) ]

    for field in fields_to_adjust:

        current_value = income * plan[field] / 100
        min_value = minimums[field]
        deficit = min_value - current_value

        for adjust_field in fields_with_surplus:

            adjust_value = income * plan[adjust_field] / 100
            surplus = adjust_value - minimums[adjust_field]

            if surplus > 0:
                max_reduction = min(surplus, deficit, adjust_value/4)
                plan[adjust_field] -= (max_reduction / income) * 100
                deficit -= max_reduction
                plan[field] += (max_reduction / income) * 100


            if deficit <= 0:
                break;

        if deficit > 0:
            return {"status": "calc_error", "message": "Redistribution failed to meet minimums.", "plan": plan}

    return {"status": "successful", "plan": plan}

def check_expenses(current_plan, monthly_income, isForeign, minimums):
    """
    Verifies if the current spending plan meets the minimum expense requirements for each category.

    Parameters:
    - current_plan (dict): A dictionary where keys are expense categories and values are percentage allocations of income.
    - monthly_income (float): The user's monthly income.
    - isForeign (bool): Flag indicating if the user is living abroad (affects "housing" checks).
    - minimums (dict): A dictionary specifying the minimum required amounts for essential expense categories.

    Returns:
    - tuple: 
      - is_valid (bool): Indicates if the plan meets all minimum requirements.
      - results (dict): A dictionary showing the difference between the required and current expenses for each category.

    Logic:
    - Iterate through each expense category in the plan.
    - Skip "housing" if the user is not living abroad.
    - Calculate the current expense for each category and compare it with the minimum requirement.
    - Store the difference and update the validity status if a category does not meet the minimum.
    """
    results = {}
    is_valid = True

    for category, percentage in current_plan.items():
        if category == "housing" and not isForeign:
            continue

        current_expense = (percentage / 100) * monthly_income
        if category in minimums:
            difference = minimums[category] - current_expense
            results[category] = difference
            if current_expense < minimums[category]:
                is_valid = False

    return is_valid, results

def verify_saving_to_goal(savings_percentage, monthly_income, goal, max_months):
    """
    Verifies if a given savings plan can meet a financial goal within a specified time frame.

    Parameters:
    - savings_percentage (float): The percentage of monthly income allocated to savings.
    - monthly_income (float): The user's monthly income.
    - goal (float): The monetary savings goal the user wants to achieve.
    - max_months (int): The maximum number of months allowed to achieve the goal.

    Returns:
    - dict: A result dictionary containing:
      - "status" (str): Indicates if the goal can be achieved ("successful") or if there's an error ("calc_error").
      - "months" (int, optional): The number of months required to achieve the savings goal.
      - "message" (str): A message describing the result or the error.

    Logic:
    - Calculate the monthly savings based on the percentage and monthly income.
    - Return an error if the savings percentage or income results in zero or negative savings.
    - Calculate the required months to achieve the savings goal.
    - Return an error if the required months exceed the allowed maximum (`max_months`).
    - Return a success status with the required months if the goal is achievable within the allowed time.
    """
    monthly_savings = (savings_percentage / 100) * monthly_income
    
    if monthly_savings <= 0:
        return {"status": "calc_error",
                "message": "Savings percentage or income is too low to save anything. "}
    
    required_months = goal / monthly_savings
    
    if required_months > max_months:
        return {
            "status": "calc_error",
            "message": f"The savings goal cannot be achieved within {max_months} months. "
                       f"Required months: {int(required_months)}. "
        }
    
    return {
        "status": "successful",
        "months": int(required_months),
        "message": f"You can achieve the savings goal in {int(required_months)} months."
    }

def adjust_and_verify_plan(plan, income, savings_goal, max_months, minimums):
    """
    Adjusts a financial plan to meet a savings goal within a specified time frame, while ensuring minimum expenses
    are met and validating the plan's feasibility.

    Parameters:
    - plan (dict): A dictionary containing percentage allocations for various expense categories, including "savings."
    - income (float): The user's monthly income.
    - savings_goal (float): The monetary savings goal the user wants to achieve.
    - max_months (int): The maximum number of months allowed to achieve the goal.
    - minimums (dict): A dictionary with the minimum expense amounts for essential categories.

    Returns:
    - dict: A result dictionary containing:
      - "status" (str): "successful" if the plan meets the goal, "calc_error" otherwise.
      - "plan" (dict): The adjusted financial plan.
      - "actual_duration" (int, optional): The number of months required to achieve the savings goal.
      - "diff" (dict): Differences between current expenses and the minimum required expenses.
      - "message" (str, optional): Error message in case of a calculation issue.

    Logic:
    1. **Verify Savings Feasibility:**  
       Calls `verify_saving_to_goal` to check if the initial savings percentage is sufficient to meet the savings goal.
    
    2. **Adjust Expenses if Needed:**  
       If the savings goal cannot be met, reduces percentages from adjustable fields ("non-essential," "health," and "transportation")
       and reallocates them to "savings." Priority is given to cutting non-essential expenses first.

    3. **Verify Expense Validity:**  
       Calls `check_expenses` to ensure minimum expense requirements are met.
    
    4. **Redistribution:**  
       If expenses fall below minimum requirements, `redistribute_to_meet_minimums` attempts to redistribute funds
       from surplus categories to meet the required minimums.

    5. **Final Plan Validation:**  
       Returns a success status if the savings goal and expense minimums are met; otherwise, returns an error message.

    """
    savings_check = verify_saving_to_goal(plan["savings"], income, savings_goal, max_months)
    adjustable_fields = ["non-essential", "health", "transportation"]
    
    if savings_check["status"] == "calc_error":        
        for field in adjustable_fields:
            if savings_check["status"] == "successful":
                break
            elif field == "non-essential":
                plan["savings"] += plan[field] / 2
                plan[field] = plan[field] / 2
            else:
                current_field_amount = income * plan[field] / 100
                min_field_amount = minimums[field]

                if current_field_amount > min_field_amount:
                    max_reduction = current_field_amount / 2
                    reduction = min(max_reduction, current_field_amount - min_field_amount)
                    
                    plan["savings"] += reduction / income * 100
                    plan[field] -= reduction / income * 100
            
            savings_check = verify_saving_to_goal(plan["savings"], income, savings_goal, max_months)
            
    isForeign = plan["housing"] > 0
    isvalid, results = check_expenses(plan, income, isForeign, minimums)

    if not isvalid:
        redistribution_result = redistribute_to_meet_minimums(plan, income, minimums, adjustable_fields, isForeign)
        isvalid, results = check_expenses(plan, income, isForeign, minimums)
        if  redistribution_result["status"] == "calc_error":
            return {
                "status": "calc_error",
                "message": redistribution_result["message"],
                "plan": redistribution_result["plan"],
                "diff": results
            }
        plan =  redistribution_result["plan"]
        savings_check = verify_saving_to_goal(plan["savings"], income, savings_goal, max_months)

    if savings_check["status"] == "successful" and isvalid:
        return {"status": "successful", "plan": plan, "actual_duration": savings_check["months"], "diff": results}   
    
    # if not isvalid:
    #     return {"status": "calc_error", "message": "Cannot adjust the plan to meet minimum expenses.",  "plan": plan, "diff": results }

    return savings_check

# dt = decission tree, apriori = Apriori Algorithm
def manage_plan(user_data, class_model):
    """
    Manages the generation of a financial plan based on the user's data and chosen classification model (decision tree or Apriori).

    Parameters:
    user_data (dict): The financial data provided by the user, including income, expenses, goals, etc.
    class_model (str): A string indicating the classification model to use for plan generation. 
                        Can be either "dt" (decision tree) or "apriori" (Apriori algorithm).

    Returns:
    dict: A dictionary containing the status of the plan creation process, including a message and the final plan if successful.
          If any errors occur during the process, an error message is returned instead.
    """
    
    # Load the appropriate model based on the user's choice (Decision Tree or Apriori)
    if class_model == "dt":
        model = load_model()
        error = check_for_error(model)
        if error:
            return error

    elif class_model == "apriori":
        rules = load_rules()
        error = check_for_error(rules)
        if error:
            return error

    else:
        return {"status": "load_error", "message": "The class_model parameter must be 'dt' or 'apriori'."}

    # Load the list of available financial plans
    plans = load_plans()
    error = check_for_error(plans)
    if error:
        return error
    plans = plans.get("plans")

    # Load the minimum financial thresholds required for basic living
    minimums = load_minimums()
    error = check_for_error(minimums)
    if error:
        return error
    minimums = minimums.get("minimums")

    # Process the user's transaction data (income, expenses, savings)
    transactions_result = process_transactions(user_data)
    error = check_for_error(transactions_result)
    if error:
        return error

    income = transactions_result["prepared_data"]["income"]
    expenses = transactions_result["prepared_data"]["expenses"]
    last_saving = transactions_result["prepared_data"]["last_saving"]

    # Process the user's goal (financial target and duration)
    goals_result = process_goals(user_data)
    error = check_for_error(goals_result)
    if error:
        return error

    goal = goals_result["prepared_data"]["goal"]
    duration = goals_result["prepared_data"]["duration"]
    goal_name = goals_result["prepared_data"]["goal_name"]

    # Adjust the goal based on any previous savings
    goal = goal - last_saving

    # Assign a financial plan based on the user's data and the selected classification model
    plan_result = assign_plan(user_data, plans, model=model if class_model == "dt" else None, 
                          rules=rules if class_model == "apriori" else None, 
                          class_model=class_model)
    error = check_for_error(plan_result)
    if error:
        return error

    assigned_plan = plan_result.get("assigned_plan")

    # Adjust the assigned plan and verify it meets the user's financial goal and constraints
    adjusted_plan_result = adjust_and_verify_plan(
        assigned_plan,
        income,
        goal,
        duration,
        minimums
    )
    error = check_for_error(adjusted_plan_result)
    if error:
        return error

    # Return the successfully generated plan along with additional details such as actual duration and differences
    return {
        "status": "success",
        "message": "Plan successfully created",
        "plan": adjusted_plan_result.get("plan"),
        "actual_duration": adjusted_plan_result.get("actual_duration"),
        "diff": adjusted_plan_result.get("diff")
    }

def create_plan(user_data):
    """
    Creates a financial plan for the user by comparing two different approaches: Decision Tree (DT) and Apriori algorithm.

    The function first generates a financial plan using the Decision Tree model (`dt`) and another one using the Apriori algorithm (`apriori`). 
    It compares the durations of the two plans and returns the one with the shorter duration. If both plans have the same duration, 
    the Decision Tree plan is returned by default. If any of the plans are unsuccessful, the function returns the successful plan or defaults to the Decision Tree plan.

    Parameters:
    user_data (dict): The financial data provided by the user, which is used to generate the plans.

    Returns:
    dict: A dictionary containing the status of the plan generation, a message, and the final plan details if successful.
          If an error occurs during the process, the function returns an error message.
    """
    try:
        # Generate plans using both the Decision Tree (DT) and Apriori approaches
        dt_plan = manage_plan(user_data, "dt")
        apriori_plan = manage_plan(user_data, "apriori")
        
        # If both plans are successful, compare their durations and return the one with the shorter duration
        if dt_plan["status"] == "success" and apriori_plan["status"] == "success":
            dt_duration = dt_plan["actual_duration"]
            apriori_duration = apriori_plan["actual_duration"]

            if dt_duration <= apriori_duration:
                return dt_plan
            else:
                return apriori_plan
        
        # If only the Decision Tree plan is successful, return it
        elif dt_plan["status"] == "success":
            return dt_plan
        
        # If only the Apriori plan is successful, return it
        elif apriori_plan["status"] == "success":
            return apriori_plan
        
        # If both plans failed, return the Decision Tree plan by default
        else:
            return dt_plan

    except Exception as e:
        # If an error occurs during the process, return an error message
        return {
            "status": "server_error",
            "message": "An error occurred while processing the plan.",
            "details": str(e)
        }

