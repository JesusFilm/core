import VisibilityIcon from '@mui/icons-material/Visibility'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../__generated__/JourneyFields'
import { MenuItem } from '../../MenuItem'

interface Props {
  journey: Journey
  onClose: () => void
}

export function PreviewMenuItem({
  journey,
  onClose: handleCloseMenu
}: Props): ReactElement {
  return (
    <NextLink href={`/api/preview?slug=${journey.slug}`} passHref>
      <MenuItem
        label="Preview"
        icon={<VisibilityIcon />}
        disabled={journey.status === JourneyStatus.draft}
        openInNew
        onClick={handleCloseMenu}
      />
    </NextLink>
  )
}
