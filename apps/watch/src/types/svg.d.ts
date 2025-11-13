declare module '*.svg' {
  const content: React.ComponentType<React.SVGProps<SVGSVGElement>>
  export default content
}

declare module '*.svg?url' {
  const content: string
  export default content
}
