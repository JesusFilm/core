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
  const ENGLISH_LANGUAGE_ID = '529'

  parentTags?.forEach((tag) => {
    const name = tag.name.find(
      (name) => name.language.id === ENGLISH_LANGUAGE_ID
    )?.value

    switch (name) {
      case 'Topics':
        parentTagsWithIcons.push({
          id: tag.id,
          name: tag.name[0].value,
          icon: <Hash2Icon />
        })
        break
      case 'Felt Needs':
        parentTagsWithIcons.push({
          id: tag.id,
          name: tag.name[0].value,
          icon: <SmileyNeutralIcon />
        })
        break
      case 'Holidays':
        parentTagsWithIcons.push({
          id: tag.id,
          name: tag.name[0].value,
          icon: <Calendar4Icon />
        })
        break
      case 'Audience':
        parentTagsWithIcons.push({
          id: tag.id,
          name: tag.name[0].value,
          icon: <UsersProfiles2Icon />
        })
        break
      case 'Genre':
        parentTagsWithIcons.push({
          id: tag.id,
          name: tag.name[0].value,
          icon: <MediaStrip1Icon />
        })
        break
      case 'Collections':
        parentTagsWithIcons.push({
          id: tag.id,
          name: tag.name[0].value,
          icon: <Grid1Icon />
        })
        break
    }
  })

  return parentTagsWithIcons
}
