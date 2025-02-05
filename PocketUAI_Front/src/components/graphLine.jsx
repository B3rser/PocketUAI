import React from 'react';
import { Line } from 'react-chartjs-2';
import { Typography } from '@mui/material';
// Import necessary modules and components from the 'chart.js' library
import {
    Chart as ChartJS,
    CategoryScale, // For handling categorical data on the X-axis
    LinearScale, // For handling linear data on the Y-axis
    PointElement, // To render individual points (data points) on the chart
    LineElement, // To render line segments connecting the data points
    Title, // For adding a title to the chart
    Tooltip, // To show tooltips when hovering over data points
    Legend, // For displaying the legend of the chart
} from 'chart.js';

// Register the imported modules with ChartJS
ChartJS.register(
    CategoryScale, // Register the category scale (for X-axis with categorical data)
    LinearScale,   // Register the linear scale (for Y-axis with numerical data)
    PointElement,  // Register the point element (for plotting individual data points)
    LineElement,   // Register the line element (for connecting data points)
    Title,         // Register the title element (for adding a title to the chart)
    Tooltip,       // Register the tooltip element (for showing tooltips on hover)
    Legend         // Register the legend element (for displaying a legend)
);

// The GraphLine component renders a line chart using the Chart.js library
export function GraphLine({ chartData, width, height }) {
    return (
        <div style={{ width: width, height: height, margin: "50px" }}>
            {/* Display a title above the chart */}
            <Typography variant="h6">
                Progress
            </Typography>
            {/* Render the Line chart, passing chart data and options */}
            <Line data={chartData} options={{ maintainAspectRatio: false }} />
        </div>
    );
}

