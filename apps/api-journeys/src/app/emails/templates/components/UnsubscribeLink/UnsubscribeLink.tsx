import { Container, Link, Text } from '@react-email/components'
import { ReactElement } from 'react'

export function UnsubscribeLink(): ReactElement {
  return (
    <Container className="bg-[#EFEFEF] mx-auto px-[60px] pb-[40px] max-w-[600px]">
      <Text className="text-[#444451] text-[16px] leading-[24px] font-normal font-sans">
        {`Don’t want to receive these emails, `}
        <Link
          href="https://admin.nextstep.is/"
          className="text-[#9E2630] no-underline"
        >
          Unsubscribe
        </Link>
      </Text>
    </Container>
  )
}

UnsubscribeLink.PreviewProps = {
  headerText: 'To join them create an account with Next Steps',
  buttonText: 'Create Account',
  url: 'https://admin.nextstep.is/'
}

export default UnsubscribeLink
