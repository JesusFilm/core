import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { GetAdminJourneys_journeys as Journey } from '../../../../../../__generated__/GetAdminJourneys'
import { UserTeamRole } from '../../../../../../__generated__/globalTypes'

import { RestrictEditingToggle } from './RestrictEditingToggle'

const localTemplate = {
  __typename: 'Journey',
  id: 'journey-1',
  title: 'Local template',
  description: null,
  template: true,
  team: { __typename: 'Team', id: 'team-1' },
  language: {
    __typename: 'Language',
    id: '529',
    name: [{ __typename: 'LanguageName', value: 'English', primary: true }]
  },
  website: null,
  customizable: null,
  restrictEditing: false
} as unknown as Journey

const globalTemplate = {
  ...localTemplate,
  team: { __typename: 'Team', id: 'jfp-team' }
} as unknown as Journey

const handleCloseMenu = jest.fn()

describe('RestrictEditingToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing for non-template journeys', () => {
    const journey = { ...localTemplate, template: false } as Journey
    const { container } = render(
      <MockedProvider>
        <SnackbarProvider>
          <RestrictEditingToggle
            journey={journey}
            teamRole={UserTeamRole.manager}
            handleCloseMenu={handleCloseMenu}
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing for global templates', () => {
    const { container } = render(
      <MockedProvider>
        <SnackbarProvider>
          <RestrictEditingToggle
            journey={globalTemplate}
            teamRole={UserTeamRole.manager}
            handleCloseMenu={handleCloseMenu}
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows enabled toggle for managers', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <RestrictEditingToggle
            journey={localTemplate}
            teamRole={UserTeamRole.manager}
            handleCloseMenu={handleCloseMenu}
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    const toggle = screen.getByTestId('RestrictEditingToggle')
    expect(toggle).not.toHaveAttribute('aria-disabled', 'true')
    const checkbox = screen.getByRole('checkbox', {
      name: 'Restrict editing to managers'
    })
    expect(checkbox).not.toBeDisabled()
    expect(checkbox).not.toBeChecked()
  })

  it('shows disabled toggle for non-managers with helper text', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <RestrictEditingToggle
            journey={localTemplate}
            teamRole={UserTeamRole.member}
            handleCloseMenu={handleCloseMenu}
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(
      screen.getByText('Only team managers can change this')
    ).toBeInTheDocument()
    const checkbox = screen.getByRole('checkbox', {
      name: 'Restrict editing to managers'
    })
    expect(checkbox).toBeDisabled()
  })

  it('reflects the current restrictEditing state', () => {
    const restricted = { ...localTemplate, restrictEditing: true } as Journey
    render(
      <MockedProvider>
        <SnackbarProvider>
          <RestrictEditingToggle
            journey={restricted}
            teamRole={UserTeamRole.manager}
            handleCloseMenu={handleCloseMenu}
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(
      screen.getByRole('checkbox', {
        name: 'Restrict editing to managers'
      })
    ).toBeChecked()
  })

})
