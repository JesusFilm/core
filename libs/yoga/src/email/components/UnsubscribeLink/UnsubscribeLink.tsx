import { Column, Link, Row, Section, Text } from '@react-email/components'
import { ReactElement } from 'react'

interface UnsubscribeLinkProps {
  recipientEmail: string
  url?: string
}

export function UnsubscribeLink({
  recipientEmail,
  url
}: UnsubscribeLinkProps): ReactElement {
  return (
    <Section>
      <Row>
        <Column align="center">
          <Text
            className="m-[0px] font-sans text-[12px] leading-[20px] font-[400] text-[#6D6D7D]"
            style={{
              font: '12px "Open Sans", sans-serif'
            }}
          >
            <Link
              href={
                url ??
                `${process.env.JOURNEYS_ADMIN_URL}/email-preferences/${recipientEmail}`
              }
              className="p-[2px] text-[#26262E] no-underline"
            >
              Change Notifications Setting
            </Link>
            •
            <Link
              href={
                url != null
                  ? url
                  : `${process.env.JOURNEYS_ADMIN_URL}/email-preferences/${recipientEmail}?unsubscribeAll`
              }
              className="p-[2px] text-[#26262E] no-underline"
            >
              Unsubscribe
            </Link>
          </Text>
        </Column>
      </Row>
      <Row>
        <Column align="center">
          <Text className="m-[0px] mb-[20px] text-[12px] leading-[20px] font-[400] text-[#6D6D7D]">
            100 Lake Hart Drive, Orlando, FL, 32832
          </Text>
        </Column>
      </Row>
    </Section>
  )
}

UnsubscribeLink.PreviewProps = {
  email: 'giogio@example.com'
}

export default UnsubscribeLink
