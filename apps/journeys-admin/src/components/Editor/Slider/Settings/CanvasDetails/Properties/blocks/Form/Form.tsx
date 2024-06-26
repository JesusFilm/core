import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import LinkIcon from '@core/shared/ui/icons/Link'
import TextInput1Icon from '@core/shared/ui/icons/TextInput1'

import { BlockFields_FormBlock as FormBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Accordion } from '../../Accordion'
import { Action, actions } from '../../controls/Action/Action'

import { Credentials } from './Credentials'

export function Form({ id, form, action }: TreeBlock<FormBlock>): ReactElement {
  const { dispatch } = useEditor()
  const selectedAction = actions.find((act) => act.value === action?.__typename)
  const { t } = useTranslation('apps-journeys-admin')

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: `${id}-form-action`
    })
  }, [dispatch, id])

  return (
    <Box data-testid="FormProperties">
      <Accordion
        id={`${id}-form-action`}
        icon={<LinkIcon />}
        name={t('Action')}
        value={selectedAction?.label ?? 'None'}
      >
        <Action />
      </Accordion>

      <Accordion
        id={`${id}-form-credentials`}
        icon={<TextInput1Icon />}
        name={t('Credentials')}
        value={form != null && 'name' in form ? t('Complete') : t('Incomplete')}
      >
        <Credentials />
      </Accordion>
    </Box>
  )
}
