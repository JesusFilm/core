export type Stage = 'guide' | 'planner' | 'builder' | 'repair' | 'images'

/**
 * One event of a builder run, as sent to the chat page. The chat page ignores
 * content kinds it does not know.
 */
export type BuilderEvent =
  | {
      type: 'progress'
      stage: Stage
      status: 'started' | 'streaming' | 'done'
      text?: string
    }
  | { type: 'message'; text: string }
  | { type: 'content'; kind: 'journey' | 'plan'; payload: object }
  | { type: 'summary'; text: string }
  | { type: 'error'; text: string }
  | { type: 'done' }
