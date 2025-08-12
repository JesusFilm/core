import Box from '@mui/material/Box'
import flatmap from 'lodash/flatMap'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useEffect, useMemo } from 'react'

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

export function RadioOption(props: TreeBlock<RadioOptionBlock>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const selectedAction = getAction(t, props.action?.__typename)

  const flatten = useCallback((children: TreeBlock[]): TreeBlock[] => {
    return flatmap(children, (item) => [item, ...flatten(item.children)])
  }, [])

  const allBlocks = useMemo(() => {
    return flatten(selectedStep?.children ?? [])
  }, [selectedStep, flatten])

  const parentBlock: TreeBlock<RadioQuestionBlock> | undefined = useMemo(() => {
    return allBlocks.find(
      (block) =>
        block.id === selectedBlock?.parentBlockId &&
        block.__typename === 'RadioQuestionBlock'
    ) as TreeBlock<RadioQuestionBlock>
  }, [allBlocks, selectedBlock])

  const disabled = !parentBlock?.gridView === true

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: `${props.id}-radio-option-action`
    })
  }, [dispatch, props.id])

  return (
    <Box data-testid="RadioOptionProperties">
      <Accordion
        id={`${props.id}-radio-option-action`}
        icon={<LinkIcon />}
        name={t('Action')}
        value={selectedAction.label}
      >
        <Action />
      </Accordion>
      <Accordion
        id={`${props.id}-radio-option-image`}
        icon={<Image3Icon />}
        name={t('Image Source')}
        disabled={disabled}
        value={
          (selectedBlock as TreeBlock<RadioOptionBlock>)
            ?.pollOptionImageBlockId ?? t('No image')
        }
      >
        <RadioOptionImage radioOptionBlock={{ ...props }} />
      </Accordion>
    </Box>
  )
}
