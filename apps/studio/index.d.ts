declare module '*.svg' {
  const content: unknown
  export const ReactComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>
  export default content
}
