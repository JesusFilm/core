import { SxProps, Theme } from '@mui/material/styles'
import { TFunction } from 'next-i18next'
import { ReactNode } from 'react'

import BibleIcon from '@core/shared/ui/icons/Bible'
import EmailIcon from '@core/shared/ui/icons/Email'
import LinkAngledIcon from '@core/shared/ui/icons/LinkAngled'
import MessageChat1Icon from '@core/shared/ui/icons/MessageChat1'

import { GoalType } from '../../components/Button/utils/getLinkActionGoal'

interface GoalDetails {
  label: string
  icon: ReactNode
}

export function getGoalDetails(
  goalType: GoalType,
  t: TFunction,
  customIconStyle?: SxProps<Theme>
): GoalDetails {
  const defaultIconStyle = {
    color: 'secondary.light'
  }
  const iconStyle = customIconStyle != null ? customIconStyle : defaultIconStyle

  switch (goalType) {
    case GoalType.Chat:
      return {
        label: t('Start a Conversation'),
        icon: <MessageChat1Icon sx={iconStyle} />
      }
    case GoalType.Bible:
      return {
        label: t('Link to Bible'),
        icon: <BibleIcon sx={iconStyle} />
      }
    case GoalType.Email:
      return {
        label: t('Send an Email'),
        icon: <EmailIcon sx={iconStyle} />
      }
    case GoalType.Website:
    default:
      return {
        label: t('Visit a Website'),
        icon: <LinkAngledIcon sx={iconStyle} />
      }
  }
}
