import { Link } from 'react-router-dom';

const highlights = [
  { title: 'Seasonal Tasting Menu', description: 'Nordic-inspired ingredients crafted into elegant, modern plates.' },
  { title: 'Private Dining', description: 'Refined spaces for celebrations, corporate dinners, and intimate events.' },
  { title: 'Award-Winning Service', description: 'An attentive team delivering a memorable guest experience every visit.' },
];

const testimonials = [
  { quote: 'A truly luxurious dining experience—every detail felt exceptional.', name: 'Sophia K.' },
  { quote: 'Beautiful atmosphere, flawless service, and unforgettable flavors.', name: 'James M.' },
];

export default function HomePage() {
  return (
    <div>
      <section className="hero-section card">
        <p className="kicker">Modern Luxury Dining</p>
        <h1>Danish Restaurant</h1>
        <p className="lead">Discover refined flavors, curated pairings, and warm Scandinavian elegance.</p>
        <div className="cta-row">
          <Link className="btn" to="/reservations">Book a Table</Link>
          <Link className="btn ghost" to="/orders">Order Online</Link>
        </div>
      </section>

      <section className="card">
        <h2>Restaurant Highlights</h2>
        <div className="grid three">
          {highlights.map((item) => (
            <article key={item.title} className="soft-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Guest Testimonials</h2>
        <div className="grid two">
          {testimonials.map((item) => (
            <blockquote key={item.name} className="soft-card">
              “{item.quote}”
              <footer>— {item.name}</footer>
            </blockquote>
          ))}
        </div>
      </section>
    </div>
  );
}
