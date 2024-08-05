import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import LinkIcon from '@core/shared/ui/icons/Link'
import TextInput1Icon from '@core/shared/ui/icons/TextInput1'

import { BlockFields_FormBlock as FormBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Accordion } from '../../Accordion'
import { Action } from '../../controls/Action'
import { getAction } from '../../controls/Action/utils/actions'

import { Credentials } from './Credentials'

export function Form({ id, form, action }: TreeBlock<FormBlock>): ReactElement {
  const { dispatch } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')
  const selectedAction = getAction(t, action?.__typename)

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
        value={selectedAction.label}
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
