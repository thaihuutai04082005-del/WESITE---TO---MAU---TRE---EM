export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="page flex justify-center">
      <div className="card w-full max-w-md p-6">
        <div className="mb-4 flex items-center gap-3">
          <img src="/avatars/tho.svg" alt="" className="h-14 w-14 rounded-full" />
          <div>
            <h1 className="font-display text-3xl font-extrabold leading-tight">{title}</h1>
            {subtitle && <p className="text-muted">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
