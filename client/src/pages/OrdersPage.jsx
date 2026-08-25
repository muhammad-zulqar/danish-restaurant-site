import { useEffect, useMemo, useState } from 'react';
import { createOrder, getMenu } from '../api';

const initialCustomer = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  orderType: 'pickup',
  notes: '',
};

export default function OrdersPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState({});
  const [customer, setCustomer] = useState(initialCustomer);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMenu().then(setMenuItems).catch((err) => setError(err.message));
  }, []);

  const total = useMemo(() => {
    return menuItems.reduce((sum, item) => {
      const quantity = cart[item.id] || 0;
      return sum + quantity * Number(item.price);
    }, 0);
  }, [cart, menuItems]);

  const itemCount = useMemo(() => Object.values(cart).reduce((sum, qty) => sum + qty, 0), [cart]);

  const updateQty = (id, qty) => {
    setCart((prev) => ({ ...prev, [id]: Math.max(0, Number(qty)) }));
  };

  const onCustomerChange = (event) => {
    const { name, value } = event.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const items = Object.entries(cart)
      .filter(([, quantity]) => Number(quantity) > 0)
      .map(([menuItemId, quantity]) => ({ menuItemId: Number(menuItemId), quantity: Number(quantity) }));

    if (items.length === 0) {
      setError('Please add at least one item to your order.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await createOrder({ ...customer, items });
      setMessage('Order placed successfully. Thank you!');
      setCart({});
      setCustomer(initialCustomer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h1>Order Online</h1>
      <p className="lead">Select your favorites and place your order in minutes.</p>
      <div className="grid two">
        <div>
          {menuItems.map((item) => (
            <article key={item.id} className="soft-card compact">
              <div className="space-between">
                <h3>{item.name}</h3>
                <strong>${Number(item.price).toFixed(2)}</strong>
              </div>
              <p>{item.description}</p>
              <label>
                Quantity
                <input
                  type="number"
                  min="0"
                  value={cart[item.id] || 0}
                  onChange={(event) => updateQty(item.id, event.target.value)}
                />
              </label>
            </article>
          ))}
        </div>

        <form className="soft-card form-grid" onSubmit={onSubmit}>
          <h2>Checkout</h2>
          <p>{itemCount} items · ${total.toFixed(2)}</p>
          <input name="customerName" value={customer.customerName} onChange={onCustomerChange} placeholder="Full name" required />
          <input name="customerEmail" value={customer.customerEmail} onChange={onCustomerChange} type="email" placeholder="Email (optional)" />
          <input name="customerPhone" value={customer.customerPhone} onChange={onCustomerChange} placeholder="Phone" required />
          <label>
            Order Type
            <select name="orderType" value={customer.orderType} onChange={onCustomerChange}>
              <option value="pickup">Pickup</option>
              <option value="delivery">Delivery</option>
            </select>
          </label>
          <textarea name="notes" value={customer.notes} onChange={onCustomerChange} rows="3" placeholder="Notes" />
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Place Order'}</button>
          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </section>
  );
}
