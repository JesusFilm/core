import Skeleton from '@mui/material/Skeleton'
import { ReactElement } from 'react'

import { useJourney } from '../../../../libs/JourneyProvider'
import {
  CreateJourneyButton,
  JourneyForTemplate
} from '../../CreateJourneyButton'
import { UseThisTemplateButton } from '../../UseThisTemplateButton'

interface TemplateActionButtonProps {
  variant?: 'menu-item' | 'button'
  signedIn?: boolean
  openTeamDialogOnSignIn?: boolean
  onOpenTeamDialog?: () => void
  setHasOpenDialog?: (open: boolean) => void
  journey?: JourneyForTemplate
  refetchTemplateStats?: (templateIds: string[]) => Promise<void>
}

export function TemplateActionButton({
  variant = 'button',
  signedIn,
  openTeamDialogOnSignIn = false,
  onOpenTeamDialog,
  setHasOpenDialog,
  journey,
  refetchTemplateStats
}: TemplateActionButtonProps): ReactElement {
  const { journey: journeyFromContext } = useJourney()
  const journeyData = journey ?? journeyFromContext

  if (journeyData != null && journeyData.customizable === true) {
    return (
      <UseThisTemplateButton
        variant={variant}
        signedIn={signedIn}
        journeyId={journeyData?.id}
      />
    )
  }

  if (journeyData == null && variant === 'button') {
    return (
      <Skeleton
        sx={{ minWidth: 180, height: '38px', borderRadius: 3 }}
        data-testid="UseThisTemplateButtonSkeleton"
      />
    )
  }

  return (
    <CreateJourneyButton
      variant={variant}
      signedIn={signedIn}
      openTeamDialogOnSignIn={openTeamDialogOnSignIn}
      journeyData={journeyData}
      onOpenTeamDialog={onOpenTeamDialog}
      setHasOpenDialog={setHasOpenDialog}
      refetchTemplateStats={refetchTemplateStats}
    />
  )
}
