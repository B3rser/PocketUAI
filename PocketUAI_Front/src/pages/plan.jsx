import React from 'react';
import {
  Typography,
  Box,
} from '@mui/material';
import { Home, Power, Fastfood, LocalMall, DirectionsCar, FitnessCenter, Movie, Savings } from '@mui/icons-material';
import { DndAreaExpenses } from '../components/dnd_cards';
import { useAuth } from '../context/auth.context';
import { financialPlanService } from '../services/financialPlan.service';
import { userService } from '../services/user.service';
import ErrorMessage from '../components/error_message';
import toast from 'react-hot-toast';
import LoadingCircle from '../components/loading_circle';

// Plan Component
// This component represents the user's financial plan, displaying their income and categorized expenses. 
// It loads user data, calculates expenses based on the user's income, and renders the financial information with a draggable expense list.

export function Plan() {

  // useEffect hook to set the document title and load user data when the component mounts
  React.useEffect(() => {
    document.title = 'Financial Plan'; // Sets the title of the page to "Financial Plan"
    load_userdata(); // Calls the function to load user data
  }, []); // Empty dependency array ensures this effect runs only once when the component is mounted

  // Extracts the authenticated user's information from the useAuth hook
  const { user } = useAuth();

  // useState hooks to manage state for error, message, and income
  const [error, setError] = React.useState(null); // Holds any error message
  const [message, setMessage] = React.useState(null); // Holds a user message
  const [income, setIncome] = React.useState(0); // Holds the user's income
  // Initializes a structure to store cards and areas for expenses
  const [cardsList, setCardsList] = React.useState({
    actions: {}, // Stores expense actions
    areas: {
      expenses: {
        id: 'expenses', // ID for expenses area
        actionIds: [], // Stores action IDs for each expense
      },
    },
    areaOrder: ['expenses'], // Defines the order of areas, currently only "expenses"
  });
  const [loading, setLoading] = React.useState(true); // To ensure that page elements are loaded only after all the information is fully loaded

  // Function to load the user's data, including their financial plan and personal details
  const load_userdata = async () => {
    try {
      // Fetches the financial plan data
      const planData = await financialPlanService.getPlan(user.uid);
      if (planData.status !== "success") {
        // If fetching the plan data failed, set error state and return
        setError(planData.status);
        setMessage(planData.message);
        return;
      }

      // Fetches the user's data
      const userData = await userService.getUser(user.uid);
      if (userData.status !== "success") {
        // If fetching the user data failed, set error state and return
        setError(userData.status);
        setMessage(userData.message);
        return;
      }

      // Icon map to assign relevant icons to expense categories
      const iconMap = {
        'housing': <Home />, // Housing category
        'food': <Fastfood />, // Food category
        'health': <FitnessCenter />, // Healthcare category
        'transportation': <DirectionsCar />, // Transportation category
        'university': <LocalMall />, // Education category
        'non-essentials': <Movie />, // Non-essential category
        'savings': <Savings />, // Saving category
      };

      // Sets the user's income from the user data
      setIncome(userData.user.income);


      // Creates a new object to store the updated financial plan data
      const newCardsList = {
        actions: {}, // Stores expense actions
        areas: {
          expenses: {
            id: 'expenses', // ID for expenses area
            actionIds: [], // Stores action IDs for each expense
          },
        },
        areaOrder: ['expenses'], // Defines the order of areas, currently only "expenses"
      };

      // Iterates over the expenses in the plan data and generates actions for each expense
      planData.financialPlan.expenses.forEach((expense, index) => {
        const actionId = `expense-${index + 1}`; // Generates a unique ID for each expense
        const category = expense.type; // Expense category (e.g., 'housing', 'food')
        const icon = iconMap[category.toLowerCase()] || <Power />; // Gets the icon for the category, defaulting to <Power />
        const amount = (userData.user.income * expense.expense) / 100; // Calculates the amount based on the percentage of income

        // Adds the expense action to the temporary object
        newCardsList.actions[actionId] = {
          id: actionId, // Action ID
          icon: icon, // Icon for the category
          amount: amount, // Calculated amount
          category: category.charAt(0).toUpperCase() + category.slice(1), // Capitalizes the category
        };

        // Adds the action ID to the expenses area
        newCardsList.areas.expenses.actionIds.push(actionId);
      });

      // Updates the state with the newly constructed object
      setCardsList(newCardsList);
    } catch (error) {
      setError("fetch_error");
      setMessage("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  // If an error is encountered, render an error message
  if (error) {
    return <ErrorMessage type={error} message={message} />;
  }

  // If the page is still loading, this will be displayed
  if (loading) {
    console.log(error)

    return <LoadingCircle />;
  }

  // Main render function
  return (
    <Box display="flex" flexDirection="column" width="80vw">
      <Typography variant="h4" textAlign='left' fontWeight='bold'>
        Financial Plan
      </Typography>
      <Typography variant="subtitle1" textAlign='left'>
        This is the plan to achieve the goal
      </Typography>

      {/* Income Section */}
      <Typography align='left' variant="h6" marginTop='20px' fontWeight='bold'>
        Income
      </Typography>
      <Typography align='left'>
        {new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(income)} {/* Formats the income as currency */}
      </Typography>

      {/* Expenses Section */}
      <Typography align='left' variant="h6" marginTop='20px' fontWeight='bold'>
        Expenses
      </Typography>
      <DndAreaExpenses cardsList={cardsList} /> {/* Renders a draggable area for expenses */}
    </Box>
  );
}
