import { NavLink, Outlet } from 'react-router-dom';

const links = [
  ['/', 'Home'],
  ['/about', 'About'],
  ['/menu', 'Menu'],
  ['/reservations', 'Reservations'],
  ['/orders', 'Order Online'],
  ['/contact', 'Contact'],
  ['/admin', 'Admin'],
];

export default function Layout() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="brand">Danish Restaurant</div>
        <nav>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>Luxury dining in the heart of the city · Open daily 12:00 - 23:00</p>
      </footer>
    </div>
  );
}
