import { Column, Container, Row, Section } from '@react-email/components'
import { ReactElement } from 'react'

import { EmailLogo } from '../EmailLogo'
import { Logo } from '../../types'

export function Header({ logo }: { logo?: Logo }): ReactElement {
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
