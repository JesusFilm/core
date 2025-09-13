declare module 'resize-observer-polyfill' {
  const ResizeObserver: typeof globalThis.ResizeObserver | any
  export default ResizeObserver
}
