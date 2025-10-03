import Skeleton from '@mui/material/Skeleton'
import { ReactElement } from 'react'

import { useJourney } from '../../../../libs/JourneyProvider'
import { UseThisTemplateButton } from '../../UseThisTemplateButton'
import { CreateJourneyButton } from '../../CreateJourneyButton'
import { isJourneyCustomizable } from '../../../../libs/isJourneyCustomizable'

interface TemplateActionButtonProps {
  signedIn?: boolean
  openTeamDialogOnSignIn?: boolean
}

export function TemplateActionButton({
  signedIn,
  openTeamDialogOnSignIn
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
