import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip
} from "recharts";

const COLORS = {
  COMPLETED: "#7d2e2eff",
  PENDING: "#d67c32ff",
  IN_PROGRESS: "#ec5e05ff"
};

const AdminTaskStatusChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={320}>
    <PieChart>
      <Pie
        data={data}
        dataKey="count"
        nameKey="status"
        innerRadius={70}
        outerRadius={110}
        paddingAngle={4}
        label={({ status, percent }) =>
          `${status} (${(percent * 100).toFixed(0)}%)`
        }
      >
        {data.map((entry, index) => (
          <Cell
            key={index}
            fill={COLORS[entry.status] || "#9e9e9e"}
          />
        ))}
      </Pie>

      {/* Tooltip */}
      <Tooltip
        formatter={(value, name) => [`${value} tasks`, name]}
      />

      {/* Legend */}
      <Legend verticalAlign="bottom" height={36} />
    </PieChart>
  </ResponsiveContainer>
);

export default AdminTaskStatusChart;