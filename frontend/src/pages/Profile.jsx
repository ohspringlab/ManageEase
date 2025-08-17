import { useState } from "react";

export default function Profile() {
  const [form, setForm] = useState({
    name: "John Doe",
    email: "john@example.com",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    console.log("Updated Profile:", form);
    alert("Profile Updated Successfully!");
  };

  const handleLogout = () => {
    console.log("User Logged Out");
    alert("Logged out successfully!");
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-8 text-center">
        
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <img
            src="https://i.pravatar.cc/120"
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-blue-100"
          />
        </div>

        {/* Form */}
        <form onSubmit={handleUpdate} className="space-y-4 text-left">
          <div>
            <label className="block text-gray-600 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Update Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Update Profile
          </button>
        </form>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white py-2 rounded mt-4 hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
