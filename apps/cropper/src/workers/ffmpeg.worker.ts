/// <reference lib="webworker" />

declare const self: DedicatedWorkerGlobalScope

type StartMessage = {
  type: 'start'
  payload: {
    duration: number
    presetName: string
  }
}

type TerminateMessage = { type: 'terminate' }

type IncomingMessage = StartMessage | TerminateMessage

type ProgressMessage = {
  type: 'progress'
  payload: {
    progress: number
    etaSeconds: number
  }
}

type CompleteMessage = {
  type: 'complete'
  payload: {
    downloadUrl: string
  }
}

type ErrorMessage = {
  type: 'error'
  payload: {
    message: string
  }
}

type OutgoingMessage = ProgressMessage | CompleteMessage | ErrorMessage

let timer: number | undefined
let progress = 0

const cleanup = () => {
  if (timer !== undefined) {
    clearInterval(timer)
    timer = undefined
  }
}

const handleStart = (message: StartMessage) => {
  cleanup()
  progress = 0

  const totalSteps = Math.max(10, Math.ceil(message.payload.duration / 3))
  const stepIncrement = 100 / totalSteps

  timer = self.setInterval(() => {
    progress = Math.min(progress + stepIncrement, 100)

    const eta = Math.max(0, Math.round(((100 - progress) / Math.max(stepIncrement, 0.1)) * 0.2))

    const progressMessage: ProgressMessage = {
      type: 'progress',
      payload: {
        progress: Number(progress.toFixed(2)),
        etaSeconds: eta
      }
    }

    self.postMessage(progressMessage as OutgoingMessage)

    if (progress >= 100) {
      cleanup()
      const completeMessage: CompleteMessage = {
        type: 'complete',
        payload: {
          downloadUrl: `blob:export/${Date.now()}`
        }
      }

      self.postMessage(completeMessage as OutgoingMessage)
    }
  }, 200)
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
