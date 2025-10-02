import Skeleton from '@mui/material/Skeleton'
import { ReactElement } from 'react'

import { useJourney } from '../../../../libs/JourneyProvider'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { UseThisTemplateButton } from '../../UseThisTemplateButton'
import { CreateJourneyButton } from '../../CreateJourneyButton'
import { isJourneyCustomizable } from '../../../../libs/isJourneyCustomizable'

interface TemplateActionButtonProps {
  signedIn?: boolean
  displayOpenTeamDialog?: boolean
}

export function TemplateActionButton({
  signedIn,
  displayOpenTeamDialog = true
}: TemplateActionButtonProps): ReactElement {
  const { journey } = useJourney()
  const { journeyCustomization } = useFlags()

  if (
    journeyCustomization &&
    journey != null &&
    isJourneyCustomizable(journey)
  ) {
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

  return <CreateJourneyButton signedIn={signedIn} displayOpenTeamDialog={displayOpenTeamDialog} />
}
