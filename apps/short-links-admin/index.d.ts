declare module '*.svg' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const ReactComponent: any
  export default content
}

declare module '*.png' {
  import { StaticImageData } from 'next/image'

  const content: StaticImageData
  export default content
}

declare module '*.jpg' {
  import { StaticImageData } from 'next/image'

  const content: StaticImageData
  export default content
}
