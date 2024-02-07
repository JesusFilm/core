import { ReactElement, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import LinkIcon from '@core/shared/ui/icons/Link'

import { GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock } from '../../../../../../../__generated__/GetJourney'
import { Action, actions } from '../../Action/Action'
import { Attribute } from '../../Attribute'

export function RadioOption({
  id,
  action
}: TreeBlock<RadioOptionBlock>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { dispatch } = useEditor()

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      id: `${id}-radio-option-action`
    })
    dispatch({
      type: 'SetDrawerPropsAction',
      title: t('Action'),
      children: <Action />
    })
  }, [dispatch, id, t])

  return (
    <>
      <Attribute
        id={`${id}-radio-option-action`}
        icon={<LinkIcon />}
        name={t('Action')}
        value={t(
          actions.find((act) => act.value === action?.__typename)?.label ??
            'None'
        )}
        description={t('Action')}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: t('Action'),
            mobileOpen: true,
            children: <Action />
          })
        }}
        testId="RadioOption"
      />
    </>
  )
}
