import { gql, useQuery } from '@apollo/client'
import AltRouteOutlinedIcon from '@mui/icons-material/AltRouteOutlined';
import AodOutlinedIcon from '@mui/icons-material/AodOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DesignServicesOutlinedIcon from '@mui/icons-material/DesignServicesOutlined';
import TornadoOutlinedIcon from '@mui/icons-material/TornadoOutlined';
import { Button, Container, Divider, Fade, Stack, Typography, styled } from '@mui/material'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { Box } from '@mui/system'
import { CardView } from 'apps/journeys-admin/src/components/JourneyView/CardView'
import { useJourneysQuery } from 'apps/journeys-admin/src/libs/useJourneysQuery'
import Image from 'next/image'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'


import { GetTemplate } from '../../__generated__/GetTemplate'
import { ThemeMode, ThemeName } from '../../__generated__/globalTypes'
import logo from '../../public/logo.svg'
import {
  GetJourney,
  GetJourney_journey as Journey
} from '../__generated__/GetJourney'

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

function TemplatePage({
  journey,
  locale,
  rtl
}: JourneyPageProps): ReactElement {
  const router = useRouter()
  const { templateId } = router.query
  const { data } = useQuery<GetTemplate>(GET_TEMPLATE, {
    variables: { id: templateId }
  })

  const [templateData, setTemplateData] = useState(null)

  const { data: templates } = useJourneysQuery({ where: { template: true } })

  const [selectedTab, setSelectedTab] = useState<string>('1')
  const StyledIframe = styled('iframe')(({ theme }) => ({}))
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setSelectedTab(newValue)
  }

  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
      <Container fixed>
        <Stack spacing={8} py={8}>
          <Stack direction="row">
            <Box flexGrow={1}>
              <Image
                  src={logo}
                  alt="Next Steps"
                  height={40}
                  width={152}
                  sx={{ position: 'absolute' }}
                />
            </Box>
            <NextLink href="/" passHref>
              <Button variant="text" size="medium" sx={{ fontWeight: 400 }}>
                Product
              </Button>
            </NextLink>
            {/* <Divider orientation='vertical' flexItem/> */}
            <NextLink href="/templates" passHref>
              <Button variant="text" size="medium" sx={{ fontWeight: 400 }}>
                Templates
              </Button>
            </NextLink>
            <NextLink href="/templates" passHref>
              <Button
                  variant="contained"
                  size="medium"
                  sx={{ fontWeight: 400, marginLeft: '20px' }}
                >
                Create Your Journey
              </Button>
            </NextLink>
          </Stack>
        </Stack>
      </Container>
      <Divider />
      <Container fixed>
        <Stack spacing={8} py={8}>
            
          {console.log({ data })}
          {console.log({ templates })}

          <Box>
            <NextLink
                href="/templates"
                passHref
              >
              <Button variant="outlined" startIcon={<ArrowBackRoundedIcon />}>
                Templates
              </Button>
            </NextLink>
          </Box>
          <Stack direction="row" spacing={8}>
            <Box>
              <Image
                src={data?.template.primaryImageBlock?.src}
                alt={data?.template.primaryImageBlock?.src}
                width={100}
                height={100}
                objectFit="cover"
                style={{ borderRadius: '4px' }}
              />
            </Box>
            <Box flexGrow={1}>
              <Typography variant="h4" component="h1">{data?.template.title}</Typography>
              <Typography variant="subtitle1">
                {data?.template.description}
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Tabs value={selectedTab} onChange={handleTabChange} centered>
            <Tab value="1" label="Template" icon={<AodOutlinedIcon />} />
            <Tab value="2" label="Editing" icon={<DesignServicesOutlinedIcon />} />
            <Tab value="3" label="Branching" icon={<AltRouteOutlinedIcon />} />
            <Tab value="4" label="Strategy" icon={<TornadoOutlinedIcon />} />
          </Tabs>

          <Box sx={{ display: selectedTab !== '1' ? 'none' : 'block' }}>
            <Box alignContent="center" alignItems="center">
              <Box sx={{ position: 'relative', maxWidth: '380px' }}>
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
                  <Fade in timeout={1000}>
                    <StyledIframe
                    src={`/embed/${data?.template.slug}`}
                    sx={{
                      width: 'calc(100% + 64px)',
                      height: 664,
                      border: 'none',
                      margin: '-32px'
                    }}
                  />
                  </Fade>
                </Box>
                <NextLink
                href={`/${data?.template.slug}`}
                passHref
                target="_blank"
              >
                  <Box
                  component="a"
                  sx={{
                    display: 'block',
                    width: '100%',
                    height: 600
                  }}
                />
                </NextLink>
              </Box>
              {/* <Divider /> */}
              {/* {data?.template?.blocks?.length > 1 && <CardView id={data?.template?.id} blocks={data?.template?.blocks} isPublisher={false} /> } */}
            </Box>
          </Box>
          <Box sx={{ display: selectedTab !== '2' ? 'none' : 'block' }}>
            <Box><img src="https://cdn-std.droplr.net/files/acc_760170/o1oUmL" width="1000" /></Box>
          </Box>
          <Box sx={{ display: selectedTab !== '3' ? 'none' : 'block' }}>
            <Box><img src="https://cdn-std.droplr.net/files/acc_760170/AXjfWi" width="1000" /></Box>
          </Box>
          <Box sx={{ display: selectedTab !== '4' ? 'none' : 'block' }}>
            <Box><Box
              sx={{
                position: 'relative',
                paddingBottom: 'calc(56.25% + 14px)' /* 16:9 aspect ratio */,
                height: 0,
                overflow: 'hidden',
                mx: '-12px!important',

                '& > iframe': {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#fff',
                  border: 'none',
                  padding: 0,
                  margin: 0
                }
              }}
            >
              <iframe
                loading="lazy"
                src="https://www.canva.com/design/DAFrRM--fIE/view?embed"
                frameBorder="0"
                // width="960"
                // height="569"
                allowFullScreen="true"
                mozallowfullscreen="true"
                webkitallowfullscreen="true"
              />
            </Box></Box>
          </Box>

          <Button variant="contained" size="large" startIcon={<DesignServicesOutlinedIcon sx={{ fontSize: '40px!important' }} />} sx={{
        width:'100%',
        fontSize:'40px',
        textTransform:'none',
        position: 'sticky',
        bottom: '20px',
        mt: 4,
      }}>Make it Yours</Button>
        </Stack>
      </Container>
    </ThemeProvider>
  )
}

export default TemplatePage
