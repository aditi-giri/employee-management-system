import React, { useEffect, useState } from "react";
import Topbar from "../components/layout/Topbar";
import { useNavigate } from "react-router-dom";
import { saveNotification } from "../utils/notificationStorage";


import {
    getAllEmployees,
    deleteEmployee,
    addEmployee,
} from "../services/employeeService";

import { getAllDepartments } from "../services/departmentService";
import { getAllRoles } from "../services/roleService";

import "./Employees.css";

const Employees = () => {
    const role = localStorage.getItem("role");
    const adminDeptId = Number(localStorage.getItem("deptId")); // IMPORTANT
    const navigate = useNavigate();


    // 🚫 EMPLOYEE CANNOT ACCESS THIS PAGE
    if (role === "EMPLOYEE") {
        return (
            <div className="container text-center py-5">
                <h3 className="text-danger">Access Denied</h3>
                <p>You are not authorized to view employee records.</p>
            </div>
        );
    }

    // ================= STATES =================
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);

    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [openAccordion, setOpenAccordion] = useState(null);

    const [filters, setFilters] = useState({
        departmentId: "",
        roleId: "",
        status: "",
    });

    const [sortOrder, setSortOrder] = useState("");
    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const totalPages = Math.ceil(filteredEmployees.length / limit);
    const paginatedEmployees = filteredEmployees.slice(
        (page - 1) * limit,
        page * limit
    );

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        gender: "",
        address: "",
        designation: "",
        salary: "",
        departmentId: "",
        roleId: "",
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");

    const [notificationMsg, setNotificationMsg] = useState(""); //notifications


    // ================= LOAD DATA =================
    useEffect(() => {
        async function load() {
            try {
                const empRes = await getAllEmployees();

                // 🔐 ADMIN → only own department employees
                const empData =
                    role === "ADMIN"
                        ? empRes.data.filter(
                            (e) =>
                                e.department?.departmentId === adminDeptId
                        )
                        : empRes.data;

                setEmployees(empData);
                setFilteredEmployees(empData);

                const deptRes = await getAllDepartments();
                setDepartments(deptRes.data);

                const roleRes = await getAllRoles();
                setRoles(roleRes.data);

                // 🔐 ADMIN → auto-set department in form
                if (role === "ADMIN") {
                    setForm((prev) => ({
                        ...prev,
                        departmentId: adminDeptId,
                    }));
                }
            } catch (err) {
                console.error(err);
            }
        }
        load();
    }, [role, adminDeptId]);


    // ================= FILTER + SEARCH =================
    useEffect(() => {
        let data = [...employees];

        if (filters.departmentId)
            data = data.filter(
                (e) =>
                    e.department?.departmentId ===
                    Number(filters.departmentId)
            );

        if (filters.roleId)
            data = data.filter(
                (e) => e.role?.roleId === Number(filters.roleId)
            );

        if (filters.status)
            data = data.filter((e) => e.status === filters.status);
        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(
                (e) =>
                    `${e.firstName} ${e.lastName}`
                        .toLowerCase()
                        .includes(q) ||
                    e.email.toLowerCase().includes(q)
            );
        }

        if (sortOrder === "asc") data.sort((a, b) => a.salary - b.salary);
        if (sortOrder === "desc") data.sort((a, b) => b.salary - a.salary);

        setFilteredEmployees(data);
        setPage(1);
    }, [filters, sortOrder, employees, search]);

    const handleFilterChange = (e) =>
        setFilters({ ...filters, [e.target.name]: e.target.value });


    // ================= FORM HANDLING =================
    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const validateForm = () => {
        let err = {};

        if (!form.firstName.trim()) err.firstName = "Required";
        if (!form.lastName.trim()) err.lastName = "Required";

        if (!form.email.trim()) err.email = "Required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) err.email = "Invalid email";

        if (!form.password.trim()) err.password = "Required";

        if (!form.designation.trim()) err.designation = "Required";

        if (!form.salary || isNaN(form.salary)) {
            err.salary = "Valid salary required";
        }

        // 🔴 DEPARTMENT VALIDATION (STRICT)
        if (role === "SUPERADMIN" && !form.departmentId) {
            err.departmentId = "Department is required";
        }

        if (role === "ADMIN" && !adminDeptId) {
            err.departmentId = "Admin department missing";
        }

        // 🔴 ROLE VALIDATION (STRICT)
        if (!form.roleId) {
            err.roleId = "Role is required";
        }

        setErrors(err);
        return Object.keys(err).length === 0;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        // 🛡️ FINAL GUARD (frontend safety)
        if (role === "ADMIN" && !adminDeptId) {
            setMessage("Admin department missing. Contact Superadmin.");
            return;
        }


        const payload = {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password,
            phone: form.phone,
            gender: form.gender,
            address: form.address,
            designation: form.designation,
            salary: Number(form.salary),
            department: { departmentId: Number(form.departmentId) },
            role: { roleId: Number(form.roleId) },
        };

        try {
            const res = await addEmployee(payload);
            setEmployees((prev) => [...prev, res.data]);
            setMessage("Employee added!");
            setShowPassword(false);
            setForm({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                phone: "",
                gender: "",
                address: "",
                designation: "",
                salary: "",
                departmentId: role === "ADMIN" ? adminDeptId : "",
                roleId: "",
            });
        } catch (err) {
            setMessage(err?.response?.data?.message || "Add failed");
        }
    };

    // ================= DELETE =================
    const handleDelete = async (id) => {
        if (!window.confirm("Deactivate employee?")) return;

        try {
            await deleteEmployee(id);
            setEmployees((prev) =>
                prev.filter((e) => e.employeeId !== id)
            );
        } catch (err) {
            alert("Delete failed");
        }
    };


    //notifications
    const sendNotification = () => {
        if (!notificationMsg.trim()) {
            alert("Notification message is required");
            return;
        }

        saveNotification({
            message: notificationMsg,
            senderRole: role,

            // ADMIN → employees of same dept only
            // SUPERADMIN → everyone
            targetRole: role === "ADMIN" ? "EMPLOYEE" : "ALL",

            departmentId: role === "ADMIN" ? adminDeptId : null,
        });


        setNotificationMsg("");
        alert("Announcement published.. !");
    };


    // ================= OPEN EMPLOYEE PROFILE =================
    const openEmployee = (emp) => {
        if (role === "ADMIN") {
            if (emp.department?.departmentId !== adminDeptId) {
                alert(
                    "Admins can only view employees in their own department."
                );
                return;
            }
        }
        navigate(`/employees/${emp.employeeId}`);
    };

    console.log("ROLE:", role);
    console.log("adminDeptId (from localStorage):", adminDeptId);
    console.log("Departments:", departments);
    console.log("Form departmentId:", form.departmentId);


    return (
        <div>
            <Topbar title="Employees" />

            <div className="container py-4 fade-in">


                {/* ================= SEND NOTIFICATION ================= */}
                {(role === "ADMIN" || role === "SUPERADMIN") && (
                    <div className="accordion-custom">

                        <div
                            className={`accordion-header-custom notify ${openAccordion === "notify" ? "open" : ""
                                }`}
                            onClick={() =>
                                setOpenAccordion(openAccordion === "notify" ? null : "notify")
                            }
                        >
                            <h4>📢Broadcast Announcement</h4>
                            <span>{openAccordion === "notify" ? "−" : "+"}</span>
                        </div>

                        {openAccordion === "notify" && (
                            <div className="accordion-body-custom">
                                <textarea
                                    className="form-control mb-3"
                                    rows="3"
                                    placeholder={
                                        role === "ADMIN"
                                            ? "Send notification to your department employees..."
                                            : "Send notification to all employees..."
                                    }
                                    value={notificationMsg}
                                    onChange={(e) => setNotificationMsg(e.target.value)}
                                />

                                <button className="btn btn-warning" onClick={sendNotification}>
                                publish Announcement 
                                </button>
                            </div>
                        )}

                    </div>
                )}


                {/* notifications */}
                {/* {(role === "ADMIN" || role === "SUPERADMIN") && (
  <div className="card-custom mb-4">
    <h4 className="section-title">Send Notification</h4>

    <textarea
      className="form-control mb-3"
      placeholder={
        role === "ADMIN"
          ? "Notify employees of your department"
          : "Notify all employees"
      }
      value={notificationMsg}
      onChange={(e) => setNotificationMsg(e.target.value)}
    />

    <button className="btn btn-primary" onClick={sendNotification}>
      Send Notification
    </button>
  </div>
)} */}



                {/* ================= ADD EMPLOYEE — ADMIN & SUPERADMIN ================= */}
                {(role === "SUPERADMIN" || role === "ADMIN") && (
                    <div className="accordion-custom">

                        <div
                            className={`accordion-header-custom add ${openAccordion === "addEmployee" ? "open" : ""
                                }`}
                            onClick={() =>
                                setOpenAccordion(openAccordion === "addEmployee" ? null : "addEmployee")
                            }
                        >
                            <h4>Add Employee</h4>
                            <span>{openAccordion === "addEmployee" ? "−" : "+"}</span>
                        </div>

                        {openAccordion === "addEmployee" && (
                            <div className="accordion-body-custom">
                                {message && <p className="text-success">{message}</p>}

                                <form onSubmit={handleSubmit}>
                                    <div className="row">


                                        <div className="col-md-6 mb-3">
                                            <label>First Name</label>
                                            <input className="form-control" name="firstName" value={form.firstName} onChange={handleChange} />
                                            {errors.firstName && <small className="text-danger">{errors.firstName}</small>}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label>Last Name</label>
                                            <input className="form-control" name="lastName" value={form.lastName} onChange={handleChange} />
                                            {errors.lastName && <small className="text-danger">{errors.lastName}</small>}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label>Email</label>
                                            <input className="form-control" name="email" value={form.email} onChange={handleChange} />
                                            {errors.email && <small className="text-danger">{errors.email}</small>}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label>Password</label>

                                            <div style={{ position: "relative" }}>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    className="form-control"
                                                    name="password"
                                                    value={form.password}
                                                    onChange={handleChange}
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    style={{
                                                        position: "absolute",
                                                        right: "10px",
                                                        top: "50%",
                                                        transform: "translateY(-50%)",
                                                        background: "none",
                                                        border: "none",
                                                        color: "#F15E2E",
                                                        fontWeight: "bold",
                                                        cursor: "pointer",
                                                        fontSize: "13px",
                                                    }}
                                                >
                                                    {showPassword ? "Hide" : "Show"}
                                                </button>
                                            </div>

                                            {errors.password && (
                                                <small className="text-danger">{errors.password}</small>
                                            )}
                                        </div>


                                        <div className="col-md-6 mb-3">
                                            <label>Designation</label>
                                            <input className="form-control" name="designation" value={form.designation} onChange={handleChange} />
                                            {errors.designation && <small className="text-danger">{errors.designation}</small>}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label>Salary</label>
                                            <input className="form-control" name="salary" value={form.salary} onChange={handleChange} />
                                            {errors.salary && <small className="text-danger">{errors.salary}</small>}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label>Department</label>
                                            <select
                                                className="form-select"
                                                name="departmentId"
                                                value={
                                                    role === "ADMIN"
                                                        ? adminDeptId
                                                        : form.departmentId
                                                }
                                                onChange={handleChange}
                                                disabled={role === "ADMIN"}
                                            >
                                                {role !== "ADMIN" && <option value="">Select</option>}

                                                {departments.map((d) => (
                                                    <option
                                                        key={d.departmentId}
                                                        value={d.departmentId}
                                                    >
                                                        {d.departmentName}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.departmentId && (
                                                <small className="text-danger">{errors.departmentId}</small>
                                            )}

                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label>Role</label>
                                            <select className="form-select" name="roleId" value={form.roleId} onChange={handleChange}>
                                                <option value="">Select</option>
                                                {roles.map((r) => (
                                                    <option key={r.roleId} value={r.roleId}>
                                                        {r.roleName}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.roleId && (
                                                <small className="text-danger">{errors.roleId}</small>
                                            )}

                                        </div>
                                    </div>

                                    <button className="btn btn-primary mt-2">Add Employee</button>
                                </form>
                            </div>
                        )}
                    </div>
                )}



                {/* ================= FILTER + SORT ================= */}
                <div className="card-custom">
                    <h5 className="section-title">Filters</h5>

                    <div className="filter-grid">

                        {/* SUPERADMIN → show Department filter */}
                        {role === "SUPERADMIN" && (
                            <div>
                                <label className="filter-label">Department</label>
                                <select
                                    className="form-select"
                                    name="departmentId"
                                    value={filters.departmentId}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All</option>
                                    {departments.map((d) => (
                                        <option key={d.departmentId} value={d.departmentId}>
                                            {d.departmentName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* SUPERADMIN → show Role filter */}
                        {role === "SUPERADMIN" && (
                            <div>
                                <label className="filter-label">Role</label>
                                <select
                                    className="form-select"
                                    name="roleId"
                                    value={filters.roleId}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All</option>
                                    {roles.map((r) => (
                                        <option key={r.roleId} value={r.roleId}>
                                            {r.roleName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Status → visible for ADMIN & SUPERADMIN */}
                        <div>
                            <label className="filter-label">Status</label>
                            <select
                                className="form-select"
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                            >
                                <option value="">All</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>

                        {/* Sort Salary → visible for both ADMIN & SUPERADMIN */}
                        <div>
                            <label className="filter-label">Sort Salary</label>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => setSortOrder("asc")}
                                >
                                    Low → High
                                </button>
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => setSortOrder("desc")}
                                >
                                    High → Low
                                </button>
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => setSortOrder("")}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                    </div>
                </div>


                {/* ================= SEARCH BAR ================= */}
                <div className="card-custom search-box">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-6">
                            <h5 className="section-title mb-0">Search Employees</h5>
                        </div>

                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* ================= TABLE ================= */}
                <div className="card-custom table-responsive">
                    <table className="table table-hover table-custom">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Photo</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Role</th>
                                <th>Designation</th>
                                <th>Salary</th>
                                <th>Status</th>
                                {role === "SUPERADMIN" && <th>Action</th>}
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedEmployees.map((emp, idx) => (
                                <tr
                                    key={emp.employeeId}
                                    onClick={() => openEmployee(emp)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <td>{(page - 1) * limit + idx + 1}</td>

                                    {/* 👤 PROFILE IMAGE */}
                                    <td>
                                        <img
                                            src={
                                                emp.profileImage
                                                    ? `http://localhost:8083${emp.profileImage}`
                                                    : "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0="
                                            }
                                            alt="Profile"
                                            className="employee-avatar"
                                        />
                                    </td>

                                    <td>{emp.firstName} {emp.lastName}</td>
                                    <td>{emp.email}</td>
                                    <td>{emp.department?.departmentName}</td>
                                    <td>{emp.role?.roleName}</td>
                                    <td>{emp.designation || "—"}</td>
                                    <td>{emp.salary || "—"}</td>
                                    <td>
                                        <span
                                            className={
                                                emp.status === "ACTIVE"
                                                    ? "table-status-active"
                                                    : "table-status-inactive"
                                            }
                                        >
                                            {emp.status}
                                        </span>
                                    </td>

                                    {role === "SUPERADMIN" && (
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(emp.employeeId)}
                                            >
                                                Deactivate
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>

                    </table>

                    {/* PAGINATION */}
                    <div className="pagination-box d-flex justify-content-between align-items-center">
                        <div>
                            <label>Rows per page</label>
                            <select
                                className="form-select d-inline-block w-auto ms-2"
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                            </select>
                        </div>

                        <div>
                            <button
                                className="btn btn-secondary btn-sm me-2"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                Previous
                            </button>

                            <span>Page {page} of {totalPages}</span>

                            <button
                                className="btn btn-secondary btn-sm ms-2"
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Employees;
