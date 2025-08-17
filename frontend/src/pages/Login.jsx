import { useState } from "react";

export default function LoginRegister() {
  const [tab, setTab] = useState("login");

  return (
    <div className="max-w-md mx-auto mt-20 bg-white shadow rounded-lg p-8">
      <div className="flex justify-around mb-6">
        <button className={`px-4 py-2 ${tab === "login" ? "border-b-2 border-blue-600" : ""}`} onClick={() => setTab("login")}>
          Login
        </button>
        <button className={`px-4 py-2 ${tab === "register" ? "border-b-2 border-blue-600" : ""}`} onClick={() => setTab("register")}>
          Register
        </button>
      </div>

      {tab === "login" ? (
        <form className="space-y-4">
          <input type="email" placeholder="Email" className="w-full border px-4 py-2 rounded" />
          <input type="password" placeholder="Password" className="w-full border px-4 py-2 rounded" />
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
        </form>
      ) : (
        <form className="space-y-4">
          <input type="text" placeholder="Name" className="w-full border px-4 py-2 rounded" />
          <input type="email" placeholder="Email" className="w-full border px-4 py-2 rounded" />
          <input type="password" placeholder="Password" className="w-full border px-4 py-2 rounded" />
          <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Register</button>
        </form>
      )}
    </div>
  );
}
