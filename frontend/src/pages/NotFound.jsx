import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deep">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
        <p className="text-sm text-text-muted mb-4">Page not found</p>
        <Link to="/" className="btn-primary text-sm">Go Home</Link>
      </div>
    </div>
  );
}
