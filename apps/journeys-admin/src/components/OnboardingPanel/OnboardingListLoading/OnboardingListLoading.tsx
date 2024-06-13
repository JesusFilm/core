import { ReactElement } from 'react'

import { MediaListItem } from '../../MediaListItem'

export function OnboardingListLoading(): ReactElement {
  return (
    <>
      <MediaListItem loading />
      <MediaListItem loading />
      <MediaListItem loading />
    </>
  )
}
