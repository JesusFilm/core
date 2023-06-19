import { ReactElement, useEffect } from 'react'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import UserProfileCircleIcon from '@core/shared/ui/icons/UserProfileCircle'
import MessageChat1 from '@core/shared/ui/icons/MessageChat1'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { capitalize } from 'lodash'
import { useTranslation } from 'react-i18next'
import { Attribute } from '../..'

export function Footer(): ReactElement {
  const { dispatch } = useEditor()
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')
  const hostName = journey?.host?.title ?? t('None')

  const platforms = (journey?.chatButtons ?? [])
    .map((button) => capitalize(button.platform ?? 'custom'))
    .filter(Boolean)
    .join(' and ')

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
    <>
      <Attribute
        id="hosted-by"
        icon={<UserProfileCircleIcon />}
        name={t('Hosted by')}
        value={hostName as string}
        description={t("Host's name")}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Hosted By',
            mobileOpen: true,
            children: <div>Hosted by content component</div>
          })
        }}
      />
      <Attribute
        id="chat-widget"
        icon={<MessageChat1 />}
        name={t('Chat Widget')}
        value={t(platforms ?? 'None')}
        description={t('Chat Platform')}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Chat Widget',
            mobileOpen: true,
            children: <div>Chat Widget Component</div>
          })
        }}
      />
    </>
  )
}
