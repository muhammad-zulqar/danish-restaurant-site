import { useCallback, useEffect, useState } from 'react';
import {
  createAdminMenuItem,
  deleteAdminMenuItem,
  getAdminMenu,
  getAdminOrders,
  getAdminReservations,
  getAdminStats,
  updateAdminMenuItem,
  updateOrderStatus,
  updateReservationStatus,
} from '../api';

const reservationStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
const orderStatuses = ['received', 'preparing', 'ready', 'completed', 'cancelled'];

const initialMenuForm = {
  name: '',
  description: '',
  category: 'Mains',
  price: '',
  imageUrl: '',
  isFeatured: false,
  isActive: true,
};

export default function AdminDashboardPage({ token, onLogout }) {
  const [stats, setStats] = useState(null);
  const [menu, setMenu] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(initialMenuForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [statsData, menuData, reservationData, orderData] = await Promise.all([
        getAdminStats(token),
        getAdminMenu(token),
        getAdminReservations(token),
        getAdminOrders(token),
      ]);
      setStats(statsData);
      setMenu(menuData);
      setReservations(reservationData);
      setOrders(orderData);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const submitMenu = async (event) => {
    event.preventDefault();
    setError('');
    try {
      if (editingId) {
        await updateAdminMenuItem(token, editingId, { ...form, price: Number(form.price) });
      } else {
        await createAdminMenuItem(token, { ...form, price: Number(form.price) });
      }
      setForm(initialMenuForm);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const editMenu = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: item.price,
      imageUrl: item.image_url || '',
      isFeatured: item.is_featured,
      isActive: item.is_active,
    });
  };

  const removeMenu = async (id) => {
    try {
      await deleteAdminMenuItem(token, id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateReservation = async (id, status) => {
    try {
      await updateReservationStatus(token, id, status);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateOrder = async (id, status) => {
    try {
      await updateOrderStatus(token, id, status);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="card">
      <div className="space-between">
        <h1>Admin Dashboard</h1>
        <button className="btn ghost" type="button" onClick={onLogout}>Logout</button>
      </div>
      {error && <p className="error">{error}</p>}
      {stats && (
        <div className="grid three">
          <article className="soft-card"><h3>Reservations</h3><p>{stats.totals.reservations}</p></article>
          <article className="soft-card"><h3>Orders</h3><p>{stats.totals.orders}</p></article>
          <article className="soft-card"><h3>Menu Items</h3><p>{stats.totals.menuItems}</p></article>
        </div>
      )}

      <div className="grid two top-align">
        <div>
          <h2>{editingId ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
          <form className="form-grid soft-card" onSubmit={submitMenu}>
            <input placeholder="Name" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
            <input placeholder="Category" value={form.category} onChange={(e) => setField('category', e.target.value)} required />
            <input placeholder="Price" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setField('price', e.target.value)} required />
            <input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setField('imageUrl', e.target.value)} />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setField('description', e.target.value)} rows="3" />
            <label><input type="checkbox" checked={form.isFeatured} onChange={(e) => setField('isFeatured', e.target.checked)} /> Featured</label>
            <label><input type="checkbox" checked={form.isActive} onChange={(e) => setField('isActive', e.target.checked)} /> Active</label>
            <button className="btn" type="submit">{editingId ? 'Update Item' : 'Add Item'}</button>
            {editingId && <button className="btn ghost" type="button" onClick={() => { setEditingId(null); setForm(initialMenuForm); }}>Cancel</button>}
          </form>
        </div>

        <div>
          <h2>Menu Management</h2>
          <div className="stack">
            {menu.map((item) => (
              <article className="soft-card compact" key={item.id}>
                <div className="space-between">
                  <strong>{item.name}</strong>
                  <span>${Number(item.price).toFixed(2)}</span>
                </div>
                <p>{item.category}</p>
                <div className="cta-row">
                  <button className="btn ghost" type="button" onClick={() => editMenu(item)}>Edit</button>
                  <button className="btn ghost danger" type="button" onClick={() => removeMenu(item.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <h2>Reservations</h2>
      <div className="stack">
        {reservations.map((row) => (
          <article className="soft-card compact" key={row.id}>
            <div className="space-between">
              <strong>{row.name} · {row.guests} guests</strong>
              <span>{new Date(row.created_at).toLocaleString()}</span>
            </div>
            <p>{row.reservation_date} {row.reservation_time} · {row.phone}</p>
            <select value={row.status} onChange={(e) => updateReservation(row.id, e.target.value)}>
              {reservationStatuses.map((status) => <option value={status} key={status}>{status}</option>)}
            </select>
          </article>
        ))}
      </div>

      <h2>Orders</h2>
      <div className="stack">
        {orders.map((row) => (
          <article className="soft-card compact" key={row.id}>
            <div className="space-between">
              <strong>{row.customer_name}</strong>
              <span>${Number(row.total).toFixed(2)}</span>
            </div>
            <p>{row.order_type} · {row.customer_phone}</p>
            <select value={row.status} onChange={(e) => updateOrder(row.id, e.target.value)}>
              {orderStatuses.map((status) => <option value={status} key={status}>{status}</option>)}
            </select>
          </article>
        ))}
      </div>
    </section>
  );
}
