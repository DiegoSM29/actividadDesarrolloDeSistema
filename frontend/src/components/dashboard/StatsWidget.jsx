export default function StatsWidget({ icon, value, label, colorClass }) {
  return (
    <div className="stat-widget">
      <div className={`stat-icon ${colorClass}`}>
        {icon}
      </div>
      <div className="stat-info">
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
}
