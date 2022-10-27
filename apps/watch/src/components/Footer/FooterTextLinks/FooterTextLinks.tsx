import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import MuiLink from '@mui/material/Link'

export function FooterTextLinks(): ReactElement {
  const FooterTextLink = ({
    label,
    url
  }: {
    label: string
    url: string
  }): ReactElement => (
    <MuiLink
      href={url}
      underline="none"
      target="_blank"
      rel="noopener"
      style={{
        color: '#26262E'
      }}
    >
      <Typography variant="body1">{label}</Typography>
    </MuiLink>
  )

  return (
    <Stack direction="row" width="100%" spacing={20}>
      <Stack direction="column" spacing={2}>
        <Typography variant="overline">About</Typography>
        <FooterTextLink
          label="About Us"
          url="https://www.jesusfilm.org/about/"
        />
        <FooterTextLink
          label="Contact"
          url="https://www.jesusfilm.org/contact/"
        />
        <FooterTextLink
          label="Ways to Give"
          url="https://www.jesusfilm.org/give/"
        />
      </Stack>
      <Stack direction="column" spacing={2}>
        <Typography variant="overline">Sections</Typography>
        <FooterTextLink
          label="Strategies and Tools"
          url="https://www.jesusfilm.org/partners/mission-trips/"
        />
        <FooterTextLink label="Blog" url="https://www.jesusfilm.org/blog/" />
        <FooterTextLink
          label="How to Help"
          url="https://www.jesusfilm.org/partners/"
        />
      </Stack>
      <Stack direction="column" spacing={2}>
        <Typography variant="overline">Apps</Typography>
        <FooterTextLink
          label="Android"
          url="https://play.google.com/store/apps/details?id=com.jesusfilmmedia.android.jesusfilm"
        />
        <FooterTextLink
          label="iPhone"
          url="https://apps.apple.com/us/app/jesus-film-media/id550525738"
        />
      </Stack>
    </Stack>
  )
}
