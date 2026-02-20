import Skeleton from '@mui/material/Skeleton'
import { ReactElement } from 'react'

import { useFlags } from '@core/shared/ui/FlagsProvider'

import { isJourneyCustomizable } from '../../../../libs/isJourneyCustomizable'
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
  handleCloseMenu?: () => void
  journey?: JourneyForTemplate
  refetchTemplateStats?: (templateIds: string[]) => Promise<void>
}

export function TemplateActionButton({
  variant = 'button',
  signedIn,
  openTeamDialogOnSignIn = false,
  handleCloseMenu,
  journey,
  refetchTemplateStats
}: TemplateActionButtonProps): ReactElement {
  const { journey: journeyFromContext } = useJourney()
  const journeyData = journey ?? journeyFromContext
  const { customizableMedia } = useFlags()

  if (journeyData != null && isJourneyCustomizable(journeyData, customizableMedia)) {
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
      handleCloseMenu={handleCloseMenu}
      refetchTemplateStats={refetchTemplateStats}
    />
  )
}
