import { ReactElement, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { dispatch } = useEditor()
  const submitIcon = children.find(
    (block) => block.id === submitIconId
  ) as TreeBlock<IconFields>
  const { t } = useTranslation()

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      id: `${id}-signup-action`
    })
    dispatch({
      type: 'SetDrawerPropsAction',
      title: 'Form Submission',
      children: <Action />
    })
  }, [dispatch, id])

  return (
    <>
      <Attribute
        id={`${id}-signup-action`}
        icon={<LinkIcon />}
        name={t('Action')}
        value={
          actions.find((act) => act.value === action?.__typename)?.label ??
          'None'
        }
        description={t('Form Submission')}
        drawerTitle={t('Form Submission')}
      >
        <Action />
      </Attribute>

      <Attribute
        id={`${id}-signup-icon`}
        icon={<InformationCircleContained />}
        name={t('Button Icon')}
        value={
          icons.find(({ value }) => value === submitIcon?.iconName)?.label ??
          'None'
        }
        description={t('Button Icon')}
        drawerTitle={t('Button Icon')}
      >
        <Icon id={submitIcon.id} />
      </Attribute>
    </>
  )
}
