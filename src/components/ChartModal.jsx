import React, { useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {
  Modal,
  Button,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
} from '@mui/material';

const ChartModal = ({ visible, onClose, chartData = [] }) => {
  const [chartType, setChartType] = useState('line');
  const [xAxisKey, setXAxisKey] = useState('');
  const [yAxisKey, setYAxisKey] = useState('');

  // Ensure chartData is an array, otherwise fallback to an empty array
  const validData = Array.isArray(chartData) && chartData.length > 0 ? chartData : [];

  // Extract keys for x-axis and y-axis options, default to empty array if no valid data
  const dataKeys = validData.length > 0 ? Object.keys(validData[0]) : [];

  // Limit data to top 50 items
  const limitedData = validData.length > 0 ? validData.slice(0, 50) : [];

  // Handle cases where there's no valid data
  const hasSufficientData = validData.length > 0 && xAxisKey && yAxisKey;

  // Define chart options based on the selected chart type
  const getChartOptions = () => {
    const titleText = `Showing only top ${limitedData.length} data points`;
    
    switch (chartType) {

      case 'line':
      case 'area':
      case 'bar':
      case 'column':
        return {
          chart: { type: chartType },
          title: { text: titleText },
          credits: { enabled: false },
          xAxis: { categories: limitedData.map(item => item[xAxisKey]) },
          series: [{
            name: yAxisKey,
            data: limitedData.map(item => item[yAxisKey])
          }]
        };

      default:
        return {
          chart: { type: 'line' },
          title: { text: titleText },
          credits: { enabled: false },
          xAxis: { categories: limitedData.map(item => item[xAxisKey]) },
          series: [{
            name: yAxisKey,
            data: limitedData.map(item => item[yAxisKey])
          }]
        };
    }
  };

  const options = getChartOptions();

  return (
    <Modal
      open={visible}
      onClose={onClose}
      aria-labelledby="chart-modal-title"
      aria-describedby="chart-modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: '8px',
        }}
      >
        <Typography id="chart-modal-title" variant="h6" component="h2">
          Select Chart Options
        </Typography>

        <FormControl fullWidth sx={{ marginTop: 2 }}>
          <InputLabel>Chart Type</InputLabel>
          <Select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            label="Chart Type"
          >
            {/* <MenuItem value="pie">Variable Radius Pie</MenuItem> */}
            {/* <MenuItem value="bubble">Bubble Chart</MenuItem> */}
            <MenuItem value="line">Line Chart</MenuItem>
            <MenuItem value="area">Area Chart</MenuItem>
            <MenuItem value="bar">Basic Bar Chart</MenuItem>
            <MenuItem value="column">Basic Column Chart</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ marginTop: 2 }}>
          <InputLabel>X Axis</InputLabel>
          <Select
            value={xAxisKey}
            onChange={(e) => setXAxisKey(e.target.value)}
            label="X Axis"
          >
            {dataKeys.map((key) => (
              <MenuItem key={key} value={key}>
                {key}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ marginTop: 2 }}>
          <InputLabel>Y Axis</InputLabel>
          <Select
            value={yAxisKey}
            onChange={(e) => setYAxisKey(e.target.value)}
            label="Y Axis"
          >
            {dataKeys.map((key) => (
              <MenuItem key={key} value={key}>
                {key}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {hasSufficientData ? (
          <Box sx={{ marginTop: 4 }}>
            <HighchartsReact highcharts={Highcharts} options={options} />
          </Box>
        ) : (
          <Typography sx={{ marginTop: 4 }} color="error">
            No sufficient data to display the chart. Please provide valid data and select valid axes.
          </Typography>
        )}

        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          sx={{ marginTop: 4 }}
          fullWidth
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default ChartModal;
