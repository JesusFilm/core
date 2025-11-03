import { Container, Text } from '@react-email/components'
import { ReactElement } from 'react'

interface BodyTitletProps {
  bodyTitle: string
}

export function BodyTitle({ bodyTitle }: BodyTitletProps): ReactElement {
  return (
    <Container className="mx-auto max-w-[600px] bg-[#EFEFEF] px-[60px] pt-[40px] pb-[20px]">
      <Text className="m-0 p-0 font-['Helvetica'] text-[18px] font-semibold text-[#444451]">
        {bodyTitle}
      </Text>
    </Container>
  )
}

BodyTitle.PreviewProps = {
  bodyTitle: 'To join them create an account with Next Steps'
} satisfies BodyTitletProps

export default BodyTitle
