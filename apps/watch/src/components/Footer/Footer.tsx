import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import MuiLink from '@mui/material/Link'
import { FooterTextLinks } from './FooterTextLinks'
import { FooterLogos } from './FooterLogos'

export function Footer(): ReactElement {
  return (
    <Box
      sx={{
        maxWidth: '100%',
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
          <FooterTextLinks />
          <FooterLogos />
        </Box>
        <Stack direction="row" justifyContent="space-between" mb="62px">
          <Stack direction="row" spacing="100px">
            <Typography variant="body2">Copyright © 1995-2022</Typography>
            <Typography variant="body2">Jesus Film Project®</Typography>
            <Typography variant="body2">All rights reserved</Typography>
          </Stack>
          <Stack direction="row" spacing="100px">
            <MuiLink
              href="https://www.jesusfilm.org/terms/"
              underline="none"
              target="_blank"
              rel="noopener"
              style={{
                color: '#26262E'
              }}
            >
              <Typography variant="subtitle2">Terms of use</Typography>
            </MuiLink>
            <MuiLink
              href="https://www.jesusfilm.org/legal/"
              underline="none"
              target="_blank"
              rel="noopener"
              style={{
                color: '#26262E'
              }}
            >
              <Typography variant="subtitle2">Legal Statement</Typography>
            </MuiLink>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  )
}