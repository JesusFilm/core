import { Column, Container, Row, Section } from '@react-email/components'
import { ReactElement } from 'react'

import { EmailLogo as EmailLogoEnum } from '../../types'
import { EmailLogo } from '../EmailLogo'

export function Header({ logo }: { logo?: EmailLogoEnum }): ReactElement {
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
