import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useMemo } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import Image3Icon from '@core/shared/ui/icons/Image3'
import LinkIcon from '@core/shared/ui/icons/Link'

import {
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_RadioQuestionBlock as RadioQuestionBlock
} from '../../../../../../../../../__generated__/BlockFields'
import { Accordion } from '../../Accordion'
import { Action } from '../../controls/Action'
import { getAction } from '../../controls/Action/utils/actions'

import { RadioOptionImage } from './RadioOptionImage/RadioOptionImage'

export function RadioOption({
  id,
  action
}: TreeBlock<RadioOptionBlock>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const selectedAction = getAction(t, action?.__typename)
  const parentBlock = useMemo(() => {
    return selectedStep?.children.find(
      (child) => child.id === selectedBlock?.parentBlockId
    )
  }, [selectedBlock, selectedStep])
  const gridView = (parentBlock as RadioQuestionBlock)?.gridView ?? false

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: `${id}-radio-option-action`
    })
  }, [dispatch, id])

  return (
    <Box data-testid="RadioOptionProperties">
      <Accordion
        id={`${id}-radio-option-action`}
        icon={<LinkIcon />}
        name={t('Action')}
        value={selectedAction.label}
      >
        <Action />
      </Accordion>
      <Accordion
        id={`${id}-radio-option-image`}
        icon={<Image3Icon />}
        name={t('Background')}
        value={
          (selectedBlock as TreeBlock<RadioOptionBlock>)?.pollOptionImageId ??
          t('No image')
        }
      >
        <RadioOptionImage
          radioOptionBlock={selectedBlock as TreeBlock<RadioOptionBlock>}
        />
      </Accordion>
    </Box>
  )
}
