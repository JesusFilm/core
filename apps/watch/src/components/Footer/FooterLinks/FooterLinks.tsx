import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FooterLink } from '../FooterLink'

export function FooterLinks(): ReactElement {
  return (
    <Stack direction="row" width="100%" spacing={20}>
      <Stack direction="column" spacing={4}>
        <Typography variant="h6" sx={{ textTransform: 'uppercase' }}>
          About
        </Typography>
        <FooterLink
          label="About Us"
          url="https://www.jesusfilm.org/about/"
          underline="none"
        />
        <FooterLink
          label="Contact"
          url="https://www.jesusfilm.org/contact/"
          underline="none"
        />
        <FooterLink
          label="Ways to Give"
          url="https://www.jesusfilm.org/give/"
          underline="none"
        />
      </Stack>
      <Stack direction="column" spacing={3}>
        <Typography variant="h6" sx={{ textTransform: 'uppercase' }}>
          Sections
        </Typography>
        <FooterLink
          label="Strategies and Tools"
          url="https://www.jesusfilm.org/partners/mission-trips/"
          underline="none"
        />
        <FooterLink
          label="Blog"
          url="https://www.jesusfilm.org/blog/"
          underline="none"
        />
        <FooterLink
          label="How to Help"
          url="https://www.jesusfilm.org/partners/"
          underline="none"
        />
      </Stack>
      <Stack direction="column" spacing={3}>
        <Typography variant="h6" sx={{ textTransform: 'uppercase' }}>
          Apps
        </Typography>
        <FooterLink
          label="Android"
          url="https://play.google.com/store/apps/details?id=com.jesusfilmmedia.android.jesusfilm"
          underline="none"
        />
        <FooterLink
          label="iPhone"
          url="https://apps.apple.com/us/app/jesus-film-media/id550525738"
          underline="none"
        />
      </Stack>
    </Stack>
  )
}
