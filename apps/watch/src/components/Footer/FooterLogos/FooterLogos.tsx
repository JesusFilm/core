import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import JFLogo from '../../../../public/images/jf-logo.svg'
import CruLogo from '../../../../public/images/cru-logo.svg'
import { FooterLink } from '../FooterLink'

export function FooterLogos(): ReactElement {
  return (
    <Stack direction="row" spacing={2} justifyContent="end">
      <FooterLink
        url="https://www.cru.org/"
        label="Cru logo"
        underline="none"
        src={CruLogo}
        width="72"
        height="52"
      />
      <FooterLink
        url="https://www.jesusfilm.org"
        label="Jesus Film logo"
        underline="none"
        src={JFLogo}
        width="60"
        height="60"
      />
    </Stack>
  )
}
