import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <img src="/logo-light.png" alt="ManageEase" className="h-8" />
        <span className="font-semibold text-lg text-blue-600">ManageEase</span>
      </div>
      <div className="space-x-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <Link to="/tasks" className="hover:text-blue-600">Tasks</Link>
        <Link to="/profile" className="hover:text-blue-600">Profile</Link>
        <Link to="/auth" className="text-blue-600 font-semibold">Login</Link>
      </div>
    </nav>
  );
}
