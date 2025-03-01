import React from 'react';
import { GraphLine } from '../components/graphLine';
import { GoalSummary } from '../components/goalSummary';
import { HistoryProgress } from '../components/historyProgress';
import { ExpenseIncomeCard } from '../components/expenseIncomeCard';

import { useAuth } from '../context/auth.context';
import { financialPlanService } from '../services/financialPlan.service';
import { historyService } from '../services/history.service';
import { trackingService } from '../services/tracking.service';
import { modelsService } from '../services/models.service';
import { userService } from '../services/user.service';
import { DateService } from '../services/date.service'
import ErrorMessage from '../components/error_message';
import toast from 'react-hot-toast';
import { controllers } from 'chart.js';
import LoadingCircle from '../components/loading_circle';

export function Tracking() {
  React.useEffect(() => {
    document.title = 'Tracking'; // Sets the page title when the component is mounted
    load_userdata(); // Calls the function to load user data
  }, []); // This effect runs only once when the component is mounted

  const { user } = useAuth(); // Retrieves the current authenticated user from context
  const [error, setError] = React.useState(null); // State to store error messages
  const [message, setMessage] = React.useState(null); // State to store general messages

  // Data structure to store chart data
  const [chartData, setChartData] = React.useState({
    labels: [], // Labels for the x-axis (months)
    datasets: [
      {
        label: "Savings Trend", // Label for the dataset
        data: [], // Data for the savings trend
        fill: true, // The area under the line will be filled
        backgroundColor: "rgba(62, 92, 118, 0.2)", // Background color of the filled area
        borderColor: "rgba(62, 92, 118, .8)", // Border color of the line
        tension: 0.5, // Tension for the line curve
      },
    ],
  });

  // Initialize variables for activities, expenses, and incomes
  const [activities, setActivities] = React.useState([]);
  const [expenses, setExpenses] = React.useState([]);
  const [incomes, setIncomes] = React.useState([]);
  const [goalAdvances, setGoalAdvances] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  // Function to calculate average expenses per category
  const calculateAverageExpenses = (historyData, income) => {
    const categories = [
      "housing",
      "food",
      "health",
      "transportation",
      "university",
      "non-essential",
    ];

    // Initialize sums and counts for each category
    const categorySums = {};
    const categoryCounts = {};

    categories.forEach((category) => {
      categorySums[category] = 0;
      categoryCounts[category] = 0;
    });

    // Iterate through the history data to sum expenses by category
    historyData.history.forEach((entry) => {
      entry.expenses.forEach(({ type, expense }) => {
        if (categories.includes(type)) {
          categorySums[type] += expense;
          categoryCounts[type] += 1;
        }
      });
    });

    // Calculate average expenses for each category
    const expenses = categories.map((category) => ({
      label: category,
      value: categoryCounts[category] > 0 ? categorySums[category] / categoryCounts[category] / income * 100 : 0,
    }));

    return expenses;
  };

  // Get the points corresponding to the expected progress the user should have if follow the plan
  const getExpectedPoints = (increase, initialProgress, duration) => {
    let months = [];
    let progress = [];

    for (let i = 0; i <= duration; i++) {
      months.push(i);
      progress.push(increase * i + initialProgress);
    }

    return { months, progress };
  }

  // Function to load user data and populate state variables
  const load_userdata = async () => {
    try {
      // Fetch the financial plan data
      const planData = await financialPlanService.getPlan(user.uid);
      if (planData.status != "success") {
        setError(planData.status); // Set error if failed to load plan data
        setMessage(planData.message); // Set the error message
        return;
      }

      // Fetch the user's history data
      const historyData = await historyService.getHistory(user.uid);
      if (historyData.status !== "success" && historyData.status !== "not_found") {
        setError(historyData.status); // Set error if failed to load history data
        setMessage(historyData.message); // Set the error message
        return;
      }

      // Fetch tracking data
      const trackingData = await trackingService.getTracking(user.uid);
      if (trackingData.status !== "success") {
        setError(trackingData.status); // Set error if failed to load tracking data
        setMessage(trackingData.message); // Set the error message
        return;
      }

      // Fetch user data
      const userData = await userService.getUser(user.uid);
      if (userData.status !== "success") {
        setError(userData.status); // Set error if failed to load user data
        setMessage(userData.message); // Set the error message
        return;
      }

      // Prepare the data for the chart
      let months = [];
      let progress = [];
      let duration = 0;
      let a_saving = 0;
      let projectedPoints = {};
      let expectedPoints = {};
      let goal = 0;

      historyData.history.sort((a, b) => a.month - b.month);

      historyData.history.forEach(({ month, saving }) => {
        months.push(month); // Store the months
        a_saving += saving; // Accumulate the savings
        progress.push(a_saving); // Store the accumulated savings
      });

      duration = planData.financialPlan.duration;
      goal = planData.financialPlan.goal;

      const regressionData = await modelsService.get_points_regression({
        months,
        progress,
        duration
      });
      const savingsExpense = planData.financialPlan.expenses.find(expense => expense.type === "savings");
      const increase = savingsExpense ? (userData.user.income * savingsExpense.expense / 100) : 0;
      expectedPoints = getExpectedPoints(increase, progress[0], duration);

      if (regressionData.status != "success") {


        toast.error(regressionData.message)
      } else {
        projectedPoints = regressionData.data
      }

      const allMonths = Array.from(new Set([
        ...months,
        ...projectedPoints.all_months,
        ...expectedPoints.months
      ])).sort((a, b) => a - b);

      const completeProgress = allMonths.map(month => {
        const monthIndex = months.indexOf(month);
        return monthIndex !== -1 ? progress[monthIndex] : null;
      });

      // Assign the chart data 
      const chartData = {
        labels: allMonths,
        datasets: [
          {
            label: "Actual Progress",
            data: completeProgress,
            fill: false,
            borderColor: "rgba(62, 92, 118, .8)",
            tension: 0.5,
          },
          {
            label: "Savings Trend",
            data: projectedPoints.projection,
            fill: false,
            borderColor: "rgba(255, 99, 132, .8)",
            tension: 0.5,
          },
          {
            label: "Expected Progress",
            data: expectedPoints.progress,
            fill: false,
            borderColor: "rgba(54, 162, 235, .8)",
            tension: 0.5,
          },
          {
            label: "Goal",
            data: allMonths.map(() => goal),
            fill: false,
            borderColor: "rgba(75, 192, 192, .8)",
            borderDash: [5, 5],
            tension: 0,
          }
        ]
      };

      setChartData(chartData);

      // Calculate average expenses
      setExpenses(calculateAverageExpenses(historyData, userData.user.income));

      // Map activities from history data for displaying progress
      setActivities(
        historyData.history.map((entry, index) => {
          const date = DateService.convertToJSDate(planData.financialPlan.date);
          date.setMonth(date.getMonth() + entry.month);

          return {
            id: index + 1,
            amount: entry.saving,
            goal: planData.financialPlan.goal_name,
            date: DateService.getMonthYear(date),
          };
        })
      );

      // Set incomes and goal advancements
      setIncomes([{ label: "Income", value: userData.user.income / userData.user.income * 100 }]);
      setGoalAdvances({ saved: a_saving, goal: planData.financialPlan.goal, goal_name: planData.financialPlan.goal_name });
    } catch (error) {
      setError("fetch_error");
      setMessage("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  // If there is an error, display the error message
  if (error) {
    return <ErrorMessage type={error} message={message} />;
  }

  // If the page is still loading, this will be displayed
  if (loading) {
    return <LoadingCircle />;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        {/* Display the savings trend graph */}
        <GraphLine chartData={chartData} width="50vw" height="50vh" />
        {/* Display the history progress */}
        <HistoryProgress activities={activities} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ margin: '20px' }}>
          {/* Display the goal summary */}
          <GoalSummary saved={goalAdvances.saved} goal={goalAdvances.goal} goal_name={goalAdvances.goal_name} />
        </div>
        <div style={{ margin: '20px' }}>
          {/* Display the expense and income card */}
          <ExpenseIncomeCard expenses={expenses} incomes={incomes} />
        </div>
      </div>
    </div>
  );
}

