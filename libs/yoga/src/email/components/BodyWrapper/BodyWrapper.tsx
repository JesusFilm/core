import { Section } from '@react-email/components'
import { ReactElement, ReactNode } from 'react'

interface BodyWrapperProps {
  children: ReactNode
}

export function BodyWrapper({ children }: BodyWrapperProps): ReactElement {
  return <Section className="bg-[#EFEFEF]">{children}</Section>
}

export default BodyWrapper
