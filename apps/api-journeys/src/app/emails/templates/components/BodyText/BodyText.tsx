import { Container, Tailwind, Text } from '@react-email/components'
import { ReactElement } from 'react'

interface BodyTextProps {
  bodyText: string
}

export function BodyText({ bodyText }: BodyTextProps): ReactElement {
  return (
    <Tailwind>
      <Container className="bg-[#EFEFEF] mx-auto px-[60px] max-w-[600px]">
        <Text className="text-[#444451] text-[16px] leading-[24px] font-normal font-sans">
          {bodyText}
        </Text>
      </Container>
    </Tailwind>
  )
}

BodyText.PreviewProps = {
  bodyText:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
} satisfies BodyTextProps

export default BodyText
