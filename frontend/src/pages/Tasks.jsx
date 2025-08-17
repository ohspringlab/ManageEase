export default function Tasks() {
  return (
    <div className="max-w-6xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6">Tasks</h1>

      {/* Task Overview */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center shadow">To Do: 5</div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center shadow">In Progress: 3</div>
        <div className="bg-green-50 p-4 rounded-lg text-center shadow">Completed: 8</div>
      </div>

      {/* Task List Table */}
      <table className="w-full border rounded-lg shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Title</th>
            <th className="p-3">Priority</th>
            <th className="p-3">Status</th>
            <th className="p-3">Due Date</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-3">Finish Dashboard UI</td>
            <td className="p-3 text-red-500">High</td>
            <td className="p-3">To Do</td>
            <td className="p-3">2025-08-25</td>
            <td className="p-3 space-x-3">
              <button className="text-blue-600">✏️</button>
              <button className="text-red-600">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
