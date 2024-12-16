import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Sales',
      data: [],
      backgroundColor: 'rgba(75, 192, 192, 0.2)', // Chart bar color
      borderColor: 'rgba(75, 192, 192, 1)', // Border color
      borderWidth: 1,
    }],
  });
  const [timePeriod, setTimePeriod] = useState('day'); // Default to day

  useEffect(() => {
    // Fetch data based on selected time period
    fetchSalesData(timePeriod);
  }, [timePeriod]);

  const fetchSalesData = (period) => {
    let data = [];
    let labels = [];

    // Example data (Replace with actual API call or data fetching)
    if (period === 'day') {
      // Sample data for daily sales
      data = [12, 15, 10, 8, 17, 22, 9]; // Example sales data for each day
      labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    } else if (period === 'month') {
      // Sample data for monthly sales
      data = [120, 150, 100, 180, 220, 90, 250, 300, 400, 500, 450, 550];
      labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    } else if (period === 'year') {
      // Sample data for yearly sales
      data = [1200, 1500, 1800, 2200, 2500];
      labels = ['2019', '2020', '2021', '2022', '2023'];
    }

    // Update the chart data
    setChartData({
      labels: labels,
      datasets: [{
        label: 'Sales',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Chart bar color
        borderColor: 'rgba(75, 192, 192, 1)', // Border color
        borderWidth: 1,
      }],
    });
  };

  return (
    <div>
      <h3>Sales Data</h3>

      <div>
        <label>Select Time Period: </label>
        <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}>
          <option value="day">Day</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </div>

      <div>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: `Sales by ${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}`,
              },
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    return `Sales: $${tooltipItem.raw}`;
                  },
                },
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1),
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Sales ($)',
                },
                beginAtZero: true,
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default BarChart;
