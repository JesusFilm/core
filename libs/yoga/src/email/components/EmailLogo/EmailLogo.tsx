import { Img } from '@react-email/components'
import { ReactElement } from 'react'

export interface EmailLogoProps {
  logo?: 'Default' | 'NextSteps'
}

export function EmailLogo({ logo }: EmailLogoProps): ReactElement {
  let logoUrl: string
  switch (logo) {
    case 'NextSteps':
      logoUrl = 'https://your.nextstep.is/LogoHorizontal.png'
      break
    case 'Default':
    default:
      logoUrl =
        'https://www.jesusfilm.org/wp-content/uploads/2023/04/JFP-RED.svg'
      break
  }

  return <Img src={logoUrl} />
}

export default EmailLogo
