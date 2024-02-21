import { ReactElement, ReactNode } from 'react'

interface EmailContainerProps {
  children: ReactNode
}

export function EmailContainer({
  children
}: EmailContainerProps): ReactElement {
  return (
    <div className="bg-[#EFEFEF] h-full m-0">
      <div className="mx-[10px]">{children}</div>
    </div>
  )
}

export default EmailContainer
