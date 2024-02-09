import {
  Button,
  Container,
  Font,
  Heading,
  Link,
  Section,
  Tailwind,
  Text
} from '@react-email/components'
import { ReactElement } from 'react'

interface ActionCardProps {
  url: string
  headerText: string
  buttonText: string
}

export function ActionCard({
  url,
  headerText,
  buttonText
}: ActionCardProps): ReactElement {
  return (
    <Section className="mt-[10px] mb-[15px]">
      <Font fontFamily="Helvetica" fallbackFontFamily="Helvetica" />
      <Container className="bg-[#EFEFEF] rounded-lg w-full max-w-[512px] h-max">
        <Container>
          <div className="width-full bg-[#FFFFFF] px-[30px] py-[20px] rounded-t-lg">
            <Heading className="font-bold text-[20px] mb-[20px] mt-[5px]">
              {headerText}
            </Heading>
            <Button
              className="bg-[#26262D] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
              href={url}
            >
              {buttonText}
            </Button>
          </div>
        </Container>
        <Container>
          <div className="width-full h-max bg-[#FFFFFF66] rounded-b-lg px-[30px] py-[15px]">
            <Link>
              <Text className="m-[0]">{url}</Text>
            </Link>
          </div>
        </Container>
      </Container>
    </Section>
  )
}

ActionCard.PreviewProps = {
  headerText: 'To join them create an account with Next Steps',
  buttonText: 'Create Account',
  url: 'https://admin.nextstep.is/'
} satisfies ActionCardProps

export default ActionCard
