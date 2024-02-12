import { useRouter } from 'next/router'
import { ReactElement, ReactNode } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'

import { setBeaconPageViewed } from '../../../../../libs/setBeaconPageViewed'
import { Accordion } from '../Accordion'

interface AttributeProps {
  id: string
  icon: ReactElement
  name: string
  value: string
  subtitle?: string
  description: string
  drawerTitle: string
  children: ReactNode
  testId?: string
  param?: string
}

export function Attribute({
  id,
  testId,
  drawerTitle,
  param,
  children,
  ...props
}: AttributeProps): ReactElement {
  const router = useRouter()
  const {
    state: { selectedAttributeId },
    dispatch
  } = useEditor()

  const handleClick = (): void => {
    dispatch({ type: 'SetSelectedAttributeIdAction', id })
    dispatch({
      type: 'SetDrawerPropsAction',
      title: drawerTitle,
      children,
      mobileOpen: true
    })
    if (param != null) {
      router.query.param = param
      void router.push(router)
      router.events.on('routeChangeComplete', () => {
        setBeaconPageViewed(param)
      })
    }
  }

  return (
    <Accordion
      {...props}
      expanded={id === selectedAttributeId}
      onClick={handleClick}
      testId={testId ?? 'Attribute'}
    >
      {children}
    </Accordion>
  )
}
