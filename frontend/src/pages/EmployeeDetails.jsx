// src/pages/EmployeeDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllDepartments } from "../services/departmentService";


import { getEmployeeById, updateEmployee } from "../services/employeeService";
import {
  getTasksAssignedToEmployee,
  getTasksAssignedByAdmin,
  getAllTasks
} from "../services/taskService";

import Topbar from "../components/layout/Topbar";
import './EmployeeDetails.css'

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const loggedInEmpId = Number(localStorage.getItem("id"));
  const adminDeptId = Number(localStorage.getItem("deptId"));

  const [employee, setEmployee] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [departments, setDepartments] = useState([]);


  const isSelf = loggedInEmpId === Number(id);
  const isAdmin = role === "ADMIN";
  const isSuperAdmin = role === "SUPERADMIN";
  const isViewingSuperAdmin = employee?.role?.roleName === "SUPERADMIN";
  const [openSection, setOpenSection] = useState(null);

  // ✅ PERMISSIONS (STRICT)
  const canEditPersonal =
    !isViewingSuperAdmin &&
    ((role === "EMPLOYEE" && isSelf) || (isAdmin && isSelf));


  const canEditAdmin = isSuperAdmin && !isViewingSuperAdmin;



  // PERSONAL (Employee/Admin self only)
  const [personalForm, setPersonalForm] = useState({
    phone: "",
    address: "",
  });

  // ADMIN (Superadmin only)
  const [adminForm, setAdminForm] = useState({
    designation: "",
    salary: "",
    status: "",
    role: "",
    departmentId: "",
  });


  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // 🚫 EMPLOYEE cannot open another person's profile
  if (role === "EMPLOYEE" && !isSelf) {
    return (
      <div className="container text-center py-5">
        <h3 className="text-danger">Access Denied</h3>
        <p>You are not authorized to view another employee's profile.</p>
      </div>
    );
  }

  // ================= LOAD DATA =================
  useEffect(() => {
    async function load() {
      try {
        const empRes = await getEmployeeById(id);
        const deptRes = await getAllDepartments();
        setDepartments(deptRes.data);


        // ADMIN → only same department
        if (isAdmin) {
          const empDept = empRes.data.department?.departmentId;
          if (empDept !== adminDeptId) {
            setError("Admins can only view employees from their department.");
            return;
          }
        }

        setEmployee(empRes.data);

        setPersonalForm({
          phone: empRes.data.phone || "",
          address: empRes.data.address || "",
        });

        setAdminForm({
          designation: empRes.data.designation || "",
          salary: empRes.data.salary || "",
          status: empRes.data.status || "",
          role: empRes.data.role?.roleName || "",
          departmentId: empRes.data.department?.departmentId || "",
        });


        // ================= LOAD TASKS =================
        let taskRes;

        if (role === "EMPLOYEE") {
          // Employee → backend already filters own tasks
          taskRes = await getTasksAssignedToEmployee();
          setTasks(taskRes.data || []);
        } else {
          // Admin & Superadmin → need ALL tasks
          taskRes = await getAllTasks();

          const filtered = (taskRes.data || []).filter(
            (t) => t.assignedTo?.employeeId === Number(id)
          );

          setTasks(filtered);
        }
      } catch {
        setError("Failed to load employee details.");
      }
    }

    load();
  }, [id, role, isAdmin, adminDeptId]);

  // ================= HANDLERS =================
  const handlePersonalChange = (e) =>
    setPersonalForm({ ...personalForm, [e.target.name]: e.target.value });

  const handleAdminChange = (e) =>
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });

  // ================= UPDATE PERSONAL =================
  const updatePersonal = async () => {
    try {
      await updateEmployee(id, personalForm);
      setMessage("Personal details updated successfully!");
    } catch (err) {
      setError(err?.response?.data?.message || "Update failed.");
    }
  };

  const ROLE_MAP = {
    EMPLOYEE: 2,
    ADMIN: 1,
  };

  // ================= UPDATE ADMIN =================
  const updateAdmin = async () => {
    try {
      // ✅ FIX: send role as object, not string
      const payload = {
        designation: adminForm.designation,
        salary: adminForm.salary,
        status: adminForm.status,
        role: adminForm.role
          ? { roleId: ROLE_MAP[adminForm.role] }
          : undefined,
        department: adminForm.departmentId
          ? { departmentId: Number(adminForm.departmentId) }
          : undefined,
      };

      await updateEmployee(id, payload);
      setMessage("Admin details updated successfully!");
    } catch (err) {
      setError(err?.response?.data?.message || "Update failed.");
    }
  };


  if (!employee) {
    return (
      <div className="text-center mt-5">
        {error ? <h4 className="text-danger">{error}</h4> : "Loading..."}
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Employee Details" />

      <div className="container py-4">
        <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {/* ================= INFO ================= */}
        <div className="card p-4 shadow-sm mb-4">
          <h4>Employee Information</h4>



          {message && <p className="text-success">{message}</p>}
          {error && <p className="text-danger">{error}</p>}

          <div className="d-flex align-items-center gap-3 mb-3">
            <img
              src={
                employee.profileImage
                  ? `http://localhost:8083${employee.profileImage}`
                  : "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0="
              }
              alt="Profile"
              className="employee-detail-avatar"
            />

            <div>
              <h5 className="mb-0">
                {employee.firstName} {employee.lastName}
              </h5>
              <small className="text-muted">
                {employee.designation} • {employee.role?.roleName}
              </small>
            </div>
          </div>


          <div className="row mt-3">
            <div className="col-md-6"><strong>Email:</strong> {employee.email}</div>

            <div className="col-md-6"><strong>Phone:</strong> {employee.phone || "—"}</div>
            <div className="col-md-6"><strong>Address:</strong> {employee.address || "—"}</div>

            <div className="col-md-6"><strong>Department:</strong> {employee.department?.departmentName}</div>
            <div className="col-md-6"><strong>Salary:</strong> {employee.salary || "—"}</div>

            <div className="col-md-6"><strong>Status:</strong> {employee.status}</div>
          </div>
        </div>


        {/* ================= PERSONAL UPDATE ================= */}
        {canEditPersonal && (
          <div className="accordion-card mb-4">
            <div
              className="accordion-header"
              onClick={() =>
                setOpenSection(openSection === "personal" ? null : "personal")
              }
            >
              <h5>Update Personal Details</h5>
              <span>{openSection === "personal" ? "−" : "+"}</span>
            </div>

            {openSection === "personal" && (
              <div className="accordion-body">
                <input
                  className="form-control mb-3"
                  name="phone"
                  value={personalForm.phone}
                  onChange={handlePersonalChange}
                  placeholder="Phone"
                />

                <textarea
                  className="form-control mb-3"
                  name="address"
                  value={personalForm.address}
                  onChange={handlePersonalChange}
                  placeholder="Address"
                />

                <button className="btn btn-primary" onClick={updatePersonal}>
                  Update Personal Info
                </button>
              </div>
            )}
          </div>
        )}


        {/* ================= ADMIN UPDATE (SUPERADMIN ONLY) ================= */}
        {canEditAdmin && (
          <div className="accordion-card mb-4">
            <div
              className="accordion-header admin"
              onClick={() =>
                setOpenSection(openSection === "admin" ? null : "admin")
              }
            >
              <h5>Update Admin Details</h5>
              <span>{openSection === "admin" ? "−" : "+"}</span>
            </div>

            {openSection === "admin" && (
              <div className="accordion-body">
                <input
                  className="form-control mb-3"
                  name="designation"
                  value={adminForm.designation}
                  onChange={handleAdminChange}
                  placeholder="Designation"
                />

                <input
                  className="form-control mb-3"
                  name="salary"
                  value={adminForm.salary}
                  onChange={handleAdminChange}
                  placeholder="Salary"
                />
                <select
                  className="form-select mb-3"
                  name="departmentId"
                  value={adminForm.departmentId}
                  onChange={handleAdminChange}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.departmentId} value={d.departmentId}>
                      {d.departmentName}
                    </option>
                  ))}
                </select>


                <select
                  className="form-select mb-3"
                  name="status"
                  value={adminForm.status}
                  onChange={handleAdminChange}
                >
                  <option value="">Select Status</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>

                <select
                  className="form-select mb-3"
                  name="role"
                  value={adminForm.role}
                  onChange={handleAdminChange}
                >
                  <option value="">Select Role</option>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="ADMIN">ADMIN</option>
                </select>

                <button className="btn btn-danger" onClick={updateAdmin}>
                  Update Admin Info
                </button>
              </div>
            )}
          </div>
        )}


        {/* ================= TASKS ================= */}
        <div className="card p-4 shadow-sm">
          <h5>Assigned Tasks</h5>

          {tasks.length === 0 ? (
            <p className="text-muted">No tasks assigned.</p>
          ) : (
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t, i) => (
                  <tr key={t.taskId}>
                    <td>{i + 1}</td>
                    <td>{t.title}</td>
                    <td>{t.status}</td>
                    <td>{t.dueDate || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
