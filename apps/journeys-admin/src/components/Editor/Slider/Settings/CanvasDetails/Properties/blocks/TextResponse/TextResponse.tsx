import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import LinkIcon from '@core/shared/ui/icons/Link'
import TextInput1Icon from '@core/shared/ui/icons/TextInput1'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Accordion } from '../../Accordion'
import { Action, actions } from '../../controls/Action/Action'

import { TextResponseFields } from './TextResponseFields'

export function TextResponse({
  id,
  action,
  label
}: TreeBlock<TextResponseBlock>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const { dispatch } = useEditor()

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: `${id}-text-field-options`
    })
  }, [dispatch, id])

  return (
    <Box data-testid="TextResponseProperties">
      <Accordion
        id={`${id}-text-field-options`}
        icon={<TextInput1Icon />}
        name={t('Feedback')}
        value={label}
      >
        <TextResponseFields />
      </Accordion>
      <Divider orientation="vertical" variant="middle" flexItem />
      <Accordion
        id={`${id}-text-field-action`}
        icon={<LinkIcon />}
        name={t('Action')}
        value={
          actions.find((act) => act.value === action?.__typename)?.label ??
          'None'
        }
      >
        <Action />
      </Accordion>
    </Box>
  )
}
