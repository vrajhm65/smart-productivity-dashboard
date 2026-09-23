import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/header";

function Daily() {
  const [plans, setPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);

  const [planForm, setPlanForm] = useState({
    time: "",
    title: "",
  });

  const token = localStorage.getItem("token");
  const API_URL = "http://localhost:5000/api/plans";

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const fetchPlans = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: getHeaders(),
      });

      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setPlans(data);
      }
    } catch (error) {
      console.error("Error fetching daily plans:", error);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const resetForm = () => {
    setPlanForm({
      time: "",
      title: "",
    });
    setEditingPlanId(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setPlanForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const submitPlan = async (event) => {
    event.preventDefault();

    const title = planForm.title.trim();

    if (!planForm.time || !title) {
      return;
    }

    const payload = {
      time: planForm.time,
      title,
    };

    try {
      const response = await fetch(
        editingPlanId
          ? `${API_URL}/${editingPlanId}`
          : API_URL,
        {
          method: editingPlanId ? "PUT" : "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          editingPlanId
            ? "Failed to edit plan:"
            : "Failed to add plan:",
          data
        );
        return;
      }

      if (editingPlanId) {
        setPlans((previous) =>
          previous.map((plan) =>
            plan.id === editingPlanId ? data.plan : plan
          )
        );
      } else {
        setPlans((previous) => [...previous, data.plan]);
      }

      closeForm();
    } catch (error) {
      console.error(
        editingPlanId
          ? "Error editing plan:"
          : "Error adding plan:",
        error
      );
    }
  };

  const startEditing = (plan) => {
    setEditingPlanId(plan.id);
    setPlanForm({
      time: plan.time || "",
      title: plan.title || "",
    });
    setShowForm(true);
  };

  const togglePlan = async (plan) => {
    try {
      const response = await fetch(`${API_URL}/${plan.id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          completed: !plan.completed,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to update plan:", data);
        return;
      }

      setPlans((previous) =>
        previous.map((item) =>
          item.id === plan.id ? data.plan : item
        )
      );
    } catch (error) {
      console.error("Error updating plan:", error);
    }
  };

  const deletePlan = async (id) => {
    const shouldDelete = window.confirm(
      "Delete this plan from your day?"
    );

    if (!shouldDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to delete plan:", data);
        return;
      }

      setPlans((previous) =>
        previous.filter((plan) => plan.id !== id)
      );

      if (editingPlanId === id) {
        closeForm();
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  const sortedPlans = plans
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time));

  const completedPlans = plans.filter(
    (plan) => plan.completed
  ).length;

  const pendingPlans = plans.length - completedPlans;

  const progress =
    plans.length > 0
      ? Math.round((completedPlans / plans.length) * 100)
      : 0;

  const today = new Date();

  const dateText = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="daily-page">
          <div className="daily-page-header daily-page-header-polished">
            <div>
              <p className="section-label">DAILY PLANNER</p>
              <h1>Plan your day.</h1>
              <p className="daily-date">{dateText}</p>
            </div>

            <button
              className="add-plan-button"
              type="button"
              onClick={showForm ? closeForm : openAddForm}
            >
              {showForm ? "Cancel" : "+ Add Plan"}
            </button>
          </div>

          <div className="daily-overview">
            <div className="daily-progress-card daily-progress-main">
              <div className="daily-progress-top">
                <div>
                  <span className="daily-card-label">TODAY'S PROGRESS</span>
                  <strong>{completedPlans} of {plans.length} plans completed</strong>
                </div>
                <div className="daily-progress-percent">{progress}%</div>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="daily-mini-stat">
              <span>PLANS</span>
              <strong>{plans.length}</strong>
            </div>

            <div className="daily-mini-stat">
              <span>REMAINING</span>
              <strong>{pendingPlans}</strong>
            </div>
          </div>

          {showForm && (
            <form className="daily-form daily-form-polished" onSubmit={submitPlan}>
              <div className="daily-form-heading">
                <span>{editingPlanId ? "EDIT PLAN" : "NEW PLAN"}</span>
                <strong>
                  {editingPlanId
                    ? "Update the time or activity."
                    : "Add an activity to your schedule."}
                </strong>
              </div>

              <div className="daily-form-fields">
                <label>
                  <span>Time</span>
                  <input
                    type="time"
                    name="time"
                    value={planForm.time}
                    onChange={handleFormChange}
                    required
                  />
                </label>

                <label className="daily-form-title-field">
                  <span>Activity</span>
                  <input
                    type="text"
                    name="title"
                    placeholder="What do you want to accomplish?"
                    value={planForm.title}
                    onChange={handleFormChange}
                    required
                  />
                </label>

                <div className="daily-form-actions">
                  <button
                    type="button"
                    className="daily-form-cancel"
                    onClick={closeForm}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="daily-form-submit">
                    {editingPlanId ? "Save Changes" : "Add Plan"}
                  </button>
                </div>
              </div>
            </form>
          )}

          <section className="daily-schedule-card">
            <div className="daily-schedule-header">
              <div>
                <span className="section-label">YOUR SCHEDULE</span>
                <h2>Today's plans</h2>
              </div>
              <span className="daily-schedule-count">
                {plans.length} {plans.length === 1 ? "plan" : "plans"}
              </span>
            </div>

            {plans.length === 0 ? (
              <div className="daily-empty daily-empty-polished">
                <div className="empty-icon">✦</div>
                <h2>Your day is empty.</h2>
                <p>Add your first plan and build your schedule.</p>
                <button type="button" onClick={openAddForm}>
                  + Create First Plan
                </button>
              </div>
            ) : (
              <div className="daily-schedule-list">
                {sortedPlans.map((plan, index) => (
                  <div
                    className={`daily-plan daily-plan-polished ${
                      plan.completed ? "plan-completed" : ""
                    }`}
                    key={plan.id}
                  >
                    <div className="daily-plan-time-wrap">
                      <span className="daily-plan-time">{plan.time}</span>
                      {index < sortedPlans.length - 1 && (
                        <span className="daily-plan-connector" aria-hidden="true" />
                      )}
                    </div>

                    <button
                      type="button"
                      className={`plan-check ${plan.completed ? "checked" : ""}`}
                      onClick={() => togglePlan(plan)}
                      aria-label={plan.completed ? "Mark plan as pending" : "Mark plan as completed"}
                    >
                      {plan.completed ? "✓" : ""}
                    </button>

                    <div className="daily-plan-content">
                      <span className="daily-plan-title">{plan.title}</span>
                      <span className="daily-plan-status">
                        {plan.completed ? "Completed" : "Scheduled"}
                      </span>
                    </div>

                    <div className="daily-plan-actions">
                      <button
                        type="button"
                        className="plan-edit"
                        onClick={() => startEditing(plan)}
                        aria-label={`Edit ${plan.title}`}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="plan-delete"
                        onClick={() => deletePlan(plan.id)}
                        aria-label={`Delete ${plan.title}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

export default Daily;
