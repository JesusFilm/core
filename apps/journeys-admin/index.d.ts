declare module '*.svg' {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const content: any
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  export const ReactComponent: any
  export default content
}
export type DateTime = string

declare global {
  // biome-ignore lint/suspicious/noRedeclare: <explanation>
  type DateTime = string
}
