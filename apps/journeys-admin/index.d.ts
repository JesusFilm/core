declare module '*.svg' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const ReactComponent: any
  export default content
}

declare module '*.png' {
  const value: any
  export = value
}
