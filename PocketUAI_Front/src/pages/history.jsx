import React, { useState } from "react";
import { Fab, Box, Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpenseCard from "../components/historyCard";
import ExpenseForm from "../components/historyForm";
import toast from 'react-hot-toast';

import { useAuth } from '../context/auth.context'; // Import custom hook for authentication context
import { financialPlanService } from '../services/financialPlan.service'; // Service to fetch the financial plan
import { historyService } from '../services/history.service'; // Service to fetch the user's history
import { DateService } from '../services/date.service'; // Service to manage dates, converting them to text, Timestamp, or Date
import ErrorMessage from '../components/error_message'; // Component to display error messages
import LoadingCircle from "../components/loading_circle";

const History = () => {
  // Effect hook to set the document title and load user data when the component mounts
  React.useEffect(() => {
    document.title = 'History'; // Set the page title to 'History'
    load_userdata(); // Load user data from the API
  }, []); // Empty dependency array, meaning this effect runs only on mount

  // State to store expenses, whether the form is open, error state, and message
  const [expenses, setExpenses] = useState([]); // Expenses array to display
  const [isFormOpen, setIsFormOpen] = useState(false); // To track whether the add expense form is open
  const [loading, setLoading] = useState(true); // To ensure that page elements are loaded only after all the information is fully loaded

  const { user } = useAuth(); // Get user info from authentication context
  const [error, setError] = React.useState(null); // Store any error messages
  const [message, setMessage] = React.useState(null); // Store a detailed error message

  const [planData, setPlanData] = React.useState(null); // Placeholder for financial plan data

  // Transform the structure of the new card so it can be saved correctly in the database
  const transformExpense = (newExpense) => {
    return {
      month: newExpense.month,
      expenses: Object.entries(newExpense.values)
        .filter(([type]) => type !== "saving")
        .map(([type, expense]) => ({
          type,
          expense,
        })),
      saving: newExpense.values.saving,
    };
  };

  // Function to handle adding a new expense to the list
  const handleAddExpense = async (newExpense) => {
    try {
      const historyData = transformExpense(newExpense);
      const historyRequest = await historyService.addHistory(historyData);

      if (historyRequest.status !== "success") {
        toast.error(historyRequest.message);
        return;
      }

      const updatedExpense = { ...newExpense, history_id: historyRequest.history_id };

      setExpenses((prevExpenses) =>
        [...prevExpenses, updatedExpense].sort((a, b) => a.month - b.month)
      );

      toast.success(historyRequest.message);
    } catch (error) {
      toast.error("Hubo un error al agregar los gastos.");
    } finally {
      setIsFormOpen(false);
    }
  };

  // Function to handle deleting an expense from the list
  const handleDeleteExpense = async (index) => {
    try {
      const expenseToDelete = expenses[index];
      if (!expenseToDelete || !expenseToDelete.history_id) {
        toast.error("No se encontró el ID del gasto a eliminar.");
        return;
      }
      const historyRequest = await historyService.deleteHistory(expenseToDelete.history_id);
      if (historyRequest.status !== "success") {
        toast.error(historyRequest.message);
        return;
      }
      setExpenses(expenses.filter((_, i) => i !== index)); // Remove the expense at the given index

      toast.success(historyRequest.message);
    } catch (error) {
      toast.error("Hubo un error al eliminar el gasto.");
    }
  };

  // Transform the history data retrieved from the database into a structure that can be loaded into the frontend
  const transformHistoryData = (historyData, startDate, id_user) => {
    return historyData.history.map(entry => {
      const date = DateService.convertToJSDate(startDate);
      date.setMonth(date.getMonth() + (entry.month));
      return {
        history_id: entry.id,
        month: entry.month,
        month_name: DateService.getMonthYear(date),
        id_user,
        values: {
          ...entry.expenses.reduce((acc, exp) => {
            acc[exp.type] = exp.expense;
            return acc;
          }, {}),
          Saving: entry.saving,
        }
      };
    });
  };

  // Function to load user data (financial plan and history) asynchronously
  const load_userdata = async () => {
    try {
      const fetchedPlanData = await financialPlanService.getPlan(user.uid); // Fetch the user's financial plan
      if (fetchedPlanData.status != "success") {
        setError(fetchedPlanData.status); // Set the error if the financial plan fetch fails
        setMessage(fetchedPlanData.message); // Set the detailed error message
        return; // Stop further execution if there's an error
      }
      const historyData = await historyService.getHistory(user.uid); // Fetch the user's history
      if (historyData.status != "success" && historyData.status != "not_found") {
        setError(historyData.status); // Set the error if history fetch fails
        setMessage(historyData.message); // Set the detailed error message
        return; // Stop further execution if there's an error
      }
      // Transform the raw history data into a more usable format for displaying
      const expenses_db = transformHistoryData(historyData, fetchedPlanData.financialPlan.date, user.uid);
      setExpenses(expenses_db.sort((a, b) => a.month - b.month));// Update the expenses state with the transformed data
      setPlanData(fetchedPlanData.financialPlan);
    } catch (error) {
      setError("fetch_error");
      setMessage("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  // If there's an error, display the error message component
  if (error) {
    return <ErrorMessage type={error} message={message} />; // Show an error message if there's an error
  }

  // If the page is still loading, this will be displayed
  if (loading) {
    return <LoadingCircle />;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* Map through the expenses and render each one as a card */}
        {expenses.map((expense, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <ExpenseCard
              data={expense} // Pass the expense data to the ExpenseCard component
              onDelete={() => handleDeleteExpense(index)} // Handle delete for this expense
            />
          </Grid>
        ))}
      </Grid>
      {/* Button to open the form to add a new expense */}
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={() => setIsFormOpen(true)} // Open the form when clicked
      >
        <AddIcon /> {/* Add icon for the button */}
      </Fab>
      {/* If the form is open, render the ExpenseForm component */}
      {isFormOpen && <ExpenseForm onSubmit={handleAddExpense} onClose={() => setIsFormOpen(false)} planData={planData} />}
    </Box>
  );
};

export default History;
