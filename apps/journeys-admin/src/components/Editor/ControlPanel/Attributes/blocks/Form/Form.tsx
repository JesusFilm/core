import { ReactElement, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import LinkIcon from '@core/shared/ui/icons/Link'
import StarsIcon from '@core/shared/ui/icons/Stars'

import { GetJourney_journey_blocks_FormBlock as FormBlock } from '../../../../../../../__generated__/GetJourney'
import { Action, actions } from '../../Action/Action'
import { Attribute } from '../../Attribute'

import { Credentials } from './Credentials'

export function Form({ id, form, action }: TreeBlock<FormBlock>): ReactElement {
  const { dispatch } = useEditor()
  const selectedAction = actions.find((act) => act.value === action?.__typename)
  const {t} = useTranslation('apps-journeys-admin')

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      id: `${id}-form-action`
    })
    dispatch({
      type: 'SetDrawerPropsAction',
      title: 'Action',
      children: <Action />
    })
  }, [dispatch, id])

  return (
    <>
      <Attribute
        id={`${id}-form-action`}
        icon={<LinkIcon />}
        name={t("Action")}
        value={selectedAction?.label ?? 'None'}
        description={t("Action")}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: t('Action'),
            mobileOpen: true,
            children: <Action />
          })
        }}
      />

      <Attribute
        id={`${id}-form-credentials`}
        icon={<StarsIcon />}
        name={t("Credentials")}
        value={form != null && 'name' in form ? t('Complete') : t('Incomplete')}
        description={t("Formium Credentials")}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: t('Credentials'),
            mobileOpen: true,
            children: <Credentials />
          })
        }}
      />
    </>
  )
}
