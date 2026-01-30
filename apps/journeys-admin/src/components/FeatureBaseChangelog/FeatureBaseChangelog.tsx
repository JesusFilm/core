import { ReactElement, useState } from 'react'

import { ChangelogInit } from './ChangelogInit'

interface FeatureBaseChangelogProps {
  userName?: string
}

export function FeatureBaseChangelog({
  userName
}: FeatureBaseChangelogProps): ReactElement {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      <ChangelogInit userName={userName} loaded={loaded} setLoaded={setLoaded} />
    </>
  )
}
