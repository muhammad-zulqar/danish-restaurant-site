import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../api';

export default function AdminLoginPage({ setToken }) {
  const [email, setEmail] = useState('admin@danishrestaurant.com');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await adminLogin({ email, password });
      setToken(result.token);
      localStorage.setItem('adminToken', result.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card narrow">
      <h1>Admin Login</h1>
      <form className="form-grid" onSubmit={submit}>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
      <p className="hint">Default: admin@danishrestaurant.com / Admin123! (change in server .env)</p>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
