export default function ContactPage() {
  return (
    <section className="card">
      <h1>Contact</h1>
      <div className="grid two">
        <article className="soft-card">
          <h3>Visit Us</h3>
          <p>Danish Restaurant</p>
          <p>42 Nordic Avenue, Downtown</p>
          <p>Open Daily: 12:00 - 23:00</p>
          <p>Phone: +45 12 34 56 78</p>
          <p>Email: hello@danishrestaurant.com</p>
        </article>
        <article className="soft-card">
          <h3>Map</h3>
          <div className="map-placeholder">Interactive map placeholder</div>
        </article>
      </div>
    </section>
  );
}
