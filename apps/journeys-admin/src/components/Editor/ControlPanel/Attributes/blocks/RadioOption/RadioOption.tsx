import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { Attribute } from '../..'
import { GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock } from '../../../../../../../__generated__/GetJourney'
import { Action, actions } from '../../Action/Action'

export function RadioOption({
  id,
  action
}: TreeBlock<RadioOptionBlock>): ReactElement {
  const { dispatch } = useEditor()

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      id: `${id}-radio-option-action`
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
