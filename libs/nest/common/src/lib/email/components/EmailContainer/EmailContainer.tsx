import { ReactElement, ReactNode } from 'react'

interface EmailContainerProps {
  children: ReactNode
}

export function EmailContainer({
  children
}: EmailContainerProps): ReactElement {
  return <div className="bg-[#EFEFEF] h-full m-0 px-2">{children}</div>
}

export default EmailContainer
