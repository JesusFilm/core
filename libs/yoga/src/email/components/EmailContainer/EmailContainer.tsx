import { ReactElement, ReactNode } from 'react'

interface EmailContainerProps {
  children: ReactNode
}

export function EmailContainer({
  children
}: EmailContainerProps): ReactElement {
  return (
    <div className="bg-[#EFEFEF] h-full m-0 px-[20px]">
      <div>{children}</div>
    </div>
  )
}

export default EmailContainer
