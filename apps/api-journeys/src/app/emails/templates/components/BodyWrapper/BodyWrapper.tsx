import { Section, Tailwind } from '@react-email/components'
import { ReactElement, ReactNode } from 'react'

import { ActionCard } from '../ActionCard'
import { BodyText } from '../BodyText'
import { UnsubscribeLink } from '../UnsubscribeLink'

interface BodyWrapperProps {
  children: ReactNode
}

export function BodyWrapper({ children }: BodyWrapperProps): ReactElement {
  return (
    <Tailwind>
      <Section className="bg-[#EFEFEF]">{children}</Section>
    </Tailwind>
  )
}

BodyWrapper.PreviewProps = {
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
} satisfies BodyWrapperProps

export default BodyWrapper
