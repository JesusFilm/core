import Divider from '@mui/material/Divider'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'
import LinkIcon from '@core/shared/ui/icons/Link'
import TextInput1Icon from '@core/shared/ui/icons/TextInput1'

import { GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock } from '../../../../../../../__generated__/GetJourney'
import { IconFields } from '../../../../../../../__generated__/IconFields'
import { Action, actions } from '../../Action/Action'
import { Attribute } from '../../Attribute'
import { Icon, icons } from '../../Icon'

import { TextResponseFields } from './TextResponseFields'

export function TextResponse({
  id,
  children,
  action,
  submitIconId,
  label
}: TreeBlock<TextResponseBlock>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { dispatch } = useEditor()
  const selectedAction = actions.find((act) => act.value === action?.__typename)
  const submitIcon = children.find(
    (block) => block.id === submitIconId
  ) as TreeBlock<IconFields>
  const submitLabel = icons.find(
    ({ value }) => value === submitIcon?.iconName
  )?.label

  return (
    <>
      <Attribute
        id={`${id}-text-field-options`}
        icon={<TextInput1Icon />}
        name={t('Feedback')}
        value={t(label)}
        description={t('Feedback Properties')}
        onClick={(): void =>
          dispatch({
            type: 'SetDrawerPropsAction',
            title: t('Feedback Properties'),
            mobileOpen: true,
            children: <TextResponseFields />
          })
        }
      />

      <Divider orientation="vertical" variant="middle" flexItem />

      <Attribute
        id={`${id}-text-field-action`}
        icon={<LinkIcon />}
        name={t('Action')}
        value={t(selectedAction?.label ?? 'None')}
        description={t('Form Submission')}
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
        id={`${id}-text-field-icon`}
        icon={<InformationCircleContainedIcon />}
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
