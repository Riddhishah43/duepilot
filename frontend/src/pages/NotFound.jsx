import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
        <p className="text-sm text-gray-500 mb-4">Page not found</p>
        <Link to="/" className="text-sm bg-primary text-white px-4 py-2 rounded hover:bg-[#2a4560] transition-colors">Go Home</Link>
      </div>
    </div>
  );
}
