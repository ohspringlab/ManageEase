import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to ManageEase!</h1>
      <p className="text-gray-600 mb-6 max-w-xl">
        Stay organized and boost your productivity by managing your tasks and team members with ease.
      </p>
      <img src="/illustration.svg" alt="Task Management" className="h-60 mb-6" />
      <div className="space-x-4">
        <Link to="/tasks" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Get Started</Link>
        <Link to="/auth" className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">Login</Link>
      </div>
    </div>
  );
}
