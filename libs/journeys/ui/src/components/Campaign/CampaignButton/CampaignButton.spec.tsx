import { ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen } from '@testing-library/react'
import { ReactNode } from 'react'

import {
  ButtonSize,
  ButtonVariant,
  CampaignPageKind,
  TypographyAlign
} from '../../../../__generated__/globalTypes'
import { CampaignProvider } from '../CampaignProvider'
import { CampaignSectionContext } from '../CampaignSectionBand'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import { contrastText, resolveBand } from '../libs/resolveBand'
import { campaignPublic, landingBlocks } from '../testData'
import type { CampaignBlockOf } from '../types'

import { CampaignButton } from './CampaignButton'

const theme = createCampaignTheme(campaignPublic.theme, false)
const heroButton = landingBlocks.find(
  (block) => block.id === 'heroButtonId'
) as CampaignBlockOf<'CampaignButtonBlock'>

const noneBand = resolveBand({ backgroundKind: 'none' }, campaignPublic.theme)
const overriddenBand = resolveBand(
  {
    backgroundKind: 'none',
    buttonColor: '#112233',
    buttonTextColor: '#EEEEEE'
  },
  campaignPublic.theme
)

function renderButton(
  ui: ReactNode,
  {
    band = noneBand,
    align = null as TypographyAlign | null,
    pageKind = CampaignPageKind.landing,
    section = true
  } = {}
) {
  return render(
    <ThemeProvider theme={theme}>
      <CampaignProvider
        value={{ campaign: campaignPublic, pageKind, region: null }}
      >
        {section ? (
          <CampaignSectionContext.Provider value={{ band, align }}>
            {ui}
          </CampaignSectionContext.Provider>
        ) : (
          ui
        )}
      </CampaignProvider>
    </ThemeProvider>
  )
}

describe('CampaignButton', () => {
  it('defaults variant to contained and size to medium', () => {
    renderButton(
      <CampaignButton
        block={{ ...heroButton, buttonVariant: null, size: null }}
      />
    )
    const button = screen.getByTestId('CampaignButton')
    expect(button).toHaveClass('MuiButton-contained')
    expect(button).toHaveClass('MuiButton-sizeMedium')
  })

  it('honours an explicit variant and size', () => {
    renderButton(
      <CampaignButton
        block={{
          ...heroButton,
          buttonVariant: ButtonVariant.outlined,
          size: ButtonSize.small
        }}
      />
    )
    const button = screen.getByTestId('CampaignButton')
    expect(button).toHaveClass('MuiButton-outlined')
    expect(button).toHaveClass('MuiButton-sizeSmall')
  })

  it('follows the section alignment when align is null', () => {
    renderButton(<CampaignButton block={{ ...heroButton, align: null }} />, {
      align: TypographyAlign.center
    })
    expect(screen.getByTestId('CampaignButton').parentElement).toHaveStyle({
      justifyContent: 'center'
    })
  })

  it('uses its own alignment over the section', () => {
    renderButton(
      <CampaignButton
        block={{ ...heroButton, align: TypographyAlign.right }}
      />,
      {
        align: TypographyAlign.center
      }
    )
    expect(screen.getByTestId('CampaignButton').parentElement).toHaveStyle({
      justifyContent: 'flex-end'
    })
  })

  it('color null ⇒ theme primary with on-primary label when the section has no override', () => {
    renderButton(
      <CampaignButton
        block={{ ...heroButton, color: null, labelColor: null }}
      />
    )
    expect(screen.getByTestId('CampaignButton')).toHaveStyle({
      backgroundColor: '#C52D3A',
      color: contrastText('#C52D3A')
    })
  })

  it('color null ⇒ the section buttonColor and buttonTextColor overrides', () => {
    renderButton(
      <CampaignButton
        block={{ ...heroButton, color: null, labelColor: null }}
      />,
      {
        band: overriddenBand
      }
    )
    expect(screen.getByTestId('CampaignButton')).toHaveStyle({
      backgroundColor: '#112233',
      color: '#EEEEEE'
    })
  })

  it('its own hex colours win over the section and the theme', () => {
    renderButton(
      <CampaignButton
        block={{ ...heroButton, color: '#010203', labelColor: '#FAFBFC' }}
      />,
      { band: overriddenBand }
    )
    expect(screen.getByTestId('CampaignButton')).toHaveStyle({
      backgroundColor: '#010203',
      color: '#FAFBFC'
    })
  })

  it('renders a ScrollToBlockAction as a same-page link to #<blockId> that scrolls smoothly', () => {
    renderButton(
      <>
        <section id="landingSwitcherId" />
        <CampaignButton block={heroButton} />
      </>
    )
    const link = screen.getByRole('link', { name: 'Choose your region' })
    expect(link).toHaveAttribute('href', '#landingSwitcherId')

    const target = document.getElementById('landingSwitcherId') as HTMLElement
    target.scrollIntoView = vi.fn()
    fireEvent.click(link)
    expect(target.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    })
  })

  it('renders a missing scroll target static: same look, no href, aria-disabled, no pointer effect', () => {
    renderButton(<CampaignButton block={heroButton} />, {
      pageKind: CampaignPageKind.regionTemplate
    })
    const button = screen.getByTestId('CampaignButton')
    expect(button).toHaveTextContent('Choose your region')
    expect(button).not.toHaveAttribute('href')
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).toHaveClass('MuiButton-contained')
    expect(button).toHaveStyle({ pointerEvents: 'none' })
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders a NavigateToRegionAction as a relative link to the region page carrying the lang param', () => {
    const navigate = landingBlocks.find(
      (block) => block.id === 'switcherEuropeButtonId'
    ) as CampaignBlockOf<'CampaignButtonBlock'>
    renderButton(<CampaignButton block={navigate} />)
    expect(
      screen.getByRole('link', { name: 'Start with Europe' })
    ).toHaveAttribute('href', '/campaign/christmas-2026/eur?lang=en')
  })

  it.each([
    ['regionId null (region deleted)', null],
    ['a region no longer in the payload', 'deletedRegionId']
  ])(
    'renders a NavigateToRegionAction static with %s: aria-disabled and no href',
    (_label, regionId) => {
      const navigate = landingBlocks.find(
        (block) => block.id === 'switcherEuropeButtonId'
      ) as CampaignBlockOf<'CampaignButtonBlock'>
      renderButton(
        <CampaignButton
          block={{
            ...navigate,
            action: {
              __typename: 'CampaignNavigateToRegionAction',
              parentBlockId: navigate.id,
              regionId
            }
          }}
        />
      )
      const button = screen.getByTestId('CampaignButton')
      expect(button).toHaveTextContent('Start with Europe')
      expect(button).toHaveAttribute('aria-disabled', 'true')
      expect(button).not.toHaveAttribute('href')
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    }
  )

  it('renders a LinkAction as an external link, opening a new tab safely when asked', () => {
    renderButton(
      <CampaignButton
        block={{
          ...heroButton,
          action: {
            __typename: 'CampaignLinkAction',
            parentBlockId: heroButton.id,
            url: 'https://example.com/',
            target: '_blank'
          }
        }}
      />
    )
    const link = screen.getByRole('link', { name: 'Choose your region' })
    expect(link).toHaveAttribute('href', 'https://example.com/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders a button with no action static', () => {
    renderButton(<CampaignButton block={{ ...heroButton, action: null }} />)
    expect(screen.getByTestId('CampaignButton')).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })

  it('renders nothing for an empty label', () => {
    const { container } = renderButton(
      <CampaignButton block={{ ...heroButton, label: '' }} />
    )
    expect(container).toBeEmptyDOMElement()
  })
})
