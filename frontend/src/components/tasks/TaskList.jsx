import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import TaskForm from './TaskForm';

export default function TaskList(){
  const [tasks, setTasks] = useState([]);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);

  const fetchTasks = async () => {
    const res = await api.get('/tasks', { params: { q: query, limit: 50 } });
    setTasks(res.data.tasks);
  };

  useEffect(()=> { fetchTasks(); }, []);

  const onDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${id}`);
    setTasks(tasks.filter(t => t._id !== id));
  };

  const onSaved = (task) => {
    setEditing(null);
    // refresh or replace in list:
    setTasks(prev => {
      const idx = prev.findIndex(p => p._id === task._id);
      if (idx >= 0) { prev[idx] = task; return [...prev]; }
      return [task, ...prev];
    });
  };

  return (
    <div>
      <h2>Tasks</h2>
      <div>
        <input placeholder="Search tasks" value={query} onChange={e=>setQuery(e.target.value)} />
        <button onClick={fetchTasks}>Search</button>
      </div>

      <TaskForm onSaved={onSaved} />

      <ul>
        {tasks.map(t => (
          <li key={t._id}>
            <strong>{t.title}</strong> — {t.priority} — {t.status} — assigned to: {t.assignedTo?.name || t.assignedTo}
            <div>
              <button onClick={()=> setEditing(t)}>Edit</button>
              <button onClick={()=> onDelete(t._id)}>Delete</button>
            </div>
            {editing && editing._id === t._1 && <TaskForm existingTask={editing} onSaved={onSaved} />}
          </li>
        ))}
      </ul>
    </div>
  );
}
