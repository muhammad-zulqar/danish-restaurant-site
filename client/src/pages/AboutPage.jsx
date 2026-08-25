export default function AboutPage() {
  return (
    <section className="card">
      <h1>Our Story</h1>
      <p className="lead">
        Danish Restaurant blends Nordic heritage with contemporary culinary artistry. Founded to celebrate simplicity,
        seasonality, and craftsmanship, we create elegant experiences for every guest.
      </p>
      <div className="grid two">
        <article className="soft-card">
          <h3>Our Philosophy</h3>
          <p>
            We source premium ingredients, respect local producers, and combine classic techniques with modern presentation.
          </p>
        </article>
        <article className="soft-card">
          <h3>Our Space</h3>
          <p>
            Warm textures, ambient lighting, and thoughtful design come together to create a sophisticated yet welcoming mood.
          </p>
        </article>
      </div>
    </section>
  );
}
