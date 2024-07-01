export type DateTime = string
declare module '*.svg'

declare global {
  // biome-ignore lint/suspicious/noRedeclare: <explanation>
  type DateTime = string
}
