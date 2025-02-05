import React from 'react';
import { Typography, Divider, Box, Button, Grid } from '@mui/material';
import './title.css';
import './infoUser.css';
import { ExpenseItem } from '../components/expense_item';
import { useAuth } from '../context/auth.context';
import { financialPlanService } from '../services/financialPlan.service';
import { userService } from '../services/user.service';
import ErrorMessage from '../components/error_message';

// Test Component
// This component displays the financial data of the user, including their income, expenses, goal, and savings. 
// It fetches the data from the financial plan and user services, and displays the information in a structured layout.

export function Test() {

  // useEffect hook to set the document title and load user data when the component mounts
  React.useEffect(() => {
    document.title = 'Financial Data'; // Sets the title of the page to "Financial Data"
    load_userdata(); // Calls the function to load user data
  }, []); // Empty dependency array ensures this effect runs only once when the component is mounted

  // Extracts the authenticated user's information from the useAuth hook
  const { user } = useAuth();
  
  // useState hooks to manage state for error and message
  const [error, setError] = React.useState(null); // Holds any error message
  const [message, setMessage] = React.useState(null); // Holds a user message

  // Initializes the structure to store financial data
  let financialData = {
    income: 0,
    expenses: [],
    goal: {
      description: '',
      amount: 0,
      time: '',
    },
    saving: 0,
  };

  // A map to associate expense categories with emojis/icons
  const iconMap = {
    'housing': '🏠', // Housing category
    'food': '🍽️', // Food category
    'healthcare': '⚕️', // Healthcare category
    'transportation': '🚗', // Transportation category
    'education': '🎓', // Education category
    'nonEssentials': '🛍️', // Non-essential category
  };

  // Function to load the user's data, including their financial plan and personal details
  const load_userdata = async () => {
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

    // Constructs the financial data from the user and plan data
    financialData = {
      income: userData.user.income, // Sets the user's income
      expenses: userData.user.expenses.map(expense => ({
        name: expense.type.charAt(0).toUpperCase() + expense.type.slice(1), // Capitalizes expense name
        amount: expense.expense, // Sets the amount for each expense
        icon: iconMap[expense.type] || '💰', // Assigns the corresponding icon from the icon map
      })),
      goal: {
        description: planData.plan.goal_name, // Goal description
        amount: planData.plan.goal, // Goal amount
        time: planData.plan.duration, // Duration to reach the goal
      },
      saving: planData.plan.saving, // Sets the saving amount
    };
  };

  // If an error is encountered, render an error message
  if (error) {
    return (<ErrorMessage type={error} message={message} />);
  }

  // Main render function
  return (
    <div className="financial-info-container">
      <div className="title-container">
        <Typography variant="h4" component="div" sx={{ color: "black", marginBottom: "20px" }}>
          Financial Data
        </Typography>
        <Divider className="info-divider" />
      </div>

      <div className="content-container">
        <div className="left-column">
          {/* Income Section */}
          <Box className="income-section">
            <Typography variant="h6" component="div" className="section-title">
              Income
            </Typography>
            <Typography variant="h5" component="div">
              ${financialData.income.toFixed(2)} {/* Formats income to 2 decimal places */}
            </Typography>
          </Box>

          {/* Expenses Section */}
          <Box className="expenses-section">
            <Typography variant="h6" component="div" className="section-title">
              Expenses
            </Typography>
            <Grid container spacing={2}>
              {/* Iterates over expenses and renders an item for each */}
              {financialData.expenses.map((expense, index) => (
                <Grid item xs={12} key={index}>
                  <ExpenseItem name={expense.name} amount={expense.amount} icon={expense.icon} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </div>

        <div className="right-column">
          {/* Goal Section */}
          <Box className="goal-section">
            <Typography variant="h6" component="div" className="section-title">
              Goal
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button variant="contained" className="goal-item" id="goal-btn">
                  {`${financialData.goal.description} $${financialData.goal.amount.toLocaleString()}`} {/* Goal description and amount */}
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button variant="contained" className="goal-item" id="years-btn">
                  In {financialData.goal.time} {/* Goal duration */}
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Saving Section */}
          <Box className="saving-section">
            <Typography variant="h6" component="div" className="section-title">
              Saving
            </Typography>
            <Typography variant="h5" component="div">
              ${financialData.saving.toFixed(2)} {/* Formats saving amount to 2 decimal places */}
            </Typography>
          </Box>
        </div>
      </div>
    </div>
  );
}
