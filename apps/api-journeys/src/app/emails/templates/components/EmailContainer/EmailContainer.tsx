import { Container, Tailwind } from '@react-email/components'
import { ReactElement, ReactNode } from 'react'

import { ActionCard } from '../ActionCard'
import { BodyText } from '../BodyText'
import { UnsubscribeLink } from '../UnsubscribeLink'

interface EmailContainerProps {
  children: ReactNode
}

export function EmailContainer({
  children
}: EmailContainerProps): ReactElement {
  return (
    <Container className="my-[40px] rounded border border-solid border-[#eaeaea] shadow-md">
      {children}
    </Container>
  )
}

EmailContainer.PreviewProps = {
  children: (
    <>
      <BodyText bodyText="Lorem ipsum dolor set" />
      <ActionCard
        url="https://admin.nextstep.is/"
        headerText="[Lorem Ipsum]"
        buttonText="Lorem"
      />
      <UnsubscribeLink />
    </>
  )
} satisfies EmailContainerProps

export default EmailContainer
