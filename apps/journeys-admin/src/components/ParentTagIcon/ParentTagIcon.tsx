import { SxProps } from '@mui/material/styles'
import { ReactElement } from 'react'

import Calendar4Icon from '@core/shared/ui/icons/Calendar4'
import Grid1Icon from '@core/shared/ui/icons/Grid1'
import Hash2Icon from '@core/shared/ui/icons/Hash2'
import MediaStrip1Icon from '@core/shared/ui/icons/MediaStrip1'
import SmileyNeutralIcon from '@core/shared/ui/icons/SmileyNeutral'
import TagIcon from '@core/shared/ui/icons/Tag'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

interface ParentTagIconProps {
  name?: string
  sx?: SxProps
}

export function ParentTagIcon({ name, sx }: ParentTagIconProps): ReactElement {
  switch (name) {
    case 'Topics':
      return <Hash2Icon sx={{ ...sx }} />
    case 'Felt Needs':
      return <SmileyNeutralIcon sx={{ ...sx }} />
    case 'Holidays':
      return <Calendar4Icon sx={{ ...sx }} />
    case 'Audience':
      return <UsersProfiles2Icon sx={{ ...sx }} />
    case 'Genre':
      return <MediaStrip1Icon sx={{ ...sx }} />
    case 'Collections':
      return <Grid1Icon sx={{ ...sx }} />
    default:
      return <TagIcon sx={{ ...sx }} />
  }
}
