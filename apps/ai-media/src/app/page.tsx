import { subtitlesWorkflowStages } from '../workflows/subtitles/plan'

export default function HomePage() {
  return (
    <>
      <section>
        <h1>AI Media — Subtitles Workflow</h1>
        <p>
          This app documents and runs the <code>subtitles</code> workflow built
          with Mux AI primitives and a lightweight Workflow DevKit. Each stage is
          intentionally small and testable for easy debugging.
        </p>
      </section>

      <section>
        <h2>Workflow Stages</h2>
        <ol>
          {subtitlesWorkflowStages.map((stage) => (
            <li key={stage.path} className="stage">
              <strong>{stage.name}</strong>
              <div>{stage.description}</div>
              <div>
                <code>{stage.path}</code>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2>Quickstart</h2>
        <ol>
          <li>
            Provide a Mux asset ID and playback ID to the workflow entrypoint.
          </li>
          <li>
            Stage 1 generates a raw subtitle file via{' '}
            <code>@mux/ai/primitives</code>.
          </li>
          <li>
            Stage 2 improves clarity and timing using OpenAI through Mux AI.
          </li>
          <li>Stage 3 uploads the improved subtitles back to Mux.</li>
        </ol>
      </section>
    </>
  )
}
