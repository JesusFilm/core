import Calendar4Icon from '@core/shared/ui/icons/Calendar4'
import Grid1Icon from '@core/shared/ui/icons/Grid1'
import Hash2Icon from '@core/shared/ui/icons/Hash2'
import MediaStrip1Icon from '@core/shared/ui/icons/MediaStrip1'
import SmileyNeutralIcon from '@core/shared/ui/icons/SmileyNeutral'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

import { parentTags } from '../data'

import { getParentTagsWithIcon } from '.'

describe('getParentTagsWithIcon', () => {
  it('should return parent tags wih icons', () => {
    expect(getParentTagsWithIcon(parentTags)).toEqual([
      {
        id: 'tags.topic.id',
        name: 'Topics',
        icon: <Hash2Icon />
      },
      {
        id: 'tags.feltNeeds.id',
        name: 'Felt Needs',
        icon: <SmileyNeutralIcon />
      },
      {
        id: 'tags.holidays.id',
        name: 'Holidays',
        icon: <Calendar4Icon />
      },
      {
        id: 'tags.audience.id',
        name: 'Audience',
        icon: <UsersProfiles2Icon />
      },
      {
        id: 'tags.genre.id',
        name: 'Genre',
        icon: <MediaStrip1Icon />
      },
      {
        id: 'tags.collections.id',
        name: 'Collections',
        icon: <Grid1Icon />
      }
    ])
  })
})
