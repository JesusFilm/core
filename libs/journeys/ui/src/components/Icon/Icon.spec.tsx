import { render } from '@testing-library/react'

import {
  IconColor,
  IconName,
  IconSize,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import type { TreeBlock } from '../../libs/block'
import { JourneyProvider } from '../../libs/JourneyProvider'
import {
  JourneyFields as Journey,
  JourneyFields_language as Language
} from '../../libs/JourneyProvider/__generated__/JourneyFields'

import { IconFields } from './__generated__/IconFields'

import { Icon } from '.'

const block: TreeBlock<IconFields> = {
  id: 'id',
  __typename: 'IconBlock',
  parentBlockId: 'parent',
  parentOrder: 0,
  iconName: IconName.ArrowForwardRounded,
  iconColor: IconColor.error,
  iconSize: IconSize.md,
  children: []
}

describe('Icon', () => {
  it('should render the icon successfully', () => {
    const { getByTestId } = render(<Icon {...block} />)
    expect(getByTestId('ArrowForwardRoundedIcon')).toHaveClass(
      'MuiSvgIcon-root'
    )
  })

  it('should render nothing', () => {
    const { getByTestId } = render(<Icon {...block} iconName={null} />)
    expect(getByTestId('None')).toBeInTheDocument()
  })

  it('should render small icon', () => {
    const { getByTestId } = render(<Icon {...block} iconSize={IconSize.sm} />)
    expect(getByTestId('ArrowForwardRoundedIcon')).toHaveStyle(
      'font-size: 16px'
    )
  })

  it('should render medium icon', () => {
    const { getByTestId } = render(<Icon {...block} iconSize={IconSize.md} />)
    expect(getByTestId('ArrowForwardRoundedIcon')).toHaveStyle(
      'font-size: 20px'
    )
  })

  it('should render large icon', () => {
    const { getByTestId } = render(<Icon {...block} iconSize={IconSize.lg} />)
    expect(getByTestId('ArrowForwardRoundedIcon')).toHaveStyle(
      'font-size: 28px'
    )
  })

  it('should render extra large icon', () => {
    const { getByTestId } = render(<Icon {...block} iconSize={IconSize.xl} />)
    expect(getByTestId('ArrowForwardRoundedIcon')).toHaveStyle(
      'font-size: 48px'
    )
  })

  describe('Icon remapping', () => {
    it('should render remapped Stratis icons for legacy enum values', () => {
      const remappedIcons = [
        { iconName: IconName.MenuBookRounded, expectedComponent: 'BibleIcon' },
        {
          iconName: IconName.ChatBubbleOutlineRounded,
          expectedComponent: 'MessageSquareIcon'
        },
        {
          iconName: IconName.FormatQuoteRounded,
          expectedComponent: 'MessageText2Icon'
        },
        {
          iconName: IconName.CheckCircleRounded,
          expectedComponent: 'CheckContainedIcon'
        },
        {
          iconName: IconName.ContactSupportRounded,
          expectedComponent: 'HelpCircleContainedIcon'
        },
        { iconName: IconName.Launch, expectedComponent: 'LinkExternalIcon' },
        { iconName: IconName.MailOutline, expectedComponent: 'Mail1Icon' },
        { iconName: IconName.PlayArrowRounded, expectedComponent: 'Play3Icon' },
        { iconName: IconName.SendRounded, expectedComponent: 'Send2Icon' },
        {
          iconName: IconName.SubscriptionsRounded,
          expectedComponent: 'Play1Icon'
        },
        {
          iconName: IconName.TranslateRounded,
          expectedComponent: 'Globe1Icon'
        },
        { iconName: IconName.BeenhereRounded, expectedComponent: 'Marker2Icon' }
      ]

      remappedIcons.forEach(({ iconName, expectedComponent }) => {
        const { getByTestId } = render(<Icon {...block} iconName={iconName} />)
        expect(getByTestId(expectedComponent)).toBeInTheDocument()
      })
    })
  })

  describe('RTL', () => {
    const rtlLanguage: Language = {
      __typename: 'Language',
      id: '529',
      bcp47: 'ar',
      iso3: 'arb',
      name: [
        {
          __typename: 'LanguageName',
          value: 'Arabic',
          primary: false
        }
      ]
    }

    const rtlJourney: Journey = {
      __typename: 'Journey',
      id: 'journeyId',
      themeName: ThemeName.base,
      themeMode: ThemeMode.light,
      language: rtlLanguage
    } as Journey

    const renderWithRTL = (iconName: IconName) => {
      return render(
        <JourneyProvider value={{ journey: rtlJourney }}>
          <Icon {...block} iconName={iconName} />
        </JourneyProvider>
      )
    }

    it('should flip icons that should be flipped in RTL', () => {
      const iconsToFlip = [
        { iconName: IconName.MenuBookRounded, testId: 'BibleIcon' },
        {
          iconName: IconName.ChatBubbleOutlineRounded,
          testId: 'MessageSquareIcon'
        },
        { iconName: IconName.FormatQuoteRounded, testId: 'MessageText2Icon' },
        { iconName: IconName.MessageChat1, testId: 'MessageChat1Icon' },
        { iconName: IconName.Launch, testId: 'LinkExternalIcon' },
        { iconName: IconName.SendRounded, testId: 'Send2Icon' }
      ]

      iconsToFlip.forEach(({ iconName, testId }) => {
        const { getByTestId } = renderWithRTL(iconName)
        expect(getByTestId(testId)).toHaveStyle('transform: scaleX(-1)')
      })
    })

    it('should not flip icons that should not be flipped in RTL', () => {
      const iconsNotToFlip = [
        {
          iconName: IconName.ArrowForwardRounded,
          testId: 'ArrowForwardRoundedIcon'
        },
        { iconName: IconName.CheckCircleRounded, testId: 'CheckContainedIcon' },
        { iconName: IconName.Home4, testId: 'Home4Icon' }
      ]

      iconsNotToFlip.forEach(({ iconName, testId }) => {
        const { getByTestId } = renderWithRTL(iconName)
        expect(getByTestId(testId)).not.toHaveStyle('transform: scaleX(-1)')
      })
    })
  })
})
