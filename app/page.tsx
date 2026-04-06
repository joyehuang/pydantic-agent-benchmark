const phases = [
  {
    title: 'Phase 2 · Single-turn structured output',
    bullets: [
      'Measure latency per call',
      'Record JSON parse success and schema pass rate',
      'Compare prompt-only JSON vs schema-constrained output',
    ],
  },
  {
    title: 'Phase 3 · Agent loop benchmark',
    bullets: [
      'Measure task success, retries, and rounds',
      'Use mocked tools for deterministic results',
      'Compare end-to-end latency under different output control modes',
    ],
  },
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Pydantic Agent Benchmark</p>
        <h1>Schema-constrained agents, measured instead of guessed.</h1>
        <p className="lede">
          This project benchmarks Kimi 2.5 agent-style structured outputs across
          speed and success rate, then visualizes the results in a small React UI.
        </p>
      </section>

      <section className="grid">
        {phases.map((phase) => (
          <article key={phase.title} className="card">
            <h2>{phase.title}</h2>
            <ul>
              {phase.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="card status">
        <h2>Current status</h2>
        <ul>
          <li>Cases and schema definitions are written.</li>
          <li>Next step: implement Python benchmark runner and mock datasets.</li>
          <li>Then: wire result files into this UI for visualization.</li>
        </ul>
      </section>
    </main>
  );
}
