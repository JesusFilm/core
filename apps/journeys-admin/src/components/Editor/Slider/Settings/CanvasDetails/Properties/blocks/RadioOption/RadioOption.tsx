import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import Image3Icon from '@core/shared/ui/icons/Image3'
import LinkIcon from '@core/shared/ui/icons/Link'

import { BlockFields_RadioOptionBlock as RadioOptionBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Accordion } from '../../Accordion'
import { Action } from '../../controls/Action'
import { getAction } from '../../controls/Action/utils/actions'

import { RadioOptionImage } from './RadioOptionImage/RadioOptionImage'

export function RadioOption(props: TreeBlock<RadioOptionBlock>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedBlock },
    dispatch
  } = useEditor()
  const selectedAction = getAction(t, props.action?.__typename)

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
        name={t('Background')}
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
