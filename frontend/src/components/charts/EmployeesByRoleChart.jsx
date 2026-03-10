import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

const COLORS = ["#1976d2", "#2e7d32", "#ed6c02"];

const EmployeesByRoleChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        outerRadius={100}
        label
      >
        {data.map((_, index) => (
          <Cell key={index} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend verticalAlign="bottom" />
    </PieChart>
  </ResponsiveContainer>
);

export default EmployeesByRoleChart;
