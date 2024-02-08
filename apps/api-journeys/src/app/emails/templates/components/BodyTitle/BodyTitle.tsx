import { Container, Tailwind, Text } from '@react-email/components'
import { ReactElement } from 'react'

interface BodyTitletProps {
  bodyTitle: string
}

export function BodyTitle({ bodyTitle }: BodyTitletProps): ReactElement {
  return (
    <Tailwind>
      <Container className="bg-[#EFEFEF] mx-auto px-[60px] pt-[40px] pb-[20px] max-w-[600px]">
        <Text className="text-[#444451] text-[18px] font-semibold font-['Helvetica'] p-0 m-0">
          {bodyTitle}
        </Text>
      </Container>
    </Tailwind>
  )
}

BodyTitle.PreviewProps = {
  bodyTitle: 'To join them create an account with Next Steps'
} satisfies BodyTitletProps

export default BodyTitle
