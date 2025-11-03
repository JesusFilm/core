import {
  Button,
  Column,
  Container,
  Row,
  Section,
  Text
} from '@react-email/components'
import { ReactElement } from 'react'

export function Footer(): ReactElement {
  return (
    <Container className="h-[72px] px-[60px]" align="center">
      <Text
        className="text-center text-[14px] leading-[20px] font-bold tracking-[2px]"
        style={{
          font: '14px "Open Sans", sans-serif'
        }}
      >
        WHAT IS NEXTSTEPS?
      </Text>
      <Text className="text-center font-sans text-[16px] leading-[24px] font-semibold">
        NextSteps is a New Platform For Creating Smart Gospel stories that adapt
        to your audience.
      </Text>
      <Section>
        <Row>
          <Column align="center">
            <Button
              className="mb-[12px] rounded-lg border-2 border-solid border-[#26262D4D] px-5 py-3 text-center text-[16px] font-semibold text-[#26262D] no-underline"
              href="https://support.nextstep.is/article/1347-discover-nextsteps"
              style={{
                font: '16px "Open Sans", sans-serif'
              }}
            >
              Learn More
            </Button>
          </Column>
        </Row>
        <Row>
          <Column align="center">
            <Text className="text-[14px] leading-[20px] font-[400] text-[#26262E]">
              Reply to this email if you need help
            </Text>
          </Column>
        </Row>
      </Section>
    </Container>
  )
}

export default Footer
