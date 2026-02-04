import {
  AI_SUBTITLE_POST_PROCESS_WORKFLOW_ID,
  AI_SUBTITLE_STEP_FETCH_TRANSCRIPT,
  AI_SUBTITLE_STEP_MARK_ERRORED,
  AI_SUBTITLE_STEP_PERSIST,
  AI_SUBTITLE_STEP_POST_PROCESS,
  AI_SUBTITLE_STEP_SET_PROCESSING,
  AI_SUBTITLE_STEP_UPLOAD_TRACK,
  AI_SUBTITLE_STEP_WAIT_FOR_READY
} from './constants'

export function getAiSubtitlePostProcessorWorkflowBundle(): string {
  const workflowId = JSON.stringify(AI_SUBTITLE_POST_PROCESS_WORKFLOW_ID)
  const setProcessing = JSON.stringify(AI_SUBTITLE_STEP_SET_PROCESSING)
  const fetchTranscript = JSON.stringify(AI_SUBTITLE_STEP_FETCH_TRANSCRIPT)
  const postProcess = JSON.stringify(AI_SUBTITLE_STEP_POST_PROCESS)
  const uploadTrack = JSON.stringify(AI_SUBTITLE_STEP_UPLOAD_TRACK)
  const waitForReady = JSON.stringify(AI_SUBTITLE_STEP_WAIT_FOR_READY)
  const persist = JSON.stringify(AI_SUBTITLE_STEP_PERSIST)
  const markErrored = JSON.stringify(AI_SUBTITLE_STEP_MARK_ERRORED)

  return `
const WORKFLOW_USE_STEP = Symbol.for('WORKFLOW_USE_STEP');
const useStep = globalThis[WORKFLOW_USE_STEP];
if (!globalThis.__private_workflows) {
  globalThis.__private_workflows = new Map();
}

const setProcessing = useStep(${setProcessing});
const fetchTranscript = useStep(${fetchTranscript});
const postProcess = useStep(${postProcess});
const uploadTrack = useStep(${uploadTrack});
const waitForReady = useStep(${waitForReady});
const persist = useStep(${persist});
const markErrored = useStep(${markErrored});

async function aiSubtitlePostProcessorWorkflow(input) {
  await setProcessing(input);
  try {
    const transcript = await fetchTranscript(input);
    const postProcessed = await postProcess({ ...input, ...transcript });
    const upload = await uploadTrack({ ...input, ...postProcessed });
    const ready = await waitForReady({ ...input, ...upload });
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

globalThis.__private_workflows.set(${workflowId}, aiSubtitlePostProcessorWorkflow);
`.trim()
}
