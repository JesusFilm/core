import Skeleton from '@mui/material/Skeleton'
import { ReactElement, useMemo } from 'react'

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
  openTeamDialogOnSignIn = false
}: TemplateActionButtonProps): ReactElement {
  const { journey } = useJourney()
  const customizable = useMemo(() => isJourneyCustomizable(journey), [journey])

  if (journey != null && customizable) {
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
