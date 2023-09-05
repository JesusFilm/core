import Crop169RoundedIcon from '@mui/icons-material/Crop169Rounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import Divider from '@mui/material/Divider'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'

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
  const { dispatch } = useEditor()
  const submitIcon = children.find(
    (block) => block.id === submitIconId
  ) as TreeBlock<IconFields>

  return (
    <>
      <Attribute
        id={`${id}-text-field-options`}
        icon={<Crop169RoundedIcon />}
        name="Feedback"
        value={label}
        description="Feedback Properties"
        onClick={(): void =>
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Feedback Properties',
            mobileOpen: true,
            children: <TextResponseFields />
          })
        }
      />

      <Divider orientation="vertical" variant="middle" flexItem />

      <Attribute
        id={`${id}-text-field-action`}
        icon={<LinkRoundedIcon />}
        name="Action"
        value={
          actions.find((act) => act.value === action?.__typename)?.label ??
          'None'
        }
        description="Form Submission"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Action',
            mobileOpen: true,
            children: <Action />
          })
        }}
      />

      <Attribute
        id={`${id}-text-field-icon`}
        icon={<InfoOutlinedIcon />}
        name="Button Icon"
        value={
          icons.find(({ value }) => value === submitIcon?.iconName)?.label ??
          'None'
        }
        description="Button Icon"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Button Icon',
            mobileOpen: true,
            children: <Icon id={submitIcon.id} />
          })
        }}
      />
    </>
  )
}
