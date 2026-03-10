import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import "./TaskDetails.css";
import { updateTaskStatus } from "../services/taskService";
import { useState } from "react";


const TaskDetails = () => {
  

  const { state: task } = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState(task.status);
  const [saving, setSaving] = useState(false);
  const handleStatusUpdate = async () => {
    try {
      setSaving(true);

      await updateTaskStatus(task.taskId, status);

      alert("Task status updated successfully");
      navigate("/tasks"); // or refetch task
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };


  if (!task) {
    return (
      <div className="p-4">
        <h4>Task Not Found</h4>
        <button className="btn btn-primary mt-2" onClick={() => navigate("/tasks")}>
          Back to Tasks
        </button>
      </div>
    );
  }

  const overdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "COMPLETED";

  return (
    <div>
      <Topbar title="Task Details" />

      <div className="task-details-container container">

        {/* Back Button */}
        <button className="back-btn" onClick={() => navigate("/tasks")}>
          ← Back to Tasks
        </button>

        {/* Summary Card */}
        <div className="task-card shadow-sm">
          <h3 className="task-title">{task.title}</h3>

          <span
            className={`status-badge ${task.status === "PENDING"
              ? "status-pending"
              : task.status === "IN_PROGRESS"
                ? "status-progress"
                : "status-completed"
              }`}
          >
            {task.status}
          </span>

          {overdue && (
            <span className="status-badge status-overdue ms-2">
              Overdue
            </span>
          )}

          <hr />

          <div className="task-info-grid">

            <div>
              <h6>Assigned To</h6>
              <p>
                {task.assignedTo
                  ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                  : "—"}
              </p>
            </div>

            <div>
              <h6>Assigned By</h6>
              <p>
                {task.assignedBy
                  ? `${task.assignedBy.firstName} ${task.assignedBy.lastName}`
                  : "—"}
              </p>
            </div>

            <div>
              <h6>Due Date</h6>
              <p className={overdue ? "text-danger fw-bold" : ""}>
                {task.dueDate || "—"}
              </p>
            </div>

            <div>
              <h6>Priority</h6>
              <p>{task.priority || "Normal"}</p>
            </div>
          </div>

          <hr />

          {/* Description */}
          <div className="desc-box">
            <h6>Description</h6>
            <p>{task.description || "No description provided."}</p>
          </div>

        </div>

        {/* Status Update Section */}
        {localStorage.getItem("role") === "EMPLOYEE" && (
          <div className="update-card shadow-sm">
            <h5>Update Task Status</h5>

            <select
              className="form-select mt-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>


            <button
              className="btn btn-primary mt-3"
              onClick={handleStatusUpdate}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Status"}
            </button>

          </div>
        )}

      </div>
    </div>
  );
};

export default TaskDetails;
