// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import Topbar from "../components/layout/Topbar";
import { getAllEmployees } from "../services/employeeService";
import { getAllDepartments } from "../services/departmentService";
import { getAllTasks, getTasksAssignedToEmployee, getTasksAssignedByAdmin }
  from "../services/taskService";

import {
  getEmployeesByDepartmentChart,
  getEmployeesByRoleChart,
  getEmployeeStatusChart
} from "../services/chartService.js";

// Chart Components
import EmployeesByDepartmentChart from "../components/charts/EmployeesByDepartmentChart";
import EmployeesByRoleChart from "../components/charts/EmployeesByRoleChart";
import EmployeeStatusChart from "../components/charts/EmployeeStatusChart";
import AdminTaskStatusChart from "../components/charts/AdminTaskStatusChart";
import { getAdminTaskStatusChart } from "../services/chartService";
import "./Dashboard.css";

const Dashboard = () => {
  const role = localStorage.getItem("role");

  const [counts, setCounts] = useState({
    employees: 0,
    departments: 0,
    tasks: 0,
    myTasks: 0,
    myPending: 0,
    myCompleted: 0
  });

  // ================= CHART DATA =================
  const [deptChart, setDeptChart] = useState([]);
  const [roleChart, setRoleChart] = useState([]);
  const [statusChart, setStatusChart] = useState([]);
  const [adminTaskChart, setAdminTaskChart] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        // SUPERADMIN + ADMIN → can see all data
        if (role === "SUPERADMIN") {
          const [eRes, dRes, tRes, deptChartRes, roleChartRes, statusChartRes] = await Promise.all([
            getAllEmployees(),
            getAllDepartments(),
            getAllTasks(),
            getEmployeesByDepartmentChart(),
            getEmployeesByRoleChart(),
            getEmployeeStatusChart()
          ]);

          setCounts({
            employees: eRes.data.length,
            departments: dRes.data.length,
            tasks: tRes.data.length
          });

          setDeptChart(deptChartRes.data);
          setRoleChart(roleChartRes.data);
          setStatusChart(statusChartRes.data);
        }

        if (role === "ADMIN") {
          const [eRes, tRes, assignedRes, statusChartRes, adminTaskChartRes] = await Promise.all([
            getAllEmployees(),              // returns only same-dept employees
            getAllTasks(),                  // allowed (admin can see all tasks)
            getTasksAssignedByAdmin(),     // NEW: properly imported
            // getEmployeesByDepartmentChart(),
            // getEmployeesByRoleChart(),
            getEmployeeStatusChart(),
            getAdminTaskStatusChart()
          ]);

          const deptEmployees = eRes.data || [];
          const allTasks = tRes.data || [];
          const assignedByMe = assignedRes.data || [];

          setCounts({
            employees: deptEmployees.length,
            tasks: allTasks.length,
            assignedByMe: assignedByMe.length
          });

          //    setDeptChart(deptChartRes.data);
          // setRoleChart(roleChartRes.data);
          setStatusChart(statusChartRes.data);
          setAdminTaskChart(adminTaskChartRes.data);
        }




        // EMPLOYEE → load only their own tasks
        if (role === "EMPLOYEE") {
          const tRes = await getTasksAssignedToEmployee().catch(() => ({ data: [] }));
          const myTasks = tRes.data || [];

          setCounts({
            myTasks: myTasks.length,
            myPending: myTasks.filter(t => t.status === "PENDING").length,
            myCompleted: myTasks.filter(t => t.status === "COMPLETED").length
          });
        }

      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [role]);

  // =====================================================================
  // SUPERADMIN DASHBOARD (full analytics)
  // =====================================================================
  if (role === "SUPERADMIN") {
    return (
      <div>
        <Topbar title="Superadmin Dashboard" />

        <div className="dashboard-container">

          <div className="stats-grid">

            <div className="stats-card stats-employees">
              <h6>Total Employees</h6>
              <h2>{counts.employees}</h2>
            </div>

            <div className="stats-card stats-departments">
              <h6>Total Departments</h6>
              <h2>{counts.departments}</h2>
            </div>

            <div className="stats-card stats-tasks">
              <h6>Total Tasks</h6>
              <h2>{counts.tasks}</h2>
            </div>

          </div>

          <div className="actions-section">
            <h5 className="section-title">Quick Actions</h5>

            <div className="action-buttons">
              <a href="/employees" className="action-btn orange-btn">👤 Manage Employees</a>
              <a href="/departments" className="action-btn blue-btn">🏢 Manage Departments</a>
              <a href="/tasks" className="action-btn green-btn">📋 View Tasks</a>
            </div>
          </div>

          <div className="upcoming-section">
            <h5 className="section-title">Upcoming Insights</h5>
            <div className="placeholder-box">Analytics, charts, reports coming soon…</div>
          </div>


          {/* ===== CHARTS ===== */}
          <div className="chart-grid">
            <div className="chart-card">
              <h6>Employees by Department</h6>
              <EmployeesByDepartmentChart data={deptChart} />
            </div>

            <div className="chart-card">
              <h6>Employees by Role</h6>
              <EmployeesByRoleChart data={roleChart} />
            </div>

            <div className="chart-card">
              <h6>Employee Status</h6>
              <EmployeeStatusChart data={statusChart} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================================
  // ADMIN DASHBOARD (accurate + safe)
  // =====================================================================
  if (role === "ADMIN") {
    return (
      <div>
        <Topbar title="Admin Dashboard" />

        <div className="dashboard-container">

          <div className="stats-grid">

            {/* Shows employees of admin's own department */}
            <div className="stats-card stats-employees">
              <h6>Employees (Your Dept)</h6>
              <h2>{counts.employees}</h2>
            </div>

            <div className="stats-card stats-tasks">
              <h6>Total Tasks</h6>
              <h2>{counts.tasks}</h2>
            </div>

            <div className="stats-card stats-departments">
              <h6>Your Assigned Tasks</h6>
              <h2>{counts.assignedByMe}</h2>
            </div>

          </div>

          <div className="actions-section">
            <h5 className="section-title">Admin Tools</h5>

            <div className="action-buttons">

              <a href="/employees" className="action-btn orange-btn">
                👤 Manage Employees
              </a>

              <a href="/tasks" className="action-btn green-btn">
                📋 Manage Tasks
              </a>

              <a href="/task/create" className="action-btn blue-btn">
                ➕ Assign Task
              </a>

            </div>
          </div>

          {/* <div className="placeholder-box mt-4">
          Advanced analytics for admins will come soon (task charts, load stats, employee performance).
        </div> */}
          {/* ===== CHART ===== */}
          <div className="chart-card mt-4">
            <h6>Employee Status (Your Department)</h6>
            <EmployeeStatusChart data={statusChart} />
          </div>
          {/* ===== ADMIN TASK CHART ===== */}
          <div className="chart-card mt-4">
            <h6>Tasks Assigned by You (Status Breakdown)</h6>
            <AdminTaskStatusChart data={adminTaskChart} />
          </div>
        </div>
      </div>
    );
  }


  // =====================================================================
  // EMPLOYEE DASHBOARD (minimal, task-focused)
  // =====================================================================
  return (
    <div>
      <Topbar title="Employee Dashboard" />

      <div className="dashboard-container">

        <div className="stats-grid">

          <div className="stats-card stats-tasks">
            <h6>My Tasks</h6>
            <h2>{counts.myTasks}</h2>
          </div>

          <div className="stats-card stats-employees">
            <h6>Pending</h6>
            <h2>{counts.myPending}</h2>
          </div>

          <div className="stats-card stats-departments">
            <h6>Completed</h6>
            <h2>{counts.myCompleted}</h2>
          </div>

        </div>

        <div className="actions-section">
          <h5 className="section-title">Quick Links</h5>

          <div className="action-buttons">
            <a href="/tasks" className="action-btn green-btn">📋 View My Tasks</a>
          </div>
        </div>

        <div className="placeholder-box mt-4">
          Your work summary and performance charts will appear here soon.
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
