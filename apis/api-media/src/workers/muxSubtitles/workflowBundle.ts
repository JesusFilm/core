import {
  MUX_SUBTITLE_STEP_MARK_ERRORED,
  MUX_SUBTITLE_STEP_PERSIST,
  MUX_SUBTITLE_STEP_REQUEST_GENERATION,
  MUX_SUBTITLE_STEP_SET_PROCESSING,
  MUX_SUBTITLE_STEP_WAIT_FOR_READY,
  MUX_SUBTITLE_WORKFLOW_ID
} from './constants'

export function getMuxSubtitlesWorkflowBundle(): string {
  const workflowId = JSON.stringify(MUX_SUBTITLE_WORKFLOW_ID)
  const setProcessing = JSON.stringify(MUX_SUBTITLE_STEP_SET_PROCESSING)
  const requestGeneration = JSON.stringify(
    MUX_SUBTITLE_STEP_REQUEST_GENERATION
  )
  const waitForReady = JSON.stringify(MUX_SUBTITLE_STEP_WAIT_FOR_READY)
  const persist = JSON.stringify(MUX_SUBTITLE_STEP_PERSIST)
  const markErrored = JSON.stringify(MUX_SUBTITLE_STEP_MARK_ERRORED)

  return `
const WORKFLOW_USE_STEP = Symbol.for('WORKFLOW_USE_STEP');
const useStep = globalThis[WORKFLOW_USE_STEP];
if (!globalThis.__private_workflows) {
  globalThis.__private_workflows = new Map();
}

const setProcessing = useStep(${setProcessing});
const requestGeneration = useStep(${requestGeneration});
const waitForReady = useStep(${waitForReady});
const persist = useStep(${persist});
const markErrored = useStep(${markErrored});

async function muxSubtitlesWorkflow(input) {
  await setProcessing(input);
  try {
    const generation = await requestGeneration(input);
    const ready = await waitForReady({
      ...input,
      trackId: generation?.trackId ?? null
    });
    const vttUrl = ready?.vttUrl ?? null;
    const trackId = ready?.trackId ?? null;
    if (!vttUrl || !trackId) {
      throw new Error('Mux subtitle track is missing vttUrl or trackId');
    }
    await persist({ ...input, vttUrl, trackId });
    return { vttUrl, trackId };
  } catch (error) {
    const message =
      error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : String(error);
    await markErrored({ ...input, errorMessage: message });
    throw error;
  }
}

globalThis.__private_workflows.set(${workflowId}, muxSubtitlesWorkflow);
`.trim()
}
