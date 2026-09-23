function DailyPanel({ tasks }) {
  const mainFocus = tasks.find((task) => !task.completed);
  return (
    <section className="daily-panel">
      <div className="daily-panel-header">
        <div>
          <p className="section-label">DAILY FOCUS</p>
          <h2>Make today count.</h2>
        </div>

        <span className="daily-date">
          Today
        </span>
      </div>

      <div className="daily-progress">
        <div className="progress-info">
          <span>Today's progress</span>
          <strong>
  {tasks.filter((task) => task.completed).length} / {tasks.length} tasks
</strong>
        </div>

        <div className="progress-bar">
  <div
    className="progress-fill"
    style={{
      width:
        tasks.length === 0
          ? "0%"
          : `${(tasks.filter((task) => task.completed).length / tasks.length) * 100}%`,
    }}
  >
    
  </div>
</div>
      </div>

      <div className="daily-focus">
        <span className="focus-icon">★</span>

        <div>
          <p className="section-label">MAIN FOCUS</p>
          <h3>
            {mainFocus ? mainFocus.title : "All tasks completed!"}
          </h3>
          <p>
            {mainFocus
            ? "Stay focused on your next pending task."
            : "Great work! You've completed all your tasks."}
          </p>
        </div>
      </div>
    </section>
  );
}

export default DailyPanel;