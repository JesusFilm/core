import {
  Button,
  Column,
  Container,
  Row,
  Section,
  Text
} from '@react-email/components'
import { ReactElement, ReactNode } from 'react'

interface FooterProps {
  children: ReactNode
}

export function Footer({ children }: FooterProps): ReactElement {
  return (
    <Container className="h-[72px] px-[60px]" align="center">
      {children}
    </Container>
  )
}

export default Footer
