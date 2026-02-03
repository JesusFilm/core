import { Column, Container, Row, Section } from '@react-email/components'
import { ReactElement } from 'react'

import { Logo } from '../../types'
import { EmailLogo } from '../EmailLogo'

export interface HeaderProps {
  logo?: Logo
}

export function Header({ logo }: HeaderProps): ReactElement {
  return (
    <Section className="h-[72px] w-full bg-[#FFFFFF]">
      <Container>
        <Row className="align-middle">
          <Column align="center">
            <EmailLogo logo={logo} />
          </Column>
        </Row>
      </Container>
    </Section>
  )
}

Header.PreviewProps = {}

export default Header
