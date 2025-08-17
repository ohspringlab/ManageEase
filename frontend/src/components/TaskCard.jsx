// frontend/src/components/TaskCard.jsx
const TaskCard = ({ task, onEdit, onDelete }) => {
  const priorityColors = {
    low: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700",
  };

  const statusColors = {
    "to do": "bg-gray-100 text-gray-700",
    "in progress": "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition">
      <h3 className="font-semibold text-lg">{task.title}</h3>
      <p className="text-sm text-gray-600">{task.description}</p>

      <div className="flex justify-between mt-2">
        <span className={`px-2 py-1 text-xs rounded ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <span className={`px-2 py-1 text-xs rounded ${statusColors[task.status]}`}>
          {task.status}
        </span>
      </div>

      <p className="mt-2 text-xs text-gray-500">Due: {task.dueDate}</p>

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onEdit(task)}
          className="px-3 py-1 text-sm bg-yellow-500 text-white rounded"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task._id)}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
