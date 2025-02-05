import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import toast from "react-hot-toast";
import { useAuth } from "../context/auth.context";

import { DateService } from '../services/date.service';

const ExpenseForm = ({ onSubmit, onClose, planData }) => {
  const [month, setMonth] = React.useState("");
  const [values, setValues] = React.useState({
    food: "",
    housing: "",
    health: "",
    transportation: "",
    university: "",
    "non-essentials": "",
    saving: "",
  });
  const [availableMonthsList, setAvailableMonthsList] = React.useState([]);

  const { user } = useAuth();

  const startDate = DateService.convertToJSDate(planData.date);
  const duration = planData.duration;

  React.useEffect(() => {
    const calculateAvailableMonths = () => {
      let monthsList = [];
      let currentDate = new Date(startDate);
      currentDate.setMonth(currentDate.getMonth() + 1);

      for (let i = 1; i <= duration; i++) {
        const monthYear = DateService.getMonthYear(currentDate);

        monthsList.push({ label: monthYear, value: i, monthName: monthYear });
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      setAvailableMonthsList(monthsList);
    };

    calculateAvailableMonths();
  }, [startDate, duration]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setValues({
      ...values,
      [name]: type === "number" ? (value === "" ? null : Number(value)) : value,
    });
  };

  const handleSubmit = () => {
    const selectedMonth = availableMonthsList.find((m) => m.value === month);

    if (month && selectedMonth && Object.values(values).every((v) => v !== "")) {
      onSubmit({
        month: selectedMonth.value,
        month_name: selectedMonth.monthName,
        id_user: user.uid,
        values: { ...values },
      });
    } else {
      toast.error("Please fill all fields.");
    }
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Add Expenses</DialogTitle>
      <DialogContent>
        <TextField
          select
          label="Month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          fullWidth
          margin="normal"
        >
          {availableMonthsList.map(({ label, value }) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        {Object.keys(values).map((key) => (
          <TextField
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            name={key}
            value={values[key]}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="number"
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary">
          Accept
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseForm;
