import { ReactElement, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import LinkIcon from '@core/shared/ui/icons/Link'
import TextInput1Icon from '@core/shared/ui/icons/TextInput1'

import { BlockFields_FormBlock as FormBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Accordion } from '../../Accordion'
import { Action, actions } from '../../variants/Action/Action'

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
    <>
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
    </>
  )
}
