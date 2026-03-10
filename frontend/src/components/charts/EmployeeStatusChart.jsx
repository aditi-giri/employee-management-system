import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

const COLORS = ["#2e7d32", "#d32f2f"];

const EmployeeStatusChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        dataKey="count"
        nameKey="status"
        innerRadius={70}
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

export default EmployeeStatusChart;
