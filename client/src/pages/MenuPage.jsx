import { useEffect, useMemo, useState } from 'react';
import { getMenu } from '../api';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMenu()
      .then(setMenuItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    return menuItems.reduce((acc, item) => {
      const key = item.category;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  }, [menuItems]);

  return (
    <section className="card">
      <h1>Menu</h1>
      <p className="lead">Crafted dishes made with seasonal ingredients.</p>
      {loading && <p>Loading menu...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="menu-category">
          <h2>{category}</h2>
          <div className="grid two">
            {items.map((item) => (
              <article className="soft-card" key={item.id}>
                <div className="space-between">
                  <h3>{item.name}</h3>
                  <strong>${Number(item.price).toFixed(2)}</strong>
                </div>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
