import { Img } from '@react-email/components'
import { ReactElement } from 'react'

import { EmailLogo as EmailLogoEnum } from '../../types'

export function EmailLogo({
  logo = EmailLogoEnum.NextSteps
}: {
  logo?: EmailLogoEnum
}): ReactElement {
  let logoUrl: string
  switch (logo) {
    case EmailLogoEnum.Mobile:
      logoUrl = 'https://your.nextstep.is/LogoHorizontal.png'
      break
    case EmailLogoEnum.NextSteps:
    default:
      logoUrl = 'https://your.nextstep.is/LogoHorizontal.png'
      break
  }

  return <Img src={logoUrl} />
}

export default EmailLogo
