import { ReactElement } from 'react'
import { TreeBlock, useEditor } from '@core/journeys/ui'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import { GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock } from '../../../../../../../__generated__/GetJourney'
import { Attribute } from '../..'
import { Action, actions } from '../../Action/Action'

export function RadioOption({
  id,
  action
}: TreeBlock<RadioOptionBlock>): ReactElement {
  const { dispatch } = useEditor()

  return (
    <>
      <Attribute
        id={`${id}-radio-option-action`}
        icon={<LinkRoundedIcon />}
        name="Action"
        value={
          actions.find((act) => act.value === action?.__typename)?.label ??
          'None'
        }
        description="Action"
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Action',
            mobileOpen: true,
            children: <Action />
          })
        }}
      />
    </>
  )
}
