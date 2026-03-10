import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import "./DepartmentDetails.css";

import { getDepartmentById } from "../services/departmentService";
import { getEmployeesByDepartment } from "../services/employeeService";

const DepartmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [department, setDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  // ============================
  // LOAD DATA
  // ============================
  useEffect(() => {
    async function load() {
      try {
        const deptRes = await getDepartmentById(id);
        setDepartment(deptRes.data);

        const empRes = await getEmployeesByDepartment(id);
        setEmployees(empRes.data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [id]);

  // ============================
  // SEARCH + SORT
  // ============================
  const filteredEmployees = useMemo(() => {
    let data = [...employees];

    // Search
    if (search.trim()) {
      const term = search.toLowerCase();
      data = data.filter(
        (e) =>
          e.firstName.toLowerCase().includes(term) ||
          e.lastName.toLowerCase().includes(term) ||
          e.email.toLowerCase().includes(term)
      );
    }

    // Sort
    if (sortBy === "name-asc") {
      data.sort((a, b) =>
        (a.firstName + " " + a.lastName).localeCompare(b.firstName + " " + b.lastName)
      );
    }
    if (sortBy === "name-desc") {
      data.sort((a, b) =>
        (b.firstName + " " + b.lastName).localeCompare(a.firstName + " " + a.lastName)
      );
    }
    if (sortBy === "salary-asc") {
      data.sort((a, b) => (a.salary || 0) - (b.salary || 0));
    }
    if (sortBy === "salary-desc") {
      data.sort((a, b) => (b.salary || 0) - (a.salary || 0));
    }

    return data;
  }, [employees, search, sortBy]);

  // Pagination logic
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(start, end);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  if (!department) return <div className="dept-loading">Loading...</div>;

  return (
    <div>
      <Topbar title={`Department: ${department.departmentName}`} />

      <div className="dept-container container">

        {/* =====================
            DEPARTMENT CARD
        ===================== */}
        <div className="dept-card shadow-sm">
          <h2 className="dept-title">{department.departmentName}</h2>

          <p className="dept-description">
            {department.description || "No description provided for this department."}
          </p>

          <div className="dept-stats">
            <div className="dept-stat-box">
              <h6>Total Employees</h6>
              <h3>{employees.length}</h3>
            </div>

            <div className="dept-stat-box">
              <h6>Active</h6>
              <h3>{employees.filter((e) => e.status === "ACTIVE").length}</h3>
            </div>

            <div className="dept-stat-box">
              <h6>Inactive</h6>
              <h3>{employees.filter((e) => e.status === "INACTIVE").length}</h3>
            </div>
          </div>
        </div>

        {/* =====================
            FILTERS
        ===================== */}
        <div className="dept-filter-card shadow-sm">
          <div className="row g-3 align-items-end">

            <div className="col-md-6">
              <label className="filter-label">Search</label>
              <input
                type="text"
                placeholder="Search name or email..."
                className="form-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="filter-label">Sort by</label>
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">Select</option>
                <option value="name-asc">Name (A → Z)</option>
                <option value="name-desc">Name (Z → A)</option>
                <option value="salary-asc">Salary (Low → High)</option>
                <option value="salary-desc">Salary (High → Low)</option>
              </select>
            </div>

            <div className="col-md-2">
              <button className="btn dept-back-btn w-100" onClick={() => navigate("/departments")}>
                Back
              </button>
            </div>

          </div>
        </div>

        {/* =====================
            EMPLOYEE TABLE
        ===================== */}
        <div className="dept-table-card shadow-sm">
          <table className="table table-hover dept-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Designation</th>
                <th>Salary</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {currentEmployees.map((emp, idx) => (
                <tr
                  key={emp.employeeId}
                  className="dept-row"
                  onClick={() => navigate(`/employees/${emp.employeeId}`)}
                >
                  <td>{start + idx + 1}</td>
                  <td>{emp.firstName} {emp.lastName}</td>
                  <td>{emp.email}</td>
                  <td>{emp.designation || "—"}</td>
                  <td>{emp.salary || "—"}</td>
                  <td>
                    <span className={`status-chip ${emp.status.toLowerCase()}`}>
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="dept-pagination">
            {[...Array(totalPages).keys()].map((num) => (
              <button
                key={num}
                className={`page-btn ${currentPage === num + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(num + 1)}
              >
                {num + 1}
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};

export default DepartmentDetails;
