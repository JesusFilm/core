import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import { FooterLink } from '../FooterLink'

import Facebook from '../../../../public/icons/facebook.svg'
import Twitter from '../../../../public/icons/twitter.svg'
import Youtube from '../../../../public/icons/youtube.svg'
import Instagram from '../../../../public/icons/instagram.svg'

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
