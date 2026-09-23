
import { useEffect, useState } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/api/plans`;

function DailyPlanner() {
  const [plans, setPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [newPlan, setNewPlan] = useState({
    time: "",
    title: "",
  });

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to fetch plans:", data);
        return;
      }

      setPlans(data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleAddPlan = async (event) => {
    event.preventDefault();

    if (!newPlan.time || !newPlan.title) {
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(newPlan),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to create plan:", data);
        return;
      }

      setPlans((previousPlans) => [...previousPlans, data.plan]);

      setNewPlan({
        time: "",
        title: "",
      });

      setShowForm(false);
    } catch (error) {
      console.error("Error creating plan:", error);
    }
  };

  const handleTogglePlan = async (id, completed) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          completed: !completed,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to update plan:", data);
        return;
      }

      setPlans((previousPlans) =>
        previousPlans.map((plan) =>
          plan.id === id ? data.plan : plan
        )
      );
    } catch (error) {
      console.error("Error updating plan:", error);
    }
  };

  const handleDeletePlan = async (id) => {
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

      setPlans((previousPlans) =>
        previousPlans.filter((plan) => plan.id !== id)
      );
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  return (
    <section className="daily-planner">
      <div className="daily-planner-header">
        <div>
          <p className="section-label">DAILY PLANNER</p>
          <h2>Plan your day.</h2>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Plan"}
        </button>
      </div>

      {showForm && (
        <form className="plan-form" onSubmit={handleAddPlan}>
          <input
            type="time"
            value={newPlan.time}
            onChange={(event) =>
              setNewPlan({
                ...newPlan,
                time: event.target.value,
              })
            }
            required
          />

          <input
            type="text"
            placeholder="What are you planning?"
            value={newPlan.title}
            onChange={(event) =>
              setNewPlan({
                ...newPlan,
                title: event.target.value,
              })
            }
            required
          />

          <button type="submit">Add</button>
        </form>
      )}

      <div className="planner-list">
        {plans.length === 0 ? (
          <p className="empty-state">
            No plans yet. Add one to get started.
          </p>
        ) : (
          plans.map((plan) => (
            <div className="planner-item" key={plan.id}>
              <div className="planner-time">{plan.time}</div>

              <div className="planner-content">
                <input
                  type="checkbox"
                  checked={plan.completed}
                  onChange={() =>
                    handleTogglePlan(plan.id, plan.completed)
                  }
                />

                <span
                  className={plan.completed ? "completed" : ""}
                >
                  {plan.title}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDeletePlan(plan.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default DailyPlanner;

