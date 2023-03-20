import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import type { TreeBlock } from '@core/journeys/ui/block'
import { transformer } from '@core/journeys/ui/transformer'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
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

  function hasAction(block: TreeBlock): boolean {
    if (((block as ButtonBlock).action as LinkAction)?.url === url) return true
    if (block.children.length === 0) return false
    return block.children?.some(hasAction)
  }
  const blocks = transformer(journey?.blocks as TreeBlock[]).filter(hasAction)

  return (
    <Stack gap={6} sx={{ mt: 7, mb: 14 }}>
      <Box>
        <Typography variant="subtitle2" color="secondary.dark">
          Appears on the cards
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.5 }}>
          Once you replace the URL it will apply on each of the following cards:
        </Typography>
      </Box>
      {blocks?.map((block) => (
        <Stack key={block.id} gap={4} direction="row">
          <Box
            sx={{
              width: 102,
              position: 'relative',
              height: 154,
              mb: 2,
              overflow: 'hidden',
              borderRadius: 2
            }}
          >
            {block != null && (
              <Box
                sx={{
                  transform: 'scale(0.3)',
                  transformOrigin: 'left top'
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
          <ActionCardsDetail block={block} url={url} />
        </Stack>
      ))}
    </Stack>
  )
}

interface ActionCardsDetailProps {
  block: TreeBlock
  url: string
}

function ActionCardsDetail({
  block,
  url
}: ActionCardsDetailProps): ReactElement {
  function findBlockWithAction(block): TreeBlock | null {
    if (((block as ButtonBlock).action as LinkAction)?.url === url) return block
    if (block.children != null) {
      for (const childBlock of block.children) {
        const result = findBlockWithAction(childBlock)
        if (result != null) return result
      }
    }
    return null
  }

  const actionBlock = findBlockWithAction(block)

  let blockType: string | undefined
  let label: string | undefined
  const buttonBlock = actionBlock as ButtonBlock

  switch (actionBlock?.__typename) {
    case 'TextResponseBlock':
      blockType = 'Text'
      label = actionBlock?.submitLabel ?? ''
      break
    case 'RadioOptionBlock':
      blockType = 'Poll'
      label = actionBlock?.label ?? ''
      break
    case 'SignUpBlock':
      blockType = 'Sign Up'
      label = actionBlock?.submitLabel ?? ''
      break
    default:
      blockType = buttonBlock?.__typename.replace('Block', '')
      label = buttonBlock?.label ?? ''
      break
  }

  return (
    <Stack justifyContent="center" gap={2} width={160}>
      <Typography variant="subtitle2" color="text.secondary">
        {blockType}
      </Typography>
      <Typography variant="subtitle1">{label}</Typography>
    </Stack>
  )
}

function NullWrapper({ children }): ReactElement {
  return <fieldset disabled>{children}</fieldset>
}
