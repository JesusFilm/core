import { ReactElement, useEffect } from 'react'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import UserProfileCircleIcon from '@core/shared/ui/icons/UserProfileCircle'

import { Attribute } from '../..'

export function Footer(): ReactElement {
  const { dispatch } = useEditor()

  // TODO:
  // Get host name from journey.hostId
  // Get description from final design
  // Use proper HostedBy content component

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      id: 'hosted-by'
    })
    dispatch({
      type: 'SetDrawerPropsAction',
      title: 'Hosted By',
      mobileOpen: true,
      children: <div>Hosted by content component</div>
    })
  }, [dispatch])

  return (
    <Attribute
      id="hosted-by"
      icon={<UserProfileCircleIcon />}
      name="Hosted by"
      value="None"
      description=""
      onClick={() => {
        dispatch({
          type: 'SetDrawerPropsAction',
          title: 'Hosted By',
          mobileOpen: true,
          children: <div>Hosted by content component</div>
        })
      }}
    />
  )
}
