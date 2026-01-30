import { ReactElement, useState } from 'react'

import { FeedbackInit } from './FeedbackInit'

interface FeatureBaseFeedbackProps {
  userEmail?: string
  userName?: string
}

export function FeatureBaseFeedback({
  userEmail,
  userName
}: FeatureBaseFeedbackProps): ReactElement {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      <FeedbackInit
        userEmail={userEmail}
        userName={userName}
        loaded={loaded}
        setLoaded={setLoaded}
      />
    </>
  )
}
