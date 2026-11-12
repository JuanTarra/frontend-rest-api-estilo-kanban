export default function StatePanel({ title, message, action }) {
  return (
    <section className="state-panel" role="status">
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      {action}
    </section>
  );
}
