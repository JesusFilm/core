import { Section } from '@react-email/components'
import { ReactElement, ReactNode } from 'react'

interface DefaultFooterProps {
  children: ReactNode
}

export function DefaultFooter({ children }: DefaultFooterProps): ReactElement {
  return <Section>{children}</Section>
}
