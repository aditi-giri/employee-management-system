// src/pages/Tasks.jsx
import React, { useEffect, useState, useMemo } from "react";
import Topbar from "../components/layout/Topbar";
import {
  getAllTasks,
  getTasksAssignedToEmployee,
  deleteTask,
} from "../services/taskService";
import { useNavigate } from "react-router-dom";

// Calendar imports
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import addDays from "date-fns/addDays";
import addWeeks from "date-fns/addWeeks";
import addMonths from "date-fns/addMonths";
import "react-big-calendar/lib/css/react-big-calendar.css";

import "./Tasks.css";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Tasks = () => {
  const role = localStorage.getItem("role");
  const adminDeptId = Number(localStorage.getItem("deptId"));
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [displayList, setDisplayList] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const [calendarView, setCalendarView] = useState(false);
  const [kanbanView, setKanbanView] = useState(false);

  // ✅ CALENDAR STATE (FIX)
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarMode, setCalendarMode] = useState(Views.MONTH);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const totalPages = Math.ceil(displayList.length / limit);
  const paginated = displayList.slice((page - 1) * limit, page * limit);

  // ===================== LOAD TASKS =====================
  useEffect(() => {
    async function load() {
      try {
        if (role === "SUPERADMIN") {
          const res = await getAllTasks();
          setTasks(res.data);
          setDisplayList(res.data);
          return;
        }

        if (role === "ADMIN") {
          const res = await getAllTasks();
          const filtered = res.data.filter(
            (t) =>
              t.assignedTo &&
              t.assignedTo.department &&
              t.assignedTo.department.departmentId === adminDeptId
          );
          setTasks(filtered);
          setDisplayList(filtered);
          return;
        }

        const res = await getTasksAssignedToEmployee();
        setTasks(res.data);
        setDisplayList(res.data);
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, [role, adminDeptId]);

  // ===================== SEARCH / FILTER / SORT =====================
  useEffect(() => {
    let data = [...tasks];

    if (search.trim()) {
      const term = search.toLowerCase();
      data = data.filter((t) => {
        const assignedName =
          (t.assignedTo?.firstName + " " + t.assignedTo?.lastName).toLowerCase();
        return (
          t.title.toLowerCase().includes(term) ||
          assignedName.includes(term) ||
          t.assignedTo?.email?.toLowerCase().includes(term)
        );
      });
    }

    if (statusFilter) data = data.filter((t) => t.status === statusFilter);

    if (sortOrder === "asc")
      data.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    if (sortOrder === "desc")
      data.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));

    setDisplayList(data);
    setPage(1);
  }, [search, statusFilter, sortOrder, tasks]);

  // ===================== SUMMARY COUNTS (ADDED – FOR ALL ROLES) =====================
  const totalTasks = tasks.length;
  const pending = tasks.filter((t) => t.status === "PENDING").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const overdue = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate) < new Date() &&
      t.status !== "COMPLETED"
  ).length;

  // ===================== CALENDAR EVENTS =====================
  const events = useMemo(
    () =>
      tasks
        .filter((t) => t.dueDate)
        .map((t) => ({
          id: t.taskId,
          title: t.title,
          start: new Date(t.dueDate),
          end: new Date(t.dueDate),
          status: t.status,
          task: t,
        })),
    [tasks]
  );

  const eventStyleGetter = (event) => {
    let backgroundColor = "#6c757d";

    if (event.status === "PENDING") backgroundColor = "#ffc107";
    if (event.status === "IN_PROGRESS") backgroundColor = "#0dcaf0";
    if (event.status === "COMPLETED") backgroundColor = "#198754";

    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        color: "#000",
        border: "none",
        padding: "4px",
        cursor: "pointer",
      },
    };
  };

  const handleNavigate = (date, view, action) => {
    if (action === "TODAY") setCalendarDate(new Date());
    if (action === "PREV") {
      if (view === Views.MONTH) setCalendarDate(addMonths(calendarDate, -1));
      if (view === Views.WEEK) setCalendarDate(addWeeks(calendarDate, -1));
      if (view === Views.DAY) setCalendarDate(addDays(calendarDate, -1));
    }
    if (action === "NEXT") {
      if (view === Views.MONTH) setCalendarDate(addMonths(calendarDate, 1));
      if (view === Views.WEEK) setCalendarDate(addWeeks(calendarDate, 1));
      if (view === Views.DAY) setCalendarDate(addDays(calendarDate, 1));
    }
  };

  return (
    <div>
      <Topbar title="Tasks" />

      <div className="tasks-container container">
        {/* ===== SUMMARY CARDS (NOW VISIBLE FOR SUPERADMIN TOO) ===== */}
        <div className="summary-grid mb-4">
          <div className="summary-card"><h6>Total</h6><h3>{totalTasks}</h3></div>
          <div className="summary-card"><h6>Pending</h6><h3>{pending}</h3></div>
          <div className="summary-card"><h6>In Progress</h6><h3>{inProgress}</h3></div>
          <div className="summary-card"><h6>Completed</h6><h3>{completed}</h3></div>
          <div className="summary-card"><h6>Overdue</h6><h3>{overdue}</h3></div>
        </div>

        {/* ===== ADMIN ACTION BAR (UNCHANGED LOGIC) ===== */}
        {(role === "ADMIN" || role === "SUPERADMIN") && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            {role === "ADMIN" && (
              <button
                className="btn btn-primary"
                onClick={() => navigate("/tasks/create")}
              >
                ➕ Assign Task
              </button>
            )}

            <div className="btn-group">
              <button className={`btn btn-outline-secondary ${!calendarView && !kanbanView ? "active" : ""}`}
                onClick={() => { setCalendarView(false); setKanbanView(false); }}>
                Table
              </button>
              <button className={`btn btn-outline-secondary ${kanbanView ? "active" : ""}`}
                onClick={() => { setKanbanView(true); setCalendarView(false); }}>
                Kanban
              </button>
              <button className={`btn btn-outline-secondary ${calendarView ? "active" : ""}`}
                onClick={() => { setCalendarView(true); setKanbanView(false); }}>
                Calendar
              </button>
            </div>
          </div>
        )}

        {/* ✅ FULLY WORKING CALENDAR */}
        {calendarView && (
          <div className="table-card">
            <Calendar
              localizer={localizer}
              events={events}
              date={calendarDate}
              view={calendarMode}
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              onView={setCalendarMode}
              onNavigate={handleNavigate}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={(event) =>
                navigate(`/tasks/${event.id}`, { state: event.task })
              }
              popup
              style={{ height: 650 }}
            />
          </div>
        )}

        {/* ===== KANBAN VIEW (UNCHANGED) ===== */}
        {kanbanView && (
          <div className="row">
            {["PENDING", "IN_PROGRESS", "COMPLETED"].map((status) => (
              <div className="col-md-4" key={status}>
                <div className="card">
                  <div className="card-header fw-bold">{status}</div>
                  <div className="card-body">
                    {tasks
                      .filter((t) => t.status === status)
                      .map((t) => (
                        <div
                          key={t.taskId}
                          className="mb-2 p-2 border rounded"
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            navigate(`/tasks/${t.taskId}`, { state: t })
                          }
                        >
                          <strong>{t.title}</strong>
                          <br />
                          <small>{t.dueDate}</small>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== TABLE VIEW (UNCHANGED) ===== */}
        {!calendarView && !kanbanView && (
          <div className="table-card">
            <table className="table table-hover table-custom">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Assigned To</th>
                  <th>Assigned By</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  {role === "ADMIN" && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {paginated.map((t, i) => (
                  <tr
                    key={t.taskId}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/tasks/${t.taskId}`, { state: t })}
                  >
                    <td>{i + 1}</td>
                    <td>{t.title}</td>
                    <td>{t.assignedTo?.firstName}</td>
                    <td>{t.assignedBy?.firstName}</td>
                    <td>
                      <span
                        className={`badge ${t.status === "PENDING"
                            ? "bg-warning"
                            : t.status === "IN_PROGRESS"
                              ? "bg-info"
                              : "bg-success"
                          }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td>{t.dueDate || "—"}</td>

                    {role === "ADMIN" && (
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tasks/edit/${t.taskId}`, { state: t });
                          }}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!window.confirm("Delete this task?")) return;
                            await deleteTask(t.taskId);
                            setTasks((prev) =>
                              prev.filter((x) => x.taskId !== t.taskId)
                            );
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!calendarView && !kanbanView && (
          <div className="d-flex justify-content-between align-items-center mt-3">
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
                Prev
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
        )}
      </div>
    </div>
  );
};

export default Tasks;
