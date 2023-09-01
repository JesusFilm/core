import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useJourneysQuery } from 'apps/journeys-admin/src/libs/useJourneysQuery'
import Image from 'next/image'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'


import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { GetTemplate } from '../../__generated__/GetTemplate'
import {
  GetJourney,
  GetJourney_journey as Journey
} from '../__generated__/GetJourney'
import { ThemeMode, ThemeName } from '../__generated__/globalTypes'
import logo from '../public/logo.svg'

interface JourneyPageProps {
  journey: Journey
  locale: string
  rtl: boolean
}

export const GET_TEMPLATE = gql`
  ${JOURNEY_FIELDS}
  query GetTemplate($id: ID!) {
    template: adminJourney(id: $id, idType: databaseId) {
      ...JourneyFields
    }
  }
`
const StyledIframe = styled('iframe')(({ theme }) => ({}))

function TemplatesPage({
  journey,
  locale,
  rtl
}: JourneyPageProps): ReactElement {
  const router = useRouter()
  // const { templateId } = router.query;
  // const { data } = useQuery<GetTemplate>(GET_TEMPLATE, {
  //   variables: { id: templateId }
  // })

  const [templateData, setTemplateData] = useState(null)

  const { data: templates } = useJourneysQuery({ where: { template: true } })

  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
      <Container fixed>
        <Stack spacing={8} py={8}>
          <Stack direction="row">
            <Box flexGrow={1}>
              <Image src={logo} alt="Next Steps" height={40} width={152} sx={{position:'absolute'}} />
            </Box>
            <NextLink
                href="/"
                passHref
              >
              <Button variant="text" size='medium' sx={{fontWeight:400}}>
                Product
              </Button>
            </NextLink>
            {/* <Divider orientation='vertical' flexItem/> */}
            <NextLink
                href="/templates"
                passHref
              >
              <Button variant="text"  size='medium' sx={{fontWeight:400}}>
                Templates
              </Button>
            </NextLink>
            <NextLink
                href="/templates"
                passHref
              >
              <Button variant="contained"  size='medium' sx={{fontWeight:400, marginLeft:'20px'}}>
                Create Your Journey
              </Button>
            </NextLink>
          </Stack>
        </Stack>
      </Container>
      <Divider />
      <Container fixed>
        <Stack direction="row" spacing={8}>
          <Box flexGrow={1} my={12}>
            <Typography
                align="center"
                variant="h1"
                sx={{
                  fontSize: '50px',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: '-.75px',
                  textShadow: 'none',
                  marginBottom: '20px'
                }}
              >Templates</Typography>
            <Typography
                align="center"
                variant="h2"
                sx={{
                  fontSize: '32px',
                  fontWeight: 400,
                  lineHeight: 1.2,
                  textShadow: 'none'
                }}
              >
              Relevant and interactive faith journeys that connect filtered
              seekers into chat with missionaries
            </Typography>
          </Box>
        </Stack>

        <Box>
          <Grid container spacing={{ xs: 2, sm: 4 }}>
            {templates?.journeys.map(({ id, slug }, index) => (
              <Grid item key={id} xs={12} sm={6} md={4}>
                <Box sx={{ position: 'relative' }}>
                  <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    zIndex: -1,
                    overflow: 'hidden'
                  }}
                >
                    {/* <Fade in timeout={(index + 1) * 1000}> */}
                    <StyledIframe
                      src={`/embed/${slug}`}
                      sx={{
                        width: 'calc(100% + 64px)',
                        height: 564,
                        border: 'none',
                        margin: '-32px',

                      }}
                    />
                    {/* </Fade> */}
                  </Box>
                  <NextLink href={`/templates/${id}`} passHref>
                    <Box
                    component="a"
                    sx={{
                      display: 'block',
                      width: '100%',
                      height: 500,
                      '&:hover' : {
                        background: 'rgba(255,255,255,.5)'
                      }
                    }}
                  />
                  </NextLink>
                </Box>
              </Grid>
          ))}
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  )
}

export default TemplatesPage
