import React, { useState, useContext } from 'react';
import api from '../../api/api';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Register(){
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [err, setErr] = useState('');
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user);
      nav('/tasks');
    } catch (error) {
      setErr(error?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Register</h2>
      {err && <div style={{color:'red'}}>{err}</div>}
      <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/>
      <input placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required/>
      <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required/>
      <button type="submit">Register</button>
    </form>
  );
}
