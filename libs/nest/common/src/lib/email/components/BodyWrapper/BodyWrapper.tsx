import { Section } from '@react-email/components'
import { ReactElement, ReactNode } from 'react'

import { ActionCard } from '../ActionCard'
import { BodyText } from '../BodyText'
import { UnsubscribeLink } from '../UnsubscribeLink'

interface BodyWrapperProps {
  children: ReactNode
}

export function BodyWrapper({ children }: BodyWrapperProps): ReactElement {
  return <Section className="bg-[#EFEFEF]">{children}</Section>
}

export default BodyWrapper
