import { ReactElement } from 'react'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FooterLogos } from './FooterLogos'
import { FooterSocials } from './FooterSocials'
import { FooterLinks } from './FooterLinks'
import { FooterLink } from './FooterLink'

export function Footer(): ReactElement {
  return (
    <>
      {/* desktop view */}
      <Container
        maxWidth="xl"
        sx={{
          display: { xs: 'none', sm: 'block' },
          height: '350px'
        }}
      >
        <Stack justifyContent="space-between" height="100%" sx={{ py: 4 }}>
          <Stack direction="row" justifyContent="space-between">
            <FooterLinks />
            <Stack width="220px">
              <FooterLogos />
              <FooterSocials />
            </Stack>
          </Stack>
          <Stack
            direction="row"
            spacing={4}
            justifyContent="space-between"
            mb={15.5}
          >
            <Stack direction="row" spacing={10} justifyContent="space-between">
              <Typography variant="body2">Copyright © 1995-2022</Typography>
              <Typography variant="body2">Jesus Film Project®</Typography>
              <Typography variant="body2">All rights reserved</Typography>
            </Stack>
            <Stack direction="row" spacing={4} justifyContent="space-between">
              <FooterLink
                url="https://www.jesusfilm.org/terms/"
                label="Terms of use"
                underline="always"
                variant="body2"
              />
              <FooterLink
                url="https://www.jesusfilm.org/legal/"
                label="Legal Statement"
                underline="always"
                variant="body2"
              />
            </Stack>
          </Stack>
        </Stack>
      </Container>

      {/* mobile view */}
      <Container
        maxWidth="xl"
        sx={{
          display: { xs: 'block', sm: 'none' },
          px: 2
        }}
      >
        <Stack alignItems="end">
          <FooterSocials />
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          pt={7}
        >
          <Stack>
            <Typography variant="body2">Copyright © 1995-2022</Typography>
            <Typography variant="body2">Jesus Film Project®</Typography>
          </Stack>
          <FooterLogos />
        </Stack>
        <Stack
          direction="row"
          spacing={4}
          justifyContent="space-between"
          pt={6}
        >
          <FooterLink
            url="https://www.jesusfilm.org/legal/"
            label="Legal Statement"
            underline="always"
            variant="body2"
          />
          <Typography variant="body2">All rights reserved</Typography>
          <FooterLink
            url="https://www.jesusfilm.org/terms/"
            label="Terms of use"
            underline="always"
            variant="body2"
          />
        </Stack>
      </Container>
    </>
  )
}
