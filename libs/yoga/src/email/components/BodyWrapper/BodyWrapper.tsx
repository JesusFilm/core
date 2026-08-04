import { ReactElement, ReactNode } from 'react'
import { Section } from 'react-email'

interface BodyWrapperProps {
  children: ReactNode
}

export function BodyWrapper({ children }: BodyWrapperProps): ReactElement {
  return <Section className="bg-[#EFEFEF]">{children}</Section>
}

export default BodyWrapper
