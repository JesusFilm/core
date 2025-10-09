import { Column, Container, Row, Section } from '@react-email/components'
import { ReactElement } from 'react'

import { EmailLogo } from '../EmailLogo'

export function Header(): ReactElement {
  return (
    <Section className="h-[72px] w-full bg-[#FFFFFF]">
      <Container>
        <Row className="align-middle">
          <Column align="center">
            <EmailLogo />
          </Column>
        </Row>
      </Container>
    </Section>
  )
}

Header.PreviewProps = {}

export default Header
