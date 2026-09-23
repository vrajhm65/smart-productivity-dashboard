function StatsCard({ title, value, subtitle }) {
  return (
    <div className="stats-card">
      <p className="stats-title">{title}</p>

      <h3>{value}</h3>

      <p className="stats-subtitle">{subtitle}</p>
    </div>
  );
}

export default StatsCard;