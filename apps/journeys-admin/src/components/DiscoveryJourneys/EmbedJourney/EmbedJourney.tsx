import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import { gql, useQuery } from '@apollo/client'
import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { TreeBlock } from '@core/journeys/ui/block'
import { transformer } from '@core/journeys/ui/transformer'
import { GetDiscoveryJourney } from '../../../../__generated__/GetDiscoveryJourney'
import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
import { FramePortal } from '../../FramePortal'

interface Props {
  slug: 'admin-left' | 'admin-right' | 'admin-center'
}

export const GET_DISCOVERY_JOURNEY = gql`
  ${BLOCK_FIELDS}
  query GetDiscoveryJourney($id: ID!) {
    discoveryJourney: journey(id: $id, idType: slug) {
      id
      themeName
      themeMode
      blocks {
        ...BlockFields
      }
    }
  }
`

export function EmbedJourney({ slug }: Props): ReactElement {
  // need to update to be calling the right journeys
  const { data } = useQuery<GetDiscoveryJourney>(GET_DISCOVERY_JOURNEY, {
    variables: { id: 'with-primaryimage-copy' }
  })
  const discoveryJourney = data?.discoveryJourney
  const block = transformer(discoveryJourney?.blocks as TreeBlock[])?.[0]

  function handleClick(): void {
    window.open(`https://your.nextstep.is/${slug}`)
  }

  return (
    <Box
      aria-label={`${slug}-embedded`}
      onClick={handleClick}
      sx={{
        height: '100%'
      }}
    >
      {block != null && (
        <>
          <Box
            sx={{
              mx: 'auto',
              mb: 0,
              height: 4.5,
              width: '82.5%',
              backgroundColor: '#AAACBB',
              borderRadius: '16px 16px 0 0',
              opacity: 0.3
            }}
          />
          <Box
            sx={{
              mx: 'auto',
              mb: 0,
              height: 4.5,
              width: '90%',
              backgroundColor: '#AAACBB',
              borderRadius: '16px 16px 0 0',
              opacity: 0.6
            }}
          />
          <FramePortal height="100%" width="100%">
            <ThemeProvider
              themeName={discoveryJourney?.themeName ?? ThemeName.base}
              themeMode={discoveryJourney?.themeMode ?? ThemeMode.light}
            >
              <Box
                sx={{
                  height: '100%',
                  width: '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <BlockRenderer block={block} />
              </Box>
            </ThemeProvider>
          </FramePortal>
        </>
      )}
    </Box>
  )
}
