import React, { useEffect, useState } from "react";
import { createTask } from "../services/taskService";
import { getAllEmployees } from "../services/employeeService";
import Topbar from "../components/layout/Topbar";
import { useNavigate } from "react-router-dom";

const CreateTask = () => {
  const role = localStorage.getItem("role");
  const adminDeptId = Number(localStorage.getItem("deptId"));
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0]; // ✅ today date

  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    assignedToId: "",
  });

  useEffect(() => {
    if (role !== "ADMIN" && role !== "SUPERADMIN") return;

    getAllEmployees().then((res) => {
      // 🔐 only same department employees
      const filtered = res.data.filter(
        (e) => e.department?.departmentId === adminDeptId
      );
      setEmployees(filtered);
    });
  }, [adminDeptId, role]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.title || !form.assignedToId) {
      alert("Title and employee are required");
      return;
    }

    // ✅ DATE VALIDATION
    if (form.dueDate && new Date(form.dueDate) < new Date(today)) {
      alert("Due date cannot be in the past");
      return;
    }

    try {
      await createTask({
        title: form.title,
        description: form.description,
        dueDate: form.dueDate,
        assignedTo: { employeeId: Number(form.assignedToId) },
      });

      alert("Task assigned successfully");
      navigate("/tasks");
    } catch (err) {
      alert(err?.response?.data || "Failed to create task");
    }
  };

  return (
    <div>
      <Topbar title="Assign Task" />

      <div className="container mt-4">
        <div className="card p-4">
          <h5>Assign New Task</h5>

          <input
            className="form-control mb-3"
            placeholder="Task title"
            name="title"
            value={form.title}
            onChange={handleChange}
          />

          <textarea
            className="form-control mb-3"
            placeholder="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
          />

          {/* ✅ DATE INPUT WITH VALIDATION */}
          <input
            type="date"
            className="form-control mb-3"
            name="dueDate"
            value={form.dueDate}
            min={today}
            onChange={handleChange}
          />

          <select
            className="form-select mb-3"
            name="assignedToId"
            value={form.assignedToId}
            onChange={handleChange}
          >
            <option value="">Assign to employee</option>
            {employees.map((e) => (
              <option key={e.employeeId} value={e.employeeId}>
                {e.firstName} {e.lastName}
              </option>
            ))}
          </select>

          <button className="btn btn-primary" onClick={handleSubmit}>
            Assign Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
