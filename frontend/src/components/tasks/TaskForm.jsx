import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/api';
import { AuthContext } from '../../context/AuthContext';

export default function TaskForm({ existingTask, onSaved }) {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'low',
    status: 'to do',
    dueDate: '',
    assignedTo: user?.id || ''
  });
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);

  // Load form values when editing
  useEffect(() => {
    if (existingTask) {
      setForm({
        title: existingTask.title,
        description: existingTask.description || '',
        priority: existingTask.priority,
        status: existingTask.status,
        dueDate: existingTask.dueDate ? existingTask.dueDate.split('T')[0] : '',
        assignedTo: existingTask.assignedTo?._id || existingTask.assignedTo || user?.id
      });
    }
  }, [existingTask, user]);

  // Only admins need the full user list
  useEffect(() => {
    if (user?.role === 'admin') {
      api.get('/users?limit=100') // adjust pagination as needed
        .then(res => setUsers(res.data.users))
        .catch(() => setUsers([]));
    }
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let res;
      if (existingTask) {
        res = await api.put(`/tasks/${existingTask._id}`, form);
      } else {
        res = await api.post('/tasks', form);
      }
      onSaved(res.data);
      setForm({ title: '', description: '', priority: 'low', status: 'to do', dueDate: '', assignedTo: user?.id || '' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save task');
    }
  };

  return (
    <form onSubmit={submit} className="bg-white shadow-md rounded-lg p-6 space-y-4 max-w-md">
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          required
          className="w-full border rounded-md px-3 py-2 focus:ring focus:ring-blue-300"
          placeholder="Task title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="w-full border rounded-md px-3 py-2 focus:ring focus:ring-blue-300"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            className="w-full border rounded-md px-3 py-2"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            className="w-full border rounded-md px-3 py-2"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="to do">To do</option>
            <option value="in progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Due Date</label>
        <input
          type="date"
          className="w-full border rounded-md px-3 py-2"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
        />
      </div>

      {user?.role === 'admin' && (
        <div>
          <label className="block text-sm font-medium mb-1">Assign To</label>
          <select
            className="w-full border rounded-md px-3 py-2"
            value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
          >
            <option value="">-- Select user --</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        {existingTask ? 'Update Task' : 'Create Task'}
      </button>
    </form>
  );
}
