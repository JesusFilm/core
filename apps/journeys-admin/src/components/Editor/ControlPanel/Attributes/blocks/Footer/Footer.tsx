import { useEditor } from '@core/journeys/ui/EditorProvider'
import Lock from '@mui/icons-material/Lock'
import { ReactElement, useEffect } from 'react'

import { Attribute } from '../..'

export function Footer(): ReactElement {
  const { dispatch } = useEditor()

  // TODO:
  // Get host name from journey.hostId
  // Get description from final design
  // Get new icon
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
      icon={<Lock />}
      name="Hosted by"
      value="None"
      description="Description"
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
