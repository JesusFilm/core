import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import MuiLink from '@mui/material/Link'
import { FooterLogos } from './FooterLogos'
import { FooterSocials } from './FooterSocials'
import { FooterLinks } from './FooterLinks'

export function Footer(): ReactElement {
  return (
    <>
      {/* desktop view */}
      <Container
        maxWidth='xl'
        sx={{
          display: { xs: 'none', sm: 'block' },
          height: '350px'
        }}
      >
        <Stack
          direction="column"
          justifyContent="space-between"
          height="100%"
          sx={{ py: 4 }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}
          >
            <FooterLinks />
            <Stack width="220px">
              <FooterLogos />
              <FooterSocials />
            </Stack>
          </Box>
          <Stack
            direction="row"
            spacing={4}
            justifyContent="space-between"
            mb="62px"
          >
            <Stack direction="row" spacing={10} justifyContent="space-between">
              <Typography variant="body2">Copyright © 1995-2022</Typography>
              <Typography variant="body2">Jesus Film Project®</Typography>
              <Typography variant="body2">All rights reserved</Typography>
            </Stack>
            <Stack direction="row" spacing={4} justifyContent="space-between">
              <MuiLink
                href="https://www.jesusfilm.org/terms/"
                target="_blank"
                rel="noopener"
                color="#26262E"
              >
                <Typography variant="body2">Terms of use</Typography>
              </MuiLink>
              <MuiLink
                href="https://www.jesusfilm.org/legal/"
                target="_blank"
                rel="noopener"
                color="#26262E"
              >
                <Typography variant="body2">Legal Statement</Typography>
              </MuiLink>
            </Stack>
          </Stack>
        </Stack>
      </Container>

      {/* mobile view */}
      <Container
        maxWidth='xl'
        sx={{
          display: { xs: 'block', sm: 'none' },
          px: 2
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <FooterSocials />
        </Box>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          pt={7}
        >
          <Stack direction="column">
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
          <MuiLink
            href="https://www.jesusfilm.org/legal/"
            target="_blank"
            rel="noopener"
            color="text.primary"
          >
            <Typography variant="body2">Legal Statement</Typography>
          </MuiLink>
          <Typography variant="body2">All rights reserved</Typography>
          <MuiLink
            href="https://www.jesusfilm.org/terms/"
            target="_blank"
            rel="noopener"
            color="text.primary"
          >
            <Typography variant="body2">Terms of use</Typography>
          </MuiLink>
        </Stack>
      </Container>
    </>
  )
}
