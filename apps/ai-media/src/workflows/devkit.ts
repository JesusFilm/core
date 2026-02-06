export type WorkflowContext = {
  requestId: string
  logger: {
    info: (message: string, meta?: Record<string, unknown>) => void
    error: (message: string, meta?: Record<string, unknown>) => void
  }
}

export type WorkflowStage<Input = unknown, Output = unknown> = {
  name: string
  run: (input: Input, context: WorkflowContext) => Promise<Output>
}

export type WorkflowDefinition<Input, Output> = {
  name: string
  stages: WorkflowStage[]
  run: (input: Input, context: WorkflowContext) => Promise<Output>
}

export function createWorkflow<Input, Output>(
  name: string,
  stages: WorkflowStage[],
  runner: (input: Input, context: WorkflowContext) => Promise<Output>
): WorkflowDefinition<Input, Output> {
  return {
    name,
    stages,
    run: runner
  }
}

export function createConsoleLogger(prefix: string): WorkflowContext['logger'] {
  return {
    info: (message, meta) => {
      console.info(`[${prefix}] ${message}`, meta ?? {})
    },
    error: (message, meta) => {
      console.error(`[${prefix}] ${message}`, meta ?? {})
    }
  }
}
