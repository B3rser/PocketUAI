import React from 'react';
import { Typography, Divider, Box, Button, Grid } from '@mui/material';
import './title.css';
import './infoUser.css';
import { ExpenseItem } from '../components/expense_item';
import { useAuth } from '../context/auth.context';
import { financialPlanService } from '../services/financialPlan.service';
import { userService } from '../services/user.service';
import ErrorMessage from '../components/error_message';
import LoadingCircle from '../components/loading_circle';

/**
 * InfoUser Component
 *
 * This component displays the financial information of an authenticated user,
 * including income, expenses, financial goals, and savings. It fetches user data 
 * from the backend and dynamically updates the interface.
 *
 * Features:
 * - Fetch and display user financial and plan data
 * - Render error messages when data retrieval fails
 * - Organized layout with sections for income, expenses, goals, and savings
 */

export function InfoUser() {
  // Set the page title and load user data on component mount
  React.useEffect(() => {
    document.title = 'Financial Data';
    load_userdata();
  }, []);

  // Authentication context to access user information
  const { user } = useAuth();

  // Error and message states to handle API response feedback
  const [error, setError] = React.useState(null);
  const [message, setMessage] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Default financial data structure for initial rendering
  const [financialData, setFinancialData] = React.useState({
    income: 0,
    expenses: [],
    goal: {
      description: '',
      amount: 0,
      time: '',
    },
    saving: 0,
  });

  // Mapping for icons based on expense types
  const iconMap = {
    housing: '🏠',
    food: '🍽️',
    health: '⚕️',
    transportation: '🚗',
    university: '🎓',
    "non-essential": '🛍️',
  };

  // Fetch user and financial plan data from services
  const load_userdata = async () => {
    try {
      const planData = await financialPlanService.getPlan(user.uid);
      if (planData.status !== "success") {
        setError(planData.status);
        setMessage(planData.message);
        return;
      }

      const userData = await userService.getUser(user.uid);
      if (userData.status !== "success") {
        setError(userData.status);
        setMessage(userData.message);
        return;
      }

      // Update financial data structure based on fetched user and plan data
      setFinancialData({
        income: userData.user.income,
        expenses: userData.user.expenses.map(expense => ({
          name: expense.type.charAt(0).toUpperCase() + expense.type.slice(1),
          amount: expense.expense,
          icon: iconMap[expense.type] || '💰',
        })),
        goal: {
          description: planData.financialPlan.goal_name,
          amount: planData.financialPlan.goal,
          time: planData.financialPlan.duration,
        },
        saving: planData.financialPlan.saving,
      });
    } catch (error) {
      setError("fetch_error");
      setMessage("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  // Display error message if data fetching fails
  if (error) {
    return <ErrorMessage type={error} message={message} />;
  }

  if (loading) {
    return <LoadingCircle />;
  }

  return (
    <div className="financial-info-container">
      {/* Page title section */}
      <div className="title-container">
        <Typography variant="h4" component="div" sx={{ color: "black", marginBottom: "20px" }}>
          Financial Data
        </Typography>
        <Divider className="info-divider" />
      </div>

      {/* Main content section */}
      <div className="content-container">
        <div className="left-column">
          {/* Income Section */}
          <Box className="income-section">
            <Typography variant="h6" component="div" className="section-title">
              Income
            </Typography>
            <Typography variant="h5" component="div">
              ${financialData.income.toFixed(2)}
            </Typography>
          </Box>

          {/* Expenses Section */}
          <Box className="expenses-section">
            <Typography variant="h6" component="div" className="section-title">
              Expenses
            </Typography>
            <Grid container spacing={2}>
              {financialData.expenses.map((expense, index) => (
                <Grid item xs={12} key={index}>
                  <ExpenseItem name={expense.name} amount={expense.amount.toFixed(2)} icon={expense.icon} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </div>

        <div className="right-column">
          {/* Financial Goal Section */}
          <Box className="goal-section">
            <Typography variant="h6" component="div" className="section-title">
              Goal
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button variant="contained" className="goal-item" id="goal-btn">
                  {`${financialData.goal.description} $${financialData.goal.amount.toLocaleString()}`}
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button variant="contained" className="goal-item" id="years-btn">
                  In {financialData.goal.time} {financialData.goal.time === 1 ? "month" : "months"}
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
              ${financialData.saving.toFixed(2)}
            </Typography>
          </Box>
        </div>
      </div>
    </div>
  );
}

