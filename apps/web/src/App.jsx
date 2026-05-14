const features = [
  ['Spend Check', 'Ask Spendavi before money leaves your account.'],
  ['Safe-to-spend', 'See what remains after bills, debts, essentials and buffer.'],
  ['Debt pressure', 'Understand how spending compares with paying down debt.'],
  ['Spendavi Scan', 'Use shopping items as a trigger for a spending decision.'],
];

export default function App() {
  return (
    <main className="page">
      <nav className="nav">
        <div className="brand">
          <span>S</span>
          <strong>Spendavi</strong>
        </div>
        <a href="mailto:hello@spendavi.com">Early access</a>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Ask before you spend</p>
          <h1>Your balance is not your safe-to-spend limit.</h1>
          <p className="lead">
            Spendavi protects bills, debt payments, essential spending and your buffer before it tells you what is safe to spend.
          </p>
          <div className="actions">
            <a className="primary" href="mailto:hello@spendavi.com?subject=Spendavi early access">Join early access</a>
            <a className="secondary" href="#features">See features</a>
          </div>
        </div>

        <div className="phone-card">
          <p>Safe to spend until payday</p>
          <strong>£118.00</strong>
          <span>Amber. You can spend this, but it leaves limited room before payday.</span>
          <button>Ask Spendavi</button>
        </div>
      </section>

      <section id="features" className="features">
        {features.map(([title, body]) => (
          <article key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <section className="promise">
        <h2>Built around one question</h2>
        <p>Can I safely spend this now?</p>
      </section>
    </main>
  );
}
