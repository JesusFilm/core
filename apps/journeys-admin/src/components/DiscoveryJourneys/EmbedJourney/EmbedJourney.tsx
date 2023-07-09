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
  const dimensions = {
    xs: 'calc(250% + 64px)',
    sm: 'calc(166% + 64px)',
    md: 'calc(125% + 64px)'
  }

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
      sx={{
        transform: {
          xs: 'scale(0.4)',
          sm: 'scale(0.6)',
          md: 'scale(0.8)'
        },
        transformOrigin: 'top left',
        width: dimensions,
        height: dimensions
      }}
      onClick={handleClick}
    >
      {block != null && (
        <Box sx={{ height: '100%', width: '100%', border: 0, margin: '-32px' }}>
          <ThemeProvider
            themeName={discoveryJourney?.themeName ?? ThemeName.base}
            themeMode={discoveryJourney?.themeMode ?? ThemeMode.light}
          >
            <BlockRenderer
              block={block}
              wrappers={{
                ImageWrapper: NullWrapper,
                VideoWrapper: NullWrapper
              }}
            />
          </ThemeProvider>
        </Box>
      )}
    </Box>
  )
}

function NullWrapper({ children }): ReactElement {
  return <fieldset disabled>{children}</fieldset>
}
