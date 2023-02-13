import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import { FooterLink } from '../FooterLink'

import Facebook from './assets/facebook.svg'
import Twitter from './assets/twitter.svg'
import Youtube from './assets/youtube.svg'
import Instagram from './assets/instagram.svg'

export function FooterSocials(): ReactElement {
  return (
    <Stack direction="row" pt={3} spacing={7}>
      <FooterLink
        url="https://www.facebook.com/jesusfilm"
        label="Facebook"
        src={Facebook}
        noFollow
      />
      <FooterLink
        url="https://twitter.com/jesusfilm"
        label="Twitter"
        src={Twitter}
        noFollow
      />
      <FooterLink
        url="https://www.youtube.com/user/jesusfilm"
        label="Youtube"
        src={Youtube}
        noFollow
      />
      <FooterLink
        url="https://www.instagram.com/jesusfilm"
        label="Instagram"
        src={Instagram}
        noFollow
      />
    </Stack>
  )
}
