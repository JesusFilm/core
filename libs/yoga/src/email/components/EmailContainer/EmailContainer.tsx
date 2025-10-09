import { ReactElement, ReactNode } from 'react'

interface EmailContainerProps {
  children: ReactNode
}

export function EmailContainer({
  children
}: EmailContainerProps): ReactElement {
  return (
    <div className="m-0 h-full bg-[#EFEFEF] px-[20px]">
      <div>{children}</div>
    </div>
  )
}

export default EmailContainer
