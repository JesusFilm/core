import { ReactElement } from 'react'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { FooterLogos } from './FooterLogos'
import { FooterSocials } from './FooterSocials'
import { FooterLinks } from './FooterLinks'
import { FooterLink } from './FooterLink'

export function Footer(): ReactElement {
  return (
    <>
      <Divider sx={{ height: 2 }} />
      <Container
        component="footer"
        maxWidth="xxl"
        sx={{ backgroundColor: 'background.default', py: 8 }}
      >
        {/* desktop view */}
        <Stack spacing={21} sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Stack direction="row" justifyContent="space-between">
            <FooterLinks />
            <Stack width="220px" spacing={2}>
              <FooterLogos />
              <FooterSocials />
            </Stack>
          </Stack>
          <Stack direction="row" spacing={4} justifyContent="space-between">
            <Stack direction="row" spacing={10} justifyContent="space-between">
              <Typography variant="body2">
                Copyright © 1995-{new Date().getFullYear()}
              </Typography>
              <Typography variant="body2">Jesus Film Project®</Typography>
              <Typography variant="body2">All rights reserved</Typography>
            </Stack>
            <Stack direction="row" spacing={4} justifyContent="space-between">
              <FooterLink
                url="https://www.jesusfilm.org/terms/"
                label="Terms of use"
                variant="body2"
              />
              <FooterLink
                url="https://www.jesusfilm.org/legal/"
                label="Legal Statement"
                variant="body2"
              />
            </Stack>
          </Stack>
        </Stack>

        {/* mobile view */}
        <Stack sx={{ display: { xs: 'flex', sm: 'none' } }} spacing={8}>
          <Stack alignItems="center">
            <FooterSocials />
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack>
              <Typography variant="body2">Copyright © 1995-2022</Typography>
              <Typography variant="body2">Jesus Film Project®</Typography>
            </Stack>
            <FooterLogos />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <FooterLink
              url="https://www.jesusfilm.org/legal/"
              label="Legal Statement"
              variant="body2"
            />
            <Typography variant="body2">All rights reserved</Typography>
            <FooterLink
              url="https://www.jesusfilm.org/terms/"
              label="Terms of use"
              variant="body2"
            />
          </Stack>
        </Stack>
      </Container>
    </>
  )
}
