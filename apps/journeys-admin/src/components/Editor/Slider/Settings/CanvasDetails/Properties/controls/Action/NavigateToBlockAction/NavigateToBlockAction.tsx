import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { type TreeBlock } from '@core/journeys/ui/block'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'

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
    <>
      <Typography
        variant="caption"
        color="secondary.main"
        sx={{ mt: 1, mb: 3 }}
      >
        {t('Navigate to the selected card (set in the map).')}
      </Typography>
      {currentActionStep == null ? (
        <Button
          variant="outlined"
          onClick={handleButtonClick}
          startIcon={<ChevronLeftIcon />}
          sx={{ height: 56 }}
        >
          {t('back to map')}
        </Button>
      ) : (
        <CardItem step={currentActionStep} id={currentActionStep.id} />
      )}
    </>
  )
}
