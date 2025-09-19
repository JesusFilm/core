/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.svg' {
  const content: any
  export const ReactComponent: any
  export default content
}

declare module '*.worker.ts' {
  const WorkerFactory: {
    new (): Worker
  }

  export default WorkerFactory
}
