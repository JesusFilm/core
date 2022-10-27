import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Image from 'next/image'
import MuiLink from '@mui/material/Link'
import JFLogo from '../../../../public/images/jf-logo@2x.png'
import CruLogo from '../../../../public/images/cru-logo.png'
import Facebook from '../../../../public/icons/facebook.svg'
import Twitter from '../../../../public/icons/twitter.svg'
import Youtube from '../../../../public/icons/youtube.svg'
import Instagram from '../../../../public/icons/instagram.svg'

export function FooterLogos(): ReactElement {
  const FooterLogo = ({
    url,
    src,
    width,
    height,
    alt
  }: {
    url: string
    src: string
    width?: string
    height?: string
    alt: string
  }): ReactElement => (
    <Box>
      <MuiLink href={url} underline="none" target="_blank" rel="noopener">
        <Image src={src} width={width ?? 32} height={height ?? 32} alt={alt} />
      </MuiLink>
    </Box>
  )

  return (
    <Box width="220px">
      <Stack
        direction="row"
        spacing="40px"
        width="220px"
        justifyContent="space-evenly"
      >
        <FooterLogo
          url="https://www.jesusfilm.org"
          src={JFLogo}
          width="60"
          height="60"
          alt="Jesus Film logo"
        />
        <FooterLogo
          url="https://www.cru.org/"
          src={CruLogo}
          width="72"
          height="52"
          alt="Cru logo"
        />
      </Stack>
      <Stack direction="row" mt="63px" spacing="29px">
        <FooterLogo
          url="https://www.facebook.com/jesusfilm"
          src={Facebook}
          alt="Facebook"
        />
        <FooterLogo
          url="https://twitter.com/jesusfilm"
          src={Twitter}
          alt="Twitter"
        />
        <FooterLogo
          url="https://www.youtube.com/user/jesusfilm"
          src={Youtube}
          alt="Youtube"
        />
        <FooterLogo
          url="https://www.instagram.com/jesusfilm"
          src={Instagram}
          alt="Instagram"
        />
      </Stack>
    </Box>
  )
}
