import { useEffect, useState } from "react";

function FocusTimer({ seconds, setSeconds, onSessionSaved }) {
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5000/api/focus";
  const TIMER_URL = `${API_URL}/timer`;

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    const loadTimer = async () => {
      try {
        const response = await fetch(TIMER_URL, {
          headers: getHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Failed to load timer:", data);
          return;
        }

        setSeconds(data.seconds);
        setRunning(data.running);
      } catch (error) {
        console.error("Error loading timer:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTimer();
  }, [setSeconds]);

  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setSeconds((previousSeconds) => previousSeconds + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [running, setSeconds]);

  const saveTimer = async (currentSeconds, currentRunning) => {
    try {
      const response = await fetch(TIMER_URL, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          seconds: currentSeconds,
          running: currentRunning,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Timer save failed:", data);
      }
    } catch (error) {
      console.error("Error saving timer:", error);
    }
  };

  const handleStartPause = async () => {
    if (running) {
      setRunning(false);

      await saveTimer(seconds, false);

      if (seconds > 0) {
        try {
          const response = await fetch(API_URL, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
              duration: seconds,
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            console.error("Focus session save failed:", result);
          } else {
            if (onSessionSaved) {
              onSessionSaved(result.session);
            }
          }
        } catch (error) {
          console.error("Error saving focus session:", error);
        }
      }
    } else {
      setRunning(true);

      await saveTimer(seconds, true);
    }
  };

  const handleReset = async () => {
    setRunning(false);
    setSeconds(0);

    await saveTimer(0, false);
  };

  const safeSeconds = Number(seconds) || 0;

const minutes = Math.floor(safeSeconds / 60);
const remainingSeconds = safeSeconds % 60;

  if (loading) {
    return (
      <section className="focus-timer">
        <p className="section-label">FOCUS TIMER</p>
        <h2>Loading...</h2>
      </section>
    );
  }

  return (
    <section className="focus-timer">
      <p className="section-label">FOCUS TIMER</p>

      <h2>
        {String(minutes).padStart(2, "0")}:
        {String(remainingSeconds).padStart(2, "0")}
      </h2>

      <button type="button" onClick={handleStartPause}>
        {running ? "Pause" : "Start"}
      </button>

      <button type="button" onClick={handleReset}>
        Reset
      </button>
    </section>
  );
}

export default FocusTimer;