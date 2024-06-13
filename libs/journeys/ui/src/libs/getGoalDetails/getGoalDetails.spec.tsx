import { TFunction } from 'next-i18next'

import BibleIcon from '@core/shared/ui/icons/Bible'
import EmailIcon from '@core/shared/ui/icons/Email'
import LinkAngledIcon from '@core/shared/ui/icons/LinkAngled'
import MessageChat1Icon from '@core/shared/ui/icons/MessageChat1'

import { GoalType } from '../../components/Button/utils/getLinkActionGoal'

import { getGoalDetails } from '.'

describe('getGoalDetails', () => {
  const t = jest.fn((value: string): string => value) as unknown as TFunction

  it('should return website details by default', () => {
    const details = getGoalDetails(GoalType.Website, t)
    expect(details.label).toBe('Visit a Website')
    expect(details.icon).toEqual(
      <LinkAngledIcon sx={{ color: 'secondary.light' }} />
    )
  })

  it('should return chat details', () => {
    const details = getGoalDetails(GoalType.Chat, t)
    expect(details.label).toBe('Start a Conversation')
    expect(details.icon).toEqual(
      <MessageChat1Icon sx={{ color: 'secondary.light' }} />
    )
  })

  it('should return bible details', () => {
    const details = getGoalDetails(GoalType.Bible, t)
    expect(details.label).toBe('Link to Bible')
    expect(details.icon).toEqual(
      <BibleIcon sx={{ color: 'secondary.light' }} />
    )
  })

  it('should return email details', () => {
    const details = getGoalDetails(GoalType.Email, t)
    expect(details.label).toBe('Send an Email')
    expect(details.icon).toEqual(
      <EmailIcon sx={{ color: 'secondary.light' }} />
    )
  })

  it('should add custom styling', () => {
    const details = getGoalDetails(GoalType.Website, t, {
      color: 'primary.main'
    })
    expect(details.icon).toEqual(
      <LinkAngledIcon sx={{ color: 'primary.main' }} />
    )
  })
})
