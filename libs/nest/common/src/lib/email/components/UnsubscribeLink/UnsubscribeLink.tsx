import { Column, Link, Row, Section, Text } from '@react-email/components'
import { ReactElement } from 'react'

export function UnsubscribeLink(): ReactElement {
  return (
    <Section>
      <Row>
        <Column align="center">
          <Text className="text-[#6D6D7D] text-[12px] leading-[20px] font-[400] font-sans m-[0px]">
            <Link
              href="https://admin.nextstep.is/"
              className="text-[#26262E] no-underline p-[2px]"
            >
              Change Notifications Setting
            </Link>
            •
            <Link
              href="https://admin.nextstep.is/"
              className="text-[#26262E] no-underline p-[2px]"
            >
              Unsubscribe
            </Link>
          </Text>
        </Column>
      </Row>
      <Row>
        <Column align="center">
          <Text className="text-[#6D6D7D] text-[12px] leading-[20px] font-[400] m-[0px]">
            100 Lake Hart Drive, Orlando, FL, 32832
          </Text>
        </Column>
      </Row>
    </Section>
  )
}

UnsubscribeLink.PreviewProps = {
  headerText: 'To join them create an account with Next Steps',
  buttonText: 'Create Account',
  url: 'https://admin.nextstep.is/'
}

export default UnsubscribeLink
