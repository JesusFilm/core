/// <reference lib="webworker" />

declare const self: DedicatedWorkerGlobalScope

type StartDetectionMessage = {
  type: 'start'
  payload: {
    duration: number
  }
}

type TerminateMessage = { type: 'terminate' }

type IncomingMessage = StartDetectionMessage | TerminateMessage

type DetectionChunk = {
  type: 'chunk'
  result: {
    id: string
    time: number
    box: {
      x: number
      y: number
      width: number
      height: number
    }
    confidence: number
    label: 'person'
    source: 'mediapipe'
  }
}

type DetectionComplete = {
  type: 'complete'
  results: DetectionChunk['result'][]
}

type DetectionError = {
  type: 'error'
  error: string
}

type OutgoingMessage = DetectionChunk | DetectionComplete | DetectionError

let timer: number | undefined
const detections: DetectionChunk['result'][] = []

const cleanup = () => {
  if (timer !== undefined) {
    clearInterval(timer)
    timer = undefined
  }
  detections.length = 0
}

const sendMessage = (message: OutgoingMessage) => {
  self.postMessage(message)
}

const handleStart = (message: StartDetectionMessage) => {
  cleanup()

  const step = 0.5
  const totalFrames = Math.max(4, Math.ceil(message.payload.duration / step))
  let index = 0

  timer = self.setInterval(() => {
    const time = Number((index * step).toFixed(2))
    const oscillation = Math.sin(index / Math.max(totalFrames / 4, 1))

    const result: DetectionChunk['result'] = {
      id: `det-${Date.now()}-${index}`,
      time,
      box: {
        x: Math.max(0.05, Math.min(0.65, 0.3 + oscillation * 0.2)),
        y: Math.max(0.05, Math.min(0.6, 0.25 + Math.cos(oscillation) * 0.1)),
        width: 0.28,
        height: 0.55
      },
      confidence: 0.86,
      label: 'person',
      source: 'mediapipe'
    }

    detections.push(result)
    const chunk: DetectionChunk = { type: 'chunk', result }
    sendMessage(chunk)

    index += 1

    if (index >= totalFrames) {
      cleanup()
      const complete: DetectionComplete = { type: 'complete', results: detections.slice() }
      sendMessage(complete)
    }
  }, 180)
}

self.onmessage = (event: MessageEvent<IncomingMessage>) => {
  const { data } = event

  if (data.type === 'start') {
    handleStart(data)
    return
  }

  if (data.type === 'terminate') {
    cleanup()
  }
}

self.onclose = () => {
  cleanup()
}
