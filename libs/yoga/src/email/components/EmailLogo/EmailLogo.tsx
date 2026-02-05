import { Img } from '@react-email/components'
import { ReactElement } from 'react'

export interface EmailLogoProps {
  logo?: 'JesusFilmOne' | 'NextSteps'
}

export function EmailLogo({ logo }: EmailLogoProps): ReactElement {
  let logoUrl: string
  switch (logo) {
    case 'NextSteps':
      logoUrl = 'https://your.nextstep.is/LogoHorizontal.png'
      break
    case 'JesusFilmOne':
    default:
      logoUrl = 'https://jesusfilm.org/watch/assets/jesus-film-logo-full.png'
      break
  }

  return <Img src={logoUrl} />
}

export default EmailLogo
