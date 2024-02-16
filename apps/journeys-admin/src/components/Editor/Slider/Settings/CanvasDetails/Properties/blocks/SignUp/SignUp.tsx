import { ReactElement, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import InformationCircleContained from '@core/shared/ui/icons/InformationCircleContained'
import LinkIcon from '@core/shared/ui/icons/Link'

import { BlockFields_SignUpBlock as SignUpBlock } from '../../../../../../../../../__generated__/BlockFields'
import { IconFields } from '../../../../../../../../../__generated__/IconFields'
import { Accordion } from '../../Accordion'
import { Action, actions } from '../../variants/Action/Action'
import { Icon, icons } from '../../variants/Icon'

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
  const { t } = useTranslation('apps-journeys-admin')

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: `${id}-signup-action`
    })
  }, [dispatch, id])

  return (
    <>
      <Accordion
        id={`${id}-signup-action`}
        icon={<LinkIcon />}
        name={t('Action')}
        value={
          actions.find((act) => act.value === action?.__typename)?.label ??
          'None'
        }
      >
        <Action />
      </Accordion>

      <Accordion
        id={`${id}-signup-icon`}
        icon={<InformationCircleContained />}
        name={t('Button Icon')}
        value={
          icons.find(({ value }) => value === submitIcon?.iconName)?.label ??
          'None'
        }
      >
        <Icon id={submitIcon.id} />
      </Accordion>
    </>
  )
}
