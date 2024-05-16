import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { type TreeBlock } from '@core/journeys/ui/block'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../../__generated__/BlockFields'

import { CardItem } from './CardItem/CardItem'

export function NavigateToBlockAction(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { steps, selectedBlock },
    dispatch
  } = useEditor()
  const currentBlock = selectedBlock as
    | TreeBlock<ButtonBlock>
    | TreeBlock<VideoBlock>
    | undefined

  const currentActionStep =
    steps?.find(
      ({ id }) =>
        currentBlock?.action?.__typename === 'NavigateToBlockAction' &&
        id === currentBlock?.action?.blockId
    ) ?? undefined

  function handleButtonClick(): void {
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.JourneyFlow
    })
  }
  return (
    <Box sx={{ p: 4 }}>
      {currentActionStep == null ? (
        <Button
          variant="outlined"
          onClick={handleButtonClick}
          sx={{ height: 140 }}
        >
          {t('Connect this block to a card in the Journey Flow')}
        </Button>
      ) : (
        <CardItem step={currentActionStep} id={currentActionStep.id} />
      )}
    </Box>
  )
}
