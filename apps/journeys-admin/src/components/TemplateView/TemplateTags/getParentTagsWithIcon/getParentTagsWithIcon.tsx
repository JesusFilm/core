import { ReactNode } from 'react'

import Calendar4Icon from '@core/shared/ui/icons/Calendar4'
import Grid1Icon from '@core/shared/ui/icons/Grid1'
import Hash2Icon from '@core/shared/ui/icons/Hash2'
import MediaStrip1Icon from '@core/shared/ui/icons/MediaStrip1'
import SmileyNeutralIcon from '@core/shared/ui/icons/SmileyNeutral'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

import { GetTags_tags as Tag } from '../../../../../__generated__/GetTags'

export interface ParentTagWithIcon {
  id: string
  name: string
  icon: ReactNode
}

export function getParentTagsWithIcon(parentTags?: Tag[]): ParentTagWithIcon[] {
  const parentTagsWithIcons: ParentTagWithIcon[] = []

  parentTags?.forEach((tag) => {
    const name = tag.name.find((name) => name.language.id === '529')?.value

    if (name === 'Topics') {
      parentTagsWithIcons.push({
        id: tag.id,
        name: tag.name[0].value,
        icon: <Hash2Icon />
      })
    } else if (name === 'Felt Needs') {
      parentTagsWithIcons.push({
        id: tag.id,
        name: tag.name[0].value,
        icon: <SmileyNeutralIcon />
      })
    } else if (name === 'Holidays') {
      parentTagsWithIcons.push({
        id: tag.id,
        name: tag.name[0].value,
        icon: <Calendar4Icon />
      })
    } else if (name === 'Audience') {
      parentTagsWithIcons.push({
        id: tag.id,
        name: tag.name[0].value,
        icon: <UsersProfiles2Icon />
      })
    } else if (name === 'Genre') {
      parentTagsWithIcons.push({
        id: tag.id,
        name: tag.name[0].value,
        icon: <MediaStrip1Icon />
      })
    } else if (name === 'Collections') {
      parentTagsWithIcons.push({
        id: tag.id,
        name: tag.name[0].value,
        icon: <Grid1Icon />
      })
    }
  })

  return parentTagsWithIcons
}
