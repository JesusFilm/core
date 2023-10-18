import { ReactNode } from 'react'

import Calendar4Icon from '@core/shared/ui/icons/Calendar4'
import Grid1Icon from '@core/shared/ui/icons/Grid1'
import Hash2Icon from '@core/shared/ui/icons/Hash2'
import MediaStrip1Icon from '@core/shared/ui/icons/MediaStrip1'
import SmileyNeutralIcon from '@core/shared/ui/icons/SmileyNeutral'
import TagIcon from '@core/shared/ui/icons/Tag'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

export function getParentIcon(name?: string): ReactNode {
  switch (name) {
    case 'Topics':
      return <Hash2Icon />

    case 'Felt Needs':
      return <SmileyNeutralIcon />

    case 'Holidays':
      return <Calendar4Icon />

    case 'Audience':
      return <UsersProfiles2Icon />

    case 'Genre':
      return <MediaStrip1Icon />

    case 'Collections':
      return <Grid1Icon />
    default:
      return <TagIcon />
  }
}
