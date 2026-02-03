import { Img } from '@react-email/components'
import { ReactElement } from 'react'

import { type Logo } from '../../types'

export function EmailLogo({
  logo = 'NextSteps'
}: {
  logo?: Logo
}): ReactElement {
  let logoUrl: string
  switch (logo) {
    case 'JesusFilmApp':
      logoUrl =
        'https://www.jesusfilm.org/wp-content/uploads/2023/04/JFP-RED.svg'
      break
    case 'NextSteps':
    default:
      logoUrl = 'https://your.nextstep.is/LogoHorizontal.png'
      break
  }

  return <Img src={logoUrl} />
}

export default EmailLogo
