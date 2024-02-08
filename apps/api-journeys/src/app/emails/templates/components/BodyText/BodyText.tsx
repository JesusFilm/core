import { Container, Tailwind, Text } from '@react-email/components'
import { ReactElement } from 'react'

interface BodyTextProps {
  bodyText: string
}

export function BodyText({ bodyText }: BodyTextProps): ReactElement {
  return (
    <Tailwind>
      <Container className="bg-[#EFEFEF] mx-auto px-[60px] max-w-[600px]">
        <Text className="text-[#444451] text-[16px] leading-[24px] font-normal font-['Open_Sans', 'Helvetica', 'Monstserrat', 'sans-serif']">
          {bodyText}
        </Text>
      </Container>
    </Tailwind>
  )
}

BodyText.PreviewProps = {
  bodyText: 'To join them create an account with Next Steps'
} satisfies BodyTextProps

export default BodyText
