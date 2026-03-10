import React, { useEffect, useState } from "react";
import Topbar from "../components/layout/Topbar";
import {
  getAllDepartments,
  addDepartment,
  deleteDepartment,
} from "../services/departmentService";
import { getEmployeesByDepartment } from "../services/employeeService";

import "./Departments.css";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [deptCounts, setDeptCounts] = useState({});
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const [error, setError] = useState("");      // ❗ NEW
  const [success, setSuccess] = useState("");  // ❗ NEW

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getAllDepartments();
    setDepartments(res.data);

    // Fetch employee count
    const counts = {};
    for (let d of res.data) {
      try {
        const empRes = await getEmployeesByDepartment(d.departmentId);
        counts[d.departmentId] = empRes.data.length;
      } catch {
        counts[d.departmentId] = 0;
      }
    }
    setDeptCounts(counts);
  };

  // ===========================
  // ADD DEPARTMENT (Updated)
  // ===========================
  const handleAdd = async () => {
    setError("");
    setSuccess("");

    if (!name.trim()) {
      return setError("Department name is required.");
    }

    // ❌ Duplicate check (client-side)
    if (
      departments.some(
        (d) =>
          d.departmentName.toLowerCase() === name.trim().toLowerCase()
      )
    ) {
      return setError("Department name already exists.");
    }

    try {
      const res = await addDepartment({
        departmentName: name.trim(),
        description: desc.trim(),
      });

      setDepartments([...departments, res.data]);
      setName("");
      setDesc("");

      setSuccess("Department added successfully!");
    } catch (err) {
      const backendMessage = err?.response?.data?.message;

      // ❌ Convert SQL duplicate error to readable text
      if (backendMessage?.includes("Duplicate entry")) {
        setError("Department name already exists.");
      } else {
        setError(backendMessage || "Failed to add department.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete department?")) return;
    await deleteDepartment(id);
    setDepartments((prev) => prev.filter((d) => d.departmentId !== id));
  };

  // Pagination logic
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentDepartments = departments.slice(indexFirst, indexLast);

  return (
    <div>
      <Topbar title="Departments" />
      <div className="dept-page container">

        {/* ===================== ADD DEPARTMENT ===================== */}
        <div className="dept-add-card shadow-sm">
          <h4 className="section-title">Add Department</h4>

          {/* NEW: Error & Success UI */}
          {error && (
            <p className="text-danger fw-semibold mt-1">{error}</p>
          )}
          {success && (
            <p className="text-success fw-semibold mt-1">{success}</p>
          )}

          <div className="row g-3 align-items-center">

            <div className="col-md-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control"
                placeholder="Department name"
              />
            </div>

            <div className="col-md-6">
              <input
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="form-control"
                placeholder="Description"
              />
            </div>

            <div className="col-md-2">
              <button className="btn dept-add-btn w-100" onClick={handleAdd}>
                Add
              </button>
            </div>
          </div>
        </div>

        {/* ===================== TABLE ===================== */}
        <div className="dept-table-card shadow-sm">
          <table className="table dept-table table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Department</th>
                <th>Description</th>
                <th>Employees</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentDepartments.map((d, idx) => (
                <tr
                  key={d.departmentId}
                  className="dept-row"
                  onClick={() =>
                    (window.location.href = `/departments/${d.departmentId}`)
                  }
                >
                  <td>{indexFirst + idx + 1}</td>
                  <td className="dept-name-cell">
                    <strong>{d.departmentName}</strong>
                  </td>
                  <td>{d.description}</td>
                  <td>
                    <span className="emp-count-chip">
                      {deptCounts[d.departmentId] ?? 0}
                    </span>
                  </td>

                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn btn-sm dept-delete-btn"
                      onClick={() => handleDelete(d.departmentId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="dept-pagination">
            {[...Array(Math.ceil(departments.length / itemsPerPage)).keys()].map(
              (num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num + 1)}
                  className={`page-btn ${currentPage === num + 1 ? "active" : ""}`}
                >
                  {num + 1}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Departments;
