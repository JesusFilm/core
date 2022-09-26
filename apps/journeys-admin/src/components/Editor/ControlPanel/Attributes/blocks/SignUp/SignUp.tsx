import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ReactElement, useEffect } from 'react'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Attribute } from '../..'
import { GetJourney_journey_blocks_SignUpBlock as SignUpBlock } from '../../../../../../../__generated__/GetJourney'
import { IconFields } from '../../../../../../../__generated__/IconFields'
import { Icon, icons } from '../../Icon'
import { Action, actions } from '../../Action/Action'

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
            title: 'Form Submission',
            mobileOpen: true,
            children: <Action />
          })
        }}
      />

      <Attribute
        id={`${id}-signup-icon`}
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
