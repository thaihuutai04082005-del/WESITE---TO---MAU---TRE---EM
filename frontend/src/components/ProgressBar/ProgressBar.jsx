// Thanh tiến trình dùng cho Level & Rank.
export default function ProgressBar({ value = 0, max = 1, color = '#2B9BF4', label, sublabel, height = 14 }) {
  const pct = Math.max(0, Math.min(100, (value / (max || 1)) * 100));
  return (
    <div>
      {(label || sublabel) && (
        <div className="mb-1 flex items-baseline justify-between gap-2 text-sm font-bold">
          <span>{label}</span>
          <span className="text-muted">{sublabel}</span>
        </div>
      )}
      <div className="overflow-hidden rounded-full bg-primary-light" style={{ height }} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
