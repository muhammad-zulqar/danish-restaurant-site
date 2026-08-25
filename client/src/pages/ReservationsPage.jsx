import { useState } from 'react';
import { createReservation } from '../api';

const initialState = {
  name: '',
  email: '',
  phone: '',
  reservationDate: '',
  reservationTime: '',
  guests: 2,
  notes: '',
};

export default function ReservationsPage() {
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await createReservation({ ...form, guests: Number(form.guests) });
      setMessage('Reservation submitted successfully. We will confirm shortly.');
      setForm(initialState);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h1>Reservations</h1>
      <form className="form-grid" onSubmit={onSubmit}>
        <input name="name" value={form.name} onChange={onChange} placeholder="Full name" required />
        <input name="email" value={form.email} onChange={onChange} placeholder="Email" type="email" required />
        <input name="phone" value={form.phone} onChange={onChange} placeholder="Phone" required />
        <input name="reservationDate" value={form.reservationDate} onChange={onChange} type="date" required />
        <input name="reservationTime" value={form.reservationTime} onChange={onChange} type="time" required />
        <input name="guests" value={form.guests} onChange={onChange} type="number" min="1" max="20" required />
        <textarea name="notes" value={form.notes} onChange={onChange} rows="4" placeholder="Special requests" />
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Book Table'}</button>
      </form>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  );
}
