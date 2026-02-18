import { CoverageBar } from '../CoverageBar'

export default function CoverageDiagramPage() {
  const counts = { human: 86, ai: 0, none: 14 }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ margin: '0 0 24px', fontSize: '1.6rem' }}>
        Coverage Diagram Mock
      </h1>
      <section style={{ display: 'grid', gap: '24px' }}>
        <div>
          <h2 style={{ margin: '0 0 10px', fontSize: '1rem' }}>Normal state</h2>
          <CoverageBar
            counts={counts}
            activeFilter="all"
            onFilter={() => undefined}
            mode="explore"
          />
        </div>
        <div>
          <h2 style={{ margin: '0 0 10px', fontSize: '1rem' }}>Hover state</h2>
          <CoverageBar
            counts={counts}
            activeFilter="all"
            onFilter={() => undefined}
            mode="explore"
            forceHover
          />
        </div>
      </section>
    </main>
  )
}
