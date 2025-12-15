import Skeleton from '@mui/material/Skeleton'
import { ReactElement } from 'react'

import { isJourneyCustomizable } from '../../../../libs/isJourneyCustomizable'
import { useJourney } from '../../../../libs/JourneyProvider'
import { CreateJourneyButton } from '../../CreateJourneyButton'
import { UseThisTemplateButton } from '../../UseThisTemplateButton'

interface TemplateActionButtonProps {
  signedIn?: boolean
  openTeamDialogOnSignIn?: boolean
}

export function TemplateActionButton({
  signedIn,
  openTeamDialogOnSignIn = false
}: TemplateActionButtonProps): ReactElement {
  const { journey } = useJourney()

  if (journey != null && isJourneyCustomizable(journey)) {
    return <UseThisTemplateButton signedIn={signedIn} />
  }

  if (journey == null) {
    return (
      <Skeleton
        sx={{ minWidth: 180, height: '38px', borderRadius: 3 }}
        data-testid="UseThisTemplateButtonSkeleton"
      />
    )
  }

  return (
    <CreateJourneyButton
      signedIn={signedIn}
      openTeamDialogOnSignIn={openTeamDialogOnSignIn}
    />
  )
}
