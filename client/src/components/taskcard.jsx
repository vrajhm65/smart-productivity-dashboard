function TaskCard({ title, time, completed }) {
  return (
    <div className="task-card">
      <div className={`task-check ${completed ? "completed" : ""}`}>
        {completed ? "✓" : ""}
      </div>

      <div className="task-info">
        <h4>{title}</h4>
        <p>{time}</p>
      </div>
    </div>
  );
}

export default TaskCard;