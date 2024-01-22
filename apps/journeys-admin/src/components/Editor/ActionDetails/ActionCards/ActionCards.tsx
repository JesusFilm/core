import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { ActiveFab, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { transformer } from '@core/journeys/ui/transformer'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_ButtonBlock_action_LinkAction as LinkAction
} from '../../../../../__generated__/BlockFields'
import { ThemeMode, ThemeName } from '../../../../../__generated__/globalTypes'
import { FramePortal } from '../../../FramePortal'

interface ActionCardsProps {
  url: string
}

export function ActionCards({ url }: ActionCardsProps): ReactElement {
  const { journey } = useJourney()
  const { dispatch } = useEditor()
  const { rtl } = getJourneyRTL(journey)
  const { t } = useTranslation('apps-journeys-admin')

  function hasAction(block: TreeBlock): boolean {
    if (((block as ButtonBlock).action as LinkAction)?.url === url) return true
    if (block.children.length === 0) return false
    return block.children?.some(hasAction)
  }
  const blocks = transformer(journey?.blocks as TreeBlock[]).filter(hasAction)

  function handleClick(step): void {
    dispatch({ type: 'SetSelectedStepAction', step })
    dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Add })
  }

  return (
    <Stack gap={6} sx={{ mb: 14 }} data-testid="ActionCards">
      <Box>
        <Typography variant="subtitle2" color="secondary.dark">
          {t('Appears on the cards')}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {t(
            'Once you replace the URL it will apply on each of the following cards:'
          )}
        </Typography>
      </Box>
      {blocks?.map((block) => (
        <Stack key={block.id} gap={4} direction="row">
          <Box
            sx={{
              width: 85,
              position: 'relative',
              height: 129,
              mb: 2,
              overflow: 'hidden',
              borderRadius: 2
            }}
            onClick={() => handleClick(block)}
          >
            {block != null && (
              <Box
                sx={{
                  transform: 'scale(0.25)',
                  transformOrigin: 'left top'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    display: 'block',
                    width: 340,
                    height: 520,
                    zIndex: 2,
                    cursor: 'pointer'
                  }}
                />
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
      blockType = 'Feedback'
      label = actionBlock?.submitLabel ?? ''
      break
    case 'RadioOptionBlock':
      blockType = 'Poll'
      label = actionBlock?.label ?? ''
      break
    case 'SignUpBlock':
      blockType = 'Subscribe'
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
      <Typography variant="subtitle2">{label}</Typography>
    </Stack>
  )
}

function NullWrapper({ children }): ReactElement {
  return <fieldset disabled>{children}</fieldset>
}
