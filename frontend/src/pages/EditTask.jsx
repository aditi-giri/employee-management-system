import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { updateTask } from "../services/taskService";
import Topbar from "../components/layout/Topbar";

const EditTask = () => {
  const { state: task } = useLocation();
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0]; // ✅ today date

  const [form, setForm] = useState({
    title: task.title,
    description: task.description || "",
    dueDate: task.dueDate || "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
    // ✅ DATE VALIDATION
    if (form.dueDate && new Date(form.dueDate) < new Date(today)) {
      alert("Due date cannot be in the past");
      return;
    }

    try {
      await updateTask(task.taskId, form);
      alert("Task updated");
      navigate("/tasks");
    } catch {
      alert("Update failed");
    }
  };

  return (
    <div>
      <Topbar title="Edit Task" />
      <div className="container mt-4">
        <div className="card p-4">
          <input
            className="form-control mb-3"
            name="title"
            value={form.title}
            onChange={handleChange}
          />

          <textarea
            className="form-control mb-3"
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

          <button className="btn btn-primary" onClick={handleUpdate}>
            Update Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTask;
