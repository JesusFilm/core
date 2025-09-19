import { Container, Text } from '@react-email/components'
import { ReactElement, ReactNode } from 'react'

interface BodyTextProps {
  children: ReactNode
}

export function BodyText({ children }: BodyTextProps): ReactElement {
  return (
    <Container className="mx-auto max-w-[600px] bg-[#EFEFEF] px-[60px]">
      <Text className="font-sans text-[16px] leading-[24px] font-normal text-[#444451]">
        {children}
      </Text>
    </Container>
  )
}

BodyText.PreviewProps = {
  children:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
} satisfies BodyTextProps

export default BodyText
