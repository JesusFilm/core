import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Image from 'next/image'
import MuiLink from '@mui/material/Link'
import JFLogo from '../../../../public/images/jf-logo.svg'
import CruLogo from '../../../../public/images/cru-logo.svg'

export function FooterLogos(): ReactElement {
  return (
    <Stack direction="row" spacing={2} justifyContent="end">
      <MuiLink
        href="https://www.cru.org/"
        underline="none"
        target="_blank"
        rel="noopener"
      >
        <Image src={CruLogo} width="72" height="52" alt="Cru logo" />
      </MuiLink>
      <MuiLink
        href="https://www.jesusfilm.org"
        underline="none"
        target="_blank"
        rel="noopener"
      >
        <Image src={JFLogo} width="60" height="60" alt="Jesus Film logo" />
      </MuiLink>
    </Stack>
  )
}
