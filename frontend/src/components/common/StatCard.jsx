export default function StatCard({ title, value, icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 bg-accent-light">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-muted">{title}</p>
          <p className="stat-value mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
}
