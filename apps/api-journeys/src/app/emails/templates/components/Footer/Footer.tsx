import { Container, Link, Tailwind, Text } from '@react-email/components'
import { ReactElement } from 'react'

export function Footer(): ReactElement {
  return (
    <Tailwind>
      <Container className="bg-[#E3E3E3] h-[72px] p-[20px] px-[60px] flex justify-center items-center">
        <Text className="text-[#666666] text-[12px] leading-[24px]">
          {`This is an automated email. If you need assistance, please `}
          <Link>contact support here instead of replying to this email</Link>.
        </Text>
      </Container>
    </Tailwind>
  )
}

export default Footer
