import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Image from 'next/image'
import MuiLink from '@mui/material/Link'

import Facebook from '../../../../public/icons/facebook.svg'
import Twitter from '../../../../public/icons/twitter.svg'
import Youtube from '../../../../public/icons/youtube.svg'
import Instagram from '../../../../public/icons/instagram.svg'

export function FooterSocials(): ReactElement {
  return (
    <Stack direction="row" pt={3} spacing="29px">
      <FooterSocial
        url="https://www.facebook.com/jesusfilm"
        src={Facebook}
        alt="Facebook"
      />
      <FooterSocial
        url="https://twitter.com/jesusfilm"
        src={Twitter}
        alt="Twitter"
      />
      <FooterSocial
        url="https://www.youtube.com/user/jesusfilm"
        src={Youtube}
        alt="Youtube"
      />
      <FooterSocial
        url="https://www.instagram.com/jesusfilm"
        src={Instagram}
        alt="Instagram"
      />
    </Stack>
  )
}

interface FooterSocialProps {
  url: string
  src: string
  alt: string
}

function FooterSocial({ url, src, alt }: FooterSocialProps): ReactElement {
  return (
    <Box>
      <MuiLink href={url} underline="none" target="_blank" rel="noopener">
        <Image src={src} width={32} height={32} alt={alt} />
      </MuiLink>
    </Box>
  )
}
