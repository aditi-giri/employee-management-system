import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts";

const EmployeesByDepartmentChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Legend verticalAlign="top" height={36} />
      <Bar dataKey="value" name="Employees Count" fill="#1976d2" />
    </BarChart>
  </ResponsiveContainer>
);

export default EmployeesByDepartmentChart;
