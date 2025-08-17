import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/api';
import { AuthContext } from '../../context/AuthContext';

export default function Profile() {
  const { user, setUser, logout } = useContext(AuthContext);
  const [form, setForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email });
  }, [user]);

  const updateProfile = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      const res = await api.put(`/users/${user.id}`, form);
      setUser(res.data);
      setMsg('Profile updated successfully');
    } catch (error) {
      setErr(error?.response?.data?.message || 'Update failed');
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      await api.post('/users/change-password', passwordForm);
      setMsg('Password changed successfully, please log in again');
      logout();
    } catch (error) {
      setErr(error?.response?.data?.message || 'Password change failed');
    }
  };

  return (
    <div>
      <h2>My Profile</h2>
      {msg && <div style={{ color: 'green' }}>{msg}</div>}
      {err && <div style={{ color: 'red' }}>{err}</div>}

      <form onSubmit={updateProfile}>
        <h3>Update Info</h3>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Name"
          required
        />
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          required
        />
        <button type="submit">Save</button>
      </form>

      <form onSubmit={changePassword} style={{ marginTop: '20px' }}>
        <h3>Change Password</h3>
        <input
          type="password"
          placeholder="Current Password"
          value={passwordForm.currentPassword}
          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={passwordForm.newPassword}
          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
          required
        />
        <button type="submit">Change Password</button>
      </form>
    </div>
  );
}
