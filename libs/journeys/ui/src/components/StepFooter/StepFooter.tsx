import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SxProps } from '@mui/material/styles'
import { gql, useQuery, useMutation } from '@apollo/client'

import { ReactElement, useEffect } from 'react'
import { useJourney } from '../../libs/JourneyProvider'
import { getJourneyRTL } from '../../libs/rtl'
import { HostTitleLocation } from './HostTitleLocation'
import { HostAvatars } from './HostAvatars'
import { ChatButtons } from './ChatButtons'
import { GetHosts } from './__generated__/GetHosts'
import { CreateHost } from './__generated__/CreateHost'

export const GET_HOSTS = gql`
  query GetHosts {
    hosts(teamId: "jfp-team") {
      id
      title
      src1
      src2
      location
    }
  }
`

export const CREATE_HOST = gql`
  mutation CreateHost(
    $title: String!
    $location: String!
    $src1: String!
    $src2: String!
  ) {
    hostCreate(
      teamId: "jfp-team"
      input: { title: $title, location: $location, src1: $src1, src2: $src2 }
    ) {
      id
      title
      location
      src1
      src2
    }
  }
`

interface StepFooterProps {
  onFooterClick?: () => void
  sx?: SxProps
}

export function StepFooter({
  onFooterClick,
  sx
}: StepFooterProps): ReactElement {
  const { journey } = useJourney()
  const { rtl } = getJourneyRTL(journey)
  const { data } = useQuery<GetHosts>(GET_HOSTS)
  const [createHost] = useMutation<CreateHost>(CREATE_HOST)

  const seedHosts = async (): Promise<void> => {
    const { data: hostData1 } = await createHost({
      variables: {
        title: 'Cru International',
        location: 'Florida, USA',
        src1: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        src2: null
      }
    })

    const { data: hostData2 } = await createHost({
      variables: {
        title: 'Anonymous',
        location: 'Bermuda Triangle',
        teamId: 'jfp-team',
        src1: null,
        src2: null
      }
    })

    const { data: hostData3 } = await createHost({
      variables: {
        title: 'Multiple Creators',
        location: 'Worldwide',
        teamId: 'jfp-team',
        src1: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        src2: 'https://images.unsplash.com/photo-1651069188152-bf30b5af2a0d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1364&q=80'
      }
    })

    console.log('journey', journey, data, hostData1, hostData2, hostData3)
  }

  useEffect(() => {
    void seedHosts()
  }, [])

  return (
    <Box
      data-testid="stepFooter"
      className="swiper-no-swiping"
      sx={{
        position: { xs: 'absolute', lg: 'relative' },
        zIndex: 1,
        bottom: 0,
        width: { xs: '100%', lg: 'auto' },
        ...sx
      }}
      onClick={(e) => {
        if (onFooterClick != null) {
          e.stopPropagation()
          onFooterClick()
        }
      }}
    >
      <Stack
        justifyContent="space-between"
        sx={{
          px: { xs: 6, lg: 6 },
          py: { xs: 2, lg: 2 },
          flexDirection: { lg: rtl ? 'row-reverse' : 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', lg: 'center' }
        }}
      >
        {/* <Stack
          data-testid="chip"
          sx={{
            display: { xs: 'flex', lg: 'none' },
            width: 24,
            height: 16,
            borderRadius: 5,
            backgroundColor: 'white'
          }}
        /> */}
        <Stack
          sx={{
            flexGrow: 1,
            width: '100%',
            flexDirection: rtl ? 'row-reverse' : 'row',
            alignItems: 'center'
          }}
          gap={4}
        >
          <Stack
            sx={{
              width: '100%',
              minWidth: 0,
              flexDirection: 'row',
              alignItems: 'center'
            }}
            gap={2}
          >
            <HostAvatars />
            <Stack sx={{ py: 1.5, flex: '1 1 100%', minWidth: 0 }}>
              <Typography
                sx={{
                  zIndex: 1,
                  // Always dark mode on lg breakpoint
                  color: { xs: 'primary.main', lg: 'white' },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {journey?.seoTitle ?? journey?.title}
              </Typography>
              <HostTitleLocation />
            </Stack>
            {/* <Stack
              data-testid="chip"
              sx={{
                display: { xs: 'none', lg: 'flex' },
                width: 24,
                height: 16,
                borderRadius: 5,
                backgroundColor: 'white'
              }}
            /> */}
          </Stack>
          <Box>
            <ChatButtons />
          </Box>
        </Stack>
      </Stack>
    </Box>
  )
}
