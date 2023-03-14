import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import type { TreeBlock } from '@core/journeys/ui/block'
import { transformer } from '@core/journeys/ui/transformer'
import Typography from '@mui/material/Typography'
import { FramePortal } from '../../../FramePortal'
import { ThemeMode, ThemeName } from '../../../../../__generated__/globalTypes'
import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_ButtonBlock_action_LinkAction as LinkAction
} from '../../../../../__generated__/BlockFields'

interface ActionCardsProps {
  url: string
}

export function ActionCards({ url }: ActionCardsProps): ReactElement {
  const { journey } = useJourney()
  const { rtl } = getJourneyRTL(journey)

  console.log(journey?.blocks)

  const hasAction = (block: TreeBlock): boolean => {
    if (((block as ButtonBlock).action as LinkAction)?.url === url) return true
    if (block.children.length === 0) return false
    return block.children?.some(hasAction)
  }
  const blocks = transformer(journey?.blocks as TreeBlock[]).filter(hasAction)

  return (
    <>
      <Typography>It appears on following cards and elements: </Typography>
      {blocks?.map((block) => (
        <Box
          key={block.id}
          sx={{
            width: 104,
            position: 'relative',
            height: 154,
            mb: 2,
            overflow: 'hidden',
            borderRadius: 3,
            outline: '1px solid #DEDFE0',
            outlineOffset: '-4px'
          }}
        >
          {block != null && (
            <Box
              sx={{
                transform: 'scale(0.25)',
                transformOrigin: '12% 3%'
              }}
            >
              <FramePortal width={340} height={520} dir={rtl ? 'rtl' : 'ltr'}>
                <ThemeProvider
                  themeName={journey?.themeName ?? ThemeName.base}
                  themeMode={journey?.themeMode ?? ThemeMode.light}
                >
                  <Box sx={{ height: '100%' }}>
                    <BlockRenderer
                      block={block}
                      wrappers={{
                        ImageWrapper: NullWrapper,
                        VideoWrapper: NullWrapper
                      }}
                    />
                  </Box>
                </ThemeProvider>
              </FramePortal>
            </Box>
          )}
        </Box>
      ))}
    </>
  )
}

function NullWrapper({ children }): ReactElement {
  return <fieldset disabled>{children}</fieldset>
}

// can you write a chain array function that returns the object in an array that contains this parent block id
