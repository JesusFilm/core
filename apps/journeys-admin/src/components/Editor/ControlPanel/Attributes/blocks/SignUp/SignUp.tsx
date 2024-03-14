import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import InformationCircleContained from '@core/shared/ui/icons/InformationCircleContained'
import LinkIcon from '@core/shared/ui/icons/Link'

import { GetJourney_journey_blocks_SignUpBlock as SignUpBlock } from '../../../../../../../__generated__/GetJourney'
import { IconFields } from '../../../../../../../__generated__/IconFields'
import { Action, actions } from '../../Action/Action'
import { Attribute } from '../../Attribute'
import { Icon, icons } from '../../Icon'

export function SignUp({
  id,
  action,
  submitIconId,
  children
}: TreeBlock<SignUpBlock>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { dispatch } = useEditor()
  const selectedAction = actions.find((act) => act.value === action?.__typename)
  const submitIcon = children.find(
    (block) => block.id === submitIconId
  ) as TreeBlock<IconFields>
  const submitLabel = icons.find(
    ({ value }) => value === submitIcon?.iconName
  )?.label

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      id: `${id}-signup-action`
    })
    dispatch({
      type: 'SetDrawerPropsAction',
      title: t('Form Submission'),
      children: <Action />
    })
  }, [dispatch, id, t])

  return (
    <>
      <Attribute
        id={`${id}-signup-action`}
        icon={<LinkIcon />}
        name={t('Action')}
        value={t(selectedAction?.label ?? 'None')}
        description={t('Form Submission')}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: t('Form Submission'),
            mobileOpen: true,
            children: <Action />
          })
        }}
      />

      <Attribute
        id={`${id}-signup-icon`}
        icon={<InformationCircleContained />}
        name={t('Button Icon')}
        value={t(submitLabel ?? 'None')}
        description={t('Button Icon')}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: t('Button Icon'),
            mobileOpen: true,
            children: <Icon id={submitIcon.id} />
          })
        }}
      />
    </>
  )
}
