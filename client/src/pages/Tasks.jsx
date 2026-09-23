
import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/header";

const API_URL = import.meta.env.VITE_API_URL;
console.log("SMARTFLOW API URL:", API_URL);

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  // GET TASKS
  useEffect(() => {
    fetch(`${API_URL}/api/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setTasks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
        setLoading(false);
      });
  }, [token]);

  // ADD TASK
  const addTask = async (event) => {
    event.preventDefault();

    const title = newTaskTitle.trim();

    if (!title || saving) return;

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          completed: false,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Add task failed:", result);
        return;
      }

      setTasks((previousTasks) => [
        ...previousTasks,
        result.task,
      ]);

      setNewTaskTitle("");
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setSaving(false);
    }
  };

  // COMPLETE / UNCOMPLETE
  const toggleTask = async (task) => {
    try {
      const response = await fetch(
        `${API_URL}/api/tasks/${task.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            completed: !task.completed,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Update failed:", result);
        return;
      }

      setTasks((previousTasks) =>
        previousTasks.map((currentTask) =>
          currentTask.id === task.id
            ? result.task
            : currentTask
        )
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // START EDIT
  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  // CANCEL EDIT
  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTitle("");
  };

  // SAVE EDIT
  const saveEdit = async (task) => {
    const title = editingTitle.trim();

    if (!title) return;

    try {
      const response = await fetch(
        `${API_URL}/api/tasks/${task.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Edit failed:", result);
        return;
      }

      setTasks((previousTasks) =>
        previousTasks.map((currentTask) =>
          currentTask.id === task.id
            ? result.task
            : currentTask
        )
      );

      cancelEditing();
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

  // DELETE
  const deleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Delete this task?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Delete failed:", result);
        return;
      }

      setTasks((previousTasks) =>
        previousTasks.filter(
          (task) => task.id !== taskId
        )
      );
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks = totalTasks - completedTasks;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        );

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="tasks-page">

          {/* PAGE HEADER */}
          <div className="page-heading">
            <div>
              <p className="section-label">
                YOUR WORK
              </p>

              <h1>Tasks</h1>

              <p>
                Organize everything you need to accomplish.
              </p>
            </div>

            <div className="tasks-progress-summary">
              <strong>{progress}%</strong>
              <span>completed</span>
            </div>
          </div>

          {/* OVERVIEW */}
          <div className="task-overview">

            <div className="task-overview-card">
              <span>Total Tasks</span>
              <strong>{totalTasks}</strong>
            </div>

            <div className="task-overview-card">
              <span>Completed</span>
              <strong>{completedTasks}</strong>
            </div>

            <div className="task-overview-card">
              <span>Remaining</span>
              <strong>{pendingTasks}</strong>
            </div>

          </div>

          {/* ADD TASK */}
          <form
            className="task-form"
            onSubmit={addTask}
          >
            <input
              className="task-input"
              type="text"
              value={newTaskTitle}
              onChange={(event) =>
                setNewTaskTitle(event.target.value)
              }
              placeholder="What needs to be done?"
            />

            <button
              type="submit"
              className="task-add-button"
              disabled={saving}
            >
              {saving ? "Adding..." : "Add Task"}
            </button>
          </form>

          {/* PROGRESS */}
          <div className="tasks-progress-card">

            <div className="tasks-progress-top">
              <div>
                <span>Today's Progress</span>

                <strong>
                  {completedTasks} of {totalTasks} tasks
                </strong>
              </div>

              <strong>{progress}%</strong>
            </div>

            <div className="tasks-progress-bar">
              <span
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

          </div>

          {/* TASK LIST */}
          <div className="tasks-list">

            <div className="tasks-list-header">
              <div>
                <span className="section-label">
                  TASK LIST
                </span>

                <h2>Your tasks</h2>
              </div>

              <span className="task-count">
                {totalTasks}{" "}
                {totalTasks === 1 ? "task" : "tasks"}
              </span>
            </div>

            {loading ? (
              <div className="task-empty">
                <div className="empty-line" />

                <h3>Loading tasks</h3>

                <p>
                  Getting your tasks ready...
                </p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="task-empty">
                <div className="empty-line" />

                <h3>No tasks yet</h3>

                <p>
                  Add your first task above and start
                  making progress.
                </p>
              </div>
            ) : (
              tasks.map((task, index) => (
                <div
                  className={`task-card ${
                    task.completed
                      ? "is-complete"
                      : ""
                  }`}
                  key={task.id}
                >

                  {/* NUMBER */}
                  <div className="task-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  {/* CHECK */}
                  <button
                    type="button"
                    className={`task-check ${
                      task.completed
                        ? "completed"
                        : ""
                    }`}
                    onClick={() =>
                      toggleTask(task)
                    }
                    aria-label={
                      task.completed
                        ? "Mark task incomplete"
                        : "Mark task complete"
                    }
                  >
                    {task.completed ? "✓" : ""}
                  </button>

                  {/* CONTENT */}
                  <div className="task-card-content">

                    {editingTaskId === task.id ? (
                      <input
                        className="task-edit-input"
                        type="text"
                        value={editingTitle}
                        onChange={(event) =>
                          setEditingTitle(
                            event.target.value
                          )
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter"
                          ) {
                            saveEdit(task);
                          }

                          if (
                            event.key === "Escape"
                          ) {
                            cancelEditing();
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <>
                        <div
                          className={`task-card-title ${
                            task.completed
                              ? "completed"
                              : ""
                          }`}
                        >
                          {task.title}
                        </div>

                        <span className="task-card-status">
                          {task.completed
                            ? "Completed"
                            : "Pending"}
                        </span>
                      </>
                    )}

                  </div>

                  {/* ACTIONS */}
                  <div className="task-card-actions">

                    {editingTaskId === task.id ? (
                      <>
                        <button
                          type="button"
                          className="task-action primary"
                          onClick={() =>
                            saveEdit(task)
                          }
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          className="task-action"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="task-action"
                        onClick={() =>
                          startEditing(task)
                        }
                      >
                        Edit
                      </button>
                    )}

                    <button
                      type="button"
                      className="task-action danger"
                      onClick={() =>
                        deleteTask(task.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>
              ))
            )}

          </div>

        </section>
      </main>
    </div>
  );
}

export default Tasks;

