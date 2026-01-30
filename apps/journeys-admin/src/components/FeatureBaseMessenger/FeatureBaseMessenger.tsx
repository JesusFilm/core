import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'

import { FeatureBaseUserInfo } from '@core/journeys/ui/messengerHooks'

import { MessengerInit } from './MessengerInit'

interface FeatureBaseMessengerProps {
  userInfo?: FeatureBaseUserInfo
}

export function FeatureBaseMessenger({
  userInfo
}: FeatureBaseMessengerProps): ReactElement {
  const router = useRouter()
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      <MessengerInit
        userInfo={userInfo}
        loaded={loaded}
        setLoaded={setLoaded}
      />
    </>
  )
}
