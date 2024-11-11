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
        className="text-center font-bold text-[14px] leading-[20px] tracking-[2px]"
        style={{
          font: '14px "Open Sans", sans-serif'
        }}
      >
        WHAT IS NEXTSTEPS?
      </Text>
      <Text className="font-sans text-center font-semibold text-[16px] leading-[24px]">
        NextSteps is a New Platform For Creating Smart Gospel stories that adapt
        to your audience.
      </Text>
      <Section>
        <Row>
          <Column align="center">
            <Button
              className="rounded-lg text-[#26262D] text-[16px] font-semibold no-underline text-center px-5 py-3 border-2 border-solid border-[#26262D4D] mb-[12px]"
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
            <Text className="text-[#26262E] text-[14px] leading-[20px] font-[400]">
              Reply to this email if you need help
            </Text>
          </Column>
        </Row>
      </Section>
    </Container>
  )
}

export default Footer
