import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { FooterLink } from '../FooterLink'

import CruLogo from './assets/cru.svg'
import JFLogo from './assets/jesus-film.svg'

export function FooterLogos(): ReactElement {
  return (
    <Stack direction="row" spacing={6} justifyContent="end">
      <FooterLink
        url="https://www.cru.org"
        label="Cru logo"
        src={CruLogo}
        width="72"
        height="52"
        target="_blank"
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
