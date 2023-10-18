import Calendar4Icon from '@core/shared/ui/icons/Calendar4'
import Grid1Icon from '@core/shared/ui/icons/Grid1'
import Hash2Icon from '@core/shared/ui/icons/Hash2'
import MediaStrip1Icon from '@core/shared/ui/icons/MediaStrip1'
import SmileyNeutralIcon from '@core/shared/ui/icons/SmileyNeutral'
import TagIcon from '@core/shared/ui/icons/Tag'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

import { getParentIcon } from '.'

describe('getParentTagsWithIcon', () => {
  it('should get Topics icon', () => {
    expect(getParentIcon('Topics')).toEqual(<Hash2Icon />)
  })

  it('should get Felt Needs icon', () => {
    expect(getParentIcon('Felt Needs')).toEqual(<SmileyNeutralIcon />)
  })

  it('should get Holidays icon', () => {
    expect(getParentIcon('Holidays')).toEqual(<Calendar4Icon />)
  })

  it('should get Audience icon', () => {
    expect(getParentIcon('Audience')).toEqual(<UsersProfiles2Icon />)
  })

  it('should get Genre icon', () => {
    expect(getParentIcon('Genre')).toEqual(<MediaStrip1Icon />)
  })

  it('should get Collections icon', () => {
    expect(getParentIcon('Collections')).toEqual(<Grid1Icon />)
  })

  it('should return default icon', () => {
    expect(getParentIcon()).toEqual(<TagIcon />)
  })
})
