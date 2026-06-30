export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm mx-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-primary">DuePilot AI</h1>
            <p className="text-sm text-gray-500 mt-1">Navigate Every Deadline</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
