import { ReactElement } from 'react'

interface HostAvatarsProps {
  src1?: string
  src2?: string
}

export const HostAvatars = ({ src1, src2 }: HostAvatarsProps): ReactElement => {
  return (
    <div>
      <h1>Hello</h1>
    </div>
  )
}
