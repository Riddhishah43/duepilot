export default function StatCard({ title, value, icon }) {
  return (
    <div className="bg-bg-surface rounded-lg border border-default/50 p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-base flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-text-muted">{title}</p>
        <p className="text-xl font-bold mt-0.5">{value}</p>
      </div>
    </div>
  );
}
