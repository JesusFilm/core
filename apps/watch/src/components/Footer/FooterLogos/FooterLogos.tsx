import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import { FooterLink } from '../FooterLink'
import JFLogo from './assets/jesus-film.svg'
import CruLogo from './assets/cru.svg'

export function FooterLogos(): ReactElement {
  return (
    <Stack direction="row" spacing={2} justifyContent="end">
      <FooterLink
        url="https://www.cru.org/"
        label="Cru logo"
        src={CruLogo}
        width="72"
        height="52"
      />
      <FooterLink
        url="https://www.jesusfilm.org"
        label="Jesus Film logo"
        src={JFLogo}
        width="60"
        height="60"
      />
    </Stack>
  )
}
