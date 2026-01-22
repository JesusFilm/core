import Skeleton from '@mui/material/Skeleton'
import { ReactElement } from 'react'

import { isJourneyCustomizable } from '../../../../libs/isJourneyCustomizable'
import { useJourney } from '../../../../libs/JourneyProvider'
import { CreateJourneyButton } from '../../CreateJourneyButton'
import { UseThisTemplateButton } from '../../UseThisTemplateButton'
import { GetAdminJourneys_journeys as Journey } from '../../../../../../../../apps/journeys-admin/__generated__/GetAdminJourneys'
import { JourneyFields } from '../../../../libs/JourneyProvider/__generated__/JourneyFields'

interface TemplateActionButtonProps {
  variant?: 'menu-item' | 'button'
  signedIn?: boolean
  openTeamDialogOnSignIn?: boolean
  handleCloseMenu?: () => void
  journey?: Journey
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

  if (journeyData != null && isJourneyCustomizable(journeyData as JourneyFields)) {
    return <UseThisTemplateButton variant={variant} signedIn={signedIn} journey={journeyData as Journey} />
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
      journey={journeyData as Journey}
      handleCloseMenu={handleCloseMenu}
      refetchTemplateStats={refetchTemplateStats}
    />
  )
}
