import { ReactElement } from 'react'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Image from 'next/image'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

import JFLogo from '../../../public/images/jf-logo@2x.png'
import CruLogo from '../../../public/images/cru-logo.png'
import Facebook from '../../../public/icons/facebook.svg'
import Twitter from '../../../public/icons/twitter.svg'
import Youtube from '../../../public/icons/youtube.svg'
import Instagram from '../../../public/icons/instagram.svg'

interface FooterProps {
  isHome?: boolean
}

export function Footer({ isHome = false }: FooterProps): ReactElement {
  const theme = useTheme()
  return (
    <Container
      sx={{
        maxWidth: '100% !important',
        width: '100%',
        margin: 0,
        paddingLeft: '100px !important',
        paddingRight: '100px !important',
        backgroundImage: isHome ? 'url(/images/jesus-footer.png)' : '',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: isHome ? 883 : 'inherit'
      }}
    >
      <Stack
        direction="column"
        justifyContent="space-between"
        height="100%"
        sx={{ minHeight: '350px' }}
      >
        <Stack
          direction="row"
          width="100%"
          justifyContent="space-between"
          justifyItems="start"
        >
          <Stack
            sx={{ margin: 'auto' }}
            direction="row"
            justifyContent="space-evenly"
            width="100%"
          >
            <Stack direction="column" spacing="12px">
              <Typography variant="overline">Site</Typography>
              <Typography variant="body1">Home</Typography>
              <Typography variant="body1">About</Typography>
              <Typography variant="body1">Contact Us</Typography>
            </Stack>
            <Stack direction="column" spacing="12px">
              <Typography variant="overline">Apps</Typography>
              <Typography variant="body1">Android</Typography>
              <Typography variant="body1">iPhone</Typography>
            </Stack>
            <Stack direction="column" spacing="12px">
              <Typography variant="overline">Sections</Typography>
              <Typography variant="body1">Strategies and Tools</Typography>
              <Typography variant="body1">How to Help</Typography>
              <Typography variant="body1">Need Help?</Typography>
              <Typography variant="body1">Ways to Donate</Typography>
            </Stack>
          </Stack>
          <Box width="220px">
            <Stack
              direction="row"
              spacing="40px"
              width="220px"
              justifyContent="space-evenly"
            >
              <Box>
                <Image
                  src={JFLogo}
                  width="60"
                  height="60"
                  alt="Jesus Film logo"
                />
              </Box>
              <Box>
                <Image src={CruLogo} width="72" height="52" alt="Cru logo" />
              </Box>
            </Stack>
            <Stack direction="row" mt="63px" spacing="29px">
              <Box>
                <Image src={Facebook} width="32" height="32" alt="Facebook" />
              </Box>
              <Box>
                <Image src={Twitter} width="32" height="32" alt="Twitter" />
              </Box>
              <Box>
                <Image src={Youtube} width="32" height="32" alt="Youtube" />
              </Box>
              <Box>
                <Image src={Instagram} width="32" height="32" alt="Instagram" />
              </Box>
            </Stack>
          </Box>
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          mb="62px"
          sx={{
            color: isHome ? theme.palette.primary.contrastText : 'inherit'
          }}
        >
          <Stack direction="row" spacing="100px">
            <Typography variant="body2">Copyright © 1995-2022</Typography>
            <Typography variant="body2">Jesus Film Project®</Typography>
            <Typography variant="body2">All rights reserved</Typography>
          </Stack>

          <Stack direction="row" spacing="100px">
            <Typography variant="subtitle2">Terms of Use</Typography>
            <Typography variant="subtitle2">Legal Statement</Typography>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  )
}
