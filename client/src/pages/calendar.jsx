import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/header";

function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [plans, setPlans] = useState([]);
  const [focusSessions, setFocusSessions] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newPlanTime, setNewPlanTime] = useState("");
  const [newPlanTitle, setNewPlanTitle] = useState("");

  const [savingTask, setSavingTask] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);

  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [taskResponse, planResponse, focusResponse] =
        await Promise.all([
          fetch("http://localhost:5000/api/tasks", {
            headers,
          }),
          fetch("http://localhost:5000/api/plans", {
            headers,
          }),
          fetch("http://localhost:5000/api/focus", {
            headers,
          }),
        ]);

      const taskData = await taskResponse.json();
      const planData = await planResponse.json();
      const focusData = await focusResponse.json();

      if (Array.isArray(taskData)) {
        setTasks(taskData);
      }

      if (Array.isArray(planData)) {
        setPlans(planData);
      }

      if (Array.isArray(focusData)) {
        setFocusSessions(focusData);
      }
    } catch (error) {
      console.error("Calendar data error:", error);
    }
  };

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const monthName = selectedDate.toLocaleString(
    "default",
    {
      month: "long",
    }
  );

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(date));
  };

  const selectedDateString = formatDate(selectedDate);

  /*
    New tasks/plans use their dedicated planning dates.

    Older records without a date still fall back to their
    existing completion/creation dates so existing data
    continues to appear on the calendar.
  */

  const getTaskDate = (task) => {
    if (task.dueDate) {
      return formatDate(task.dueDate);
    }

    if (task.completedAt) {
      return formatDate(task.completedAt);
    }

    if (task.createdAt) {
      return formatDate(task.createdAt);
    }

    return null;
  };

  const getPlanDate = (plan) => {
    if (plan.date) {
      return formatDate(plan.date);
    }

    if (plan.createdAt) {
      return formatDate(plan.createdAt);
    }

    return null;
  };

  const getFocusDate = (session) => {
    if (session.createdAt) {
      return formatDate(session.createdAt);
    }

    return null;
  };

  const selectedTasks = tasks.filter(
    (task) =>
      getTaskDate(task) === selectedDateString
  );

  const selectedPlans = plans.filter(
    (plan) =>
      getPlanDate(plan) === selectedDateString
  );

  const selectedFocusSessions = focusSessions.filter(
    (session) =>
      getFocusDate(session) === selectedDateString
  );

  const completedTasks = selectedTasks.filter(
    (task) => task.completed
  ).length;

  const completedPlans = selectedPlans.filter(
    (plan) => plan.completed
  ).length;

  const focusMinutes = Math.floor(
    selectedFocusSessions.reduce(
      (total, session) =>
        total + (Number(session.duration) || 0),
      0
    ) / 60
  );

  const previousMonth = () => {
    setSelectedDate(
      new Date(year, month - 1, 1)
    );
  };

  const nextMonth = () => {
    setSelectedDate(
      new Date(year, month + 1, 1)
    );
  };

  const selectDay = (day) => {
    setSelectedDate(
      new Date(year, month, day, 12, 0, 0)
    );

    setShowTaskForm(false);
    setShowPlanForm(false);
    setMessage("");
  };

  const isToday = (day) => {
    const today = new Date();

    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const hasActivity = (day) => {
    const date = formatDate(
      new Date(year, month, day)
    );

    return (
      tasks.some(
        (task) => getTaskDate(task) === date
      ) ||
      plans.some(
        (plan) => getPlanDate(plan) === date
      ) ||
      focusSessions.some(
        (session) => getFocusDate(session) === date
      )
    );
  };

  const closeForms = () => {
    setShowTaskForm(false);
    setShowPlanForm(false);
  };

  const handleAddTask = async (event) => {
    event.preventDefault();

    const title = newTaskTitle.trim();

    if (!title) {
      return;
    }

    try {
      setSavingTask(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/tasks",
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            dueDate: selectedDateString,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add task"
        );
      }

      if (data.task) {
        setTasks((previous) => [
          ...previous,
          data.task,
        ]);
      }

      setNewTaskTitle("");
      setShowTaskForm(false);
      setMessage("Task added to this date.");

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error("Add task error:", error);
      setMessage(error.message);
    } finally {
      setSavingTask(false);
    }
  };

  const handleAddPlan = async (event) => {
    event.preventDefault();

    const title = newPlanTitle.trim();

    if (!newPlanTime || !title) {
      return;
    }

    try {
      setSavingPlan(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/plans",
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            time: newPlanTime,
            title,
            date: selectedDateString,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add plan"
        );
      }

      if (data.plan) {
        setPlans((previous) => [
          ...previous,
          data.plan,
        ]);
      }

      setNewPlanTime("");
      setNewPlanTitle("");
      setShowPlanForm(false);
      setMessage("Plan added to this date.");

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error("Add plan error:", error);
      setMessage(error.message);
    } finally {
      setSavingPlan(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="calendar-page">

          {/* HEADER */}

          <div className="calendar-header">
            <div>
              <p className="section-label">
                CALENDAR
              </p>

              <h1>
                {monthName} {year}
              </h1>

              <p>
                View your productivity history and
                plan ahead.
              </p>
            </div>

            <div className="calendar-controls">
              <button onClick={previousMonth}>
                ←
              </button>

              <button
                onClick={() =>
                  setSelectedDate(new Date())
                }
              >
                Today
              </button>

              <button onClick={nextMonth}>
                →
              </button>
            </div>
          </div>

          {/* CALENDAR */}

          <div className="calendar-card">

            <div className="calendar-grid-wrap">

              <div className="calendar-weekdays">
                <div className="calendar-weekday">
                  Sun
                </div>
                <div className="calendar-weekday">
                  Mon
                </div>
                <div className="calendar-weekday">
                  Tue
                </div>
                <div className="calendar-weekday">
                  Wed
                </div>
                <div className="calendar-weekday">
                  Thu
                </div>
                <div className="calendar-weekday">
                  Fri
                </div>
                <div className="calendar-weekday">
                  Sat
                </div>
              </div>

              <div className="calendar-grid">

                {Array.from({
                  length: firstDay,
                }).map((_, index) => (
                  <div
                    className="calendar-day empty"
                    key={`empty-${index}`}
                  />
                ))}

                {Array.from(
                  { length: daysInMonth },
                  (_, index) => {
                    const day = index + 1;

                    const isSelected =
                      selectedDate.getDate() === day;

                    return (
                      <button
                        className={`calendar-day ${
                          isToday(day)
                            ? "today"
                            : ""
                        } ${
                          isSelected
                            ? "selected"
                            : ""
                        }`}
                        key={day}
                        onClick={() =>
                          selectDay(day)
                        }
                      >
                        <span className="day-number">
                          {day}
                        </span>

                        {hasActivity(day) && (
                          <span className="activity-dot">
                            •
                          </span>
                        )}

                        {isToday(day) && (
                          <span className="today-label">
                            Today
                          </span>
                        )}
                      </button>
                    );
                  }
                )}

              </div>
            </div>

            <div className="calendar-legend">
              <span
                className="activity-dot"
                aria-hidden="true"
              />

              <span>
                Activity recorded or planned
              </span>
            </div>

          </div>

          {/* SELECTED DAY */}

          <div className="selected-day-panel">

            <div className="selected-day-header">

              <div>
                <p className="section-label">
                  SELECTED DAY
                </p>

                <h2>
                  {selectedDate.toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </h2>
              </div>

              {/* PLANNING BUTTONS */}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskForm(
                      (previous) => !previous
                    );
                    setShowPlanForm(false);
                    setMessage("");
                  }}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "#ffffff",
                    color: "#111827",
                    border: "1px solid rgba(255,255,255,0.12)",
                    fontWeight: 600,
                  }}
                >
                  + Add Task
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPlanForm(
                      (previous) => !previous
                    );
                    setShowTaskForm(false);
                    setMessage("");
                  }}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "#8b5cf6",
                    color: "#ffffff",
                    fontWeight: 600,
                  }}
                >
                  + Add Plan
                </button>
              </div>

            </div>

            {/* ADD TASK */}

            {showTaskForm && (
              <form
                onSubmit={handleAddTask}
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  borderRadius: "14px",
                  background:
                    "rgba(255,255,255,0.035)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(event) =>
                    setNewTaskTitle(
                      event.target.value
                    )
                  }
                  placeholder="What do you need to do?"
                  autoFocus
                  style={{
                    flex: "1 1 240px",
                    minWidth: 0,
                    padding: "11px 13px",
                    borderRadius: "9px",
                    border:
                      "1px solid rgba(255,255,255,0.1)",
                    background:
                      "rgba(255,255,255,0.04)",
                    color: "inherit",
                  }}
                />

                <button
                  type="submit"
                  disabled={
                    savingTask ||
                    !newTaskTitle.trim()
                  }
                  style={{
                    padding: "10px 16px",
                    borderRadius: "9px",
                    background: "#8b5cf6",
                    color: "#ffffff",
                    fontWeight: 600,
                  }}
                >
                  {savingTask
                    ? "Adding..."
                    : "Add Task"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowTaskForm(false);
                    setNewTaskTitle("");
                  }}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "9px",
                    background:
                      "rgba(255,255,255,0.06)",
                    color: "inherit",
                  }}
                >
                  Cancel
                </button>
              </form>
            )}

            {/* ADD PLAN */}

            {showPlanForm && (
              <form
                onSubmit={handleAddPlan}
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  borderRadius: "14px",
                  background:
                    "rgba(255,255,255,0.035)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  display: "grid",
                  gridTemplateColumns:
                    "140px minmax(0, 1fr) auto auto",
                  gap: "10px",
                }}
              >
                <input
                  type="time"
                  value={newPlanTime}
                  onChange={(event) =>
                    setNewPlanTime(
                      event.target.value
                    )
                  }
                  style={{
                    minWidth: 0,
                    padding: "11px 13px",
                    borderRadius: "9px",
                    border:
                      "1px solid rgba(255,255,255,0.1)",
                    background:
                      "rgba(255,255,255,0.04)",
                    color: "inherit",
                  }}
                />

                <input
                  type="text"
                  value={newPlanTitle}
                  onChange={(event) =>
                    setNewPlanTitle(
                      event.target.value
                    )
                  }
                  placeholder="Plan title"
                  autoFocus
                  style={{
                    minWidth: 0,
                    padding: "11px 13px",
                    borderRadius: "9px",
                    border:
                      "1px solid rgba(255,255,255,0.1)",
                    background:
                      "rgba(255,255,255,0.04)",
                    color: "inherit",
                  }}
                />

                <button
                  type="submit"
                  disabled={
                    savingPlan ||
                    !newPlanTime ||
                    !newPlanTitle.trim()
                  }
                  style={{
                    padding: "10px 16px",
                    borderRadius: "9px",
                    background: "#8b5cf6",
                    color: "#ffffff",
                    fontWeight: 600,
                  }}
                >
                  {savingPlan
                    ? "Adding..."
                    : "Add Plan"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPlanForm(false);
                    setNewPlanTime("");
                    setNewPlanTitle("");
                  }}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "9px",
                    background:
                      "rgba(255,255,255,0.06)",
                    color: "inherit",
                  }}
                >
                  Cancel
                </button>
              </form>
            )}

            {message && (
              <p
                style={{
                  margin: "14px 0 0",
                  fontSize: "14px",
                  color: "#a78bfa",
                }}
              >
                {message}
              </p>
            )}

            {/* STATS */}

            <div className="calendar-stats">

              <div className="calendar-stat">
                <span>Tasks</span>

                <strong>
                  {completedTasks} /{" "}
                  {selectedTasks.length}
                </strong>
              </div>

              <div className="calendar-stat">
                <span>Plans</span>

                <strong>
                  {completedPlans} /{" "}
                  {selectedPlans.length}
                </strong>
              </div>

              <div className="calendar-stat">
                <span>Focus</span>

                <strong>
                  {focusMinutes} min
                </strong>
              </div>

            </div>

            {/* DETAILS */}

            <div className="calendar-details">

              <div>
                <h3>Tasks</h3>

                {selectedTasks.length === 0 ? (
                  <p className="empty-state">
                    No tasks for this day.
                  </p>
                ) : (
                  selectedTasks.map((task) => (
                    <div
                      className="calendar-detail-item"
                      key={task.id}
                    >
                      <span
                        className={
                          task.completed
                            ? "completed"
                            : ""
                        }
                      >
                        {task.title}
                      </span>

                      <span>
                        {task.completed
                          ? "✓"
                          : "Pending"}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div>
                <h3>Daily Plans</h3>

                {selectedPlans.length === 0 ? (
                  <p className="empty-state">
                    No plans for this day.
                  </p>
                ) : (
                  selectedPlans.map((plan) => (
                    <div
                      className="calendar-detail-item"
                      key={plan.id}
                    >
                      <span>
                        {plan.time} — {plan.title}
                      </span>

                      <span>
                        {plan.completed
                          ? "✓"
                          : "Pending"}
                      </span>
                    </div>
                  ))
                )}
              </div>

            </div>

          </div>

        </section>
      </main>
    </div>
  );
}

export default Calendar;