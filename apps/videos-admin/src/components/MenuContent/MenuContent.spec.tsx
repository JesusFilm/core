import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'

import { GET_NAVIGATION_ROLES, MenuContent } from './MenuContent'

const mediaPublisherMock = {
  request: { query: GET_NAVIGATION_ROLES },
  result: {
    data: {
      me: {
        id: 'userId',
        __typename: 'AuthenticatedUser',
        mediaUserRoles: ['publisher'],
        languageUserRoles: []
      }
    }
  }
}

const languagePublisherMock = {
  request: { query: GET_NAVIGATION_ROLES },
  result: {
    data: {
      me: {
        id: 'userId',
        __typename: 'AuthenticatedUser',
        mediaUserRoles: [],
        languageUserRoles: ['publisher']
      }
    }
  }
}

const bothPublisherMock = {
  request: { query: GET_NAVIGATION_ROLES },
  result: {
    data: {
      me: {
        id: 'userId',
        __typename: 'AuthenticatedUser',
        mediaUserRoles: ['publisher'],
        languageUserRoles: ['publisher']
      }
    }
  }
}

describe('MenuContent', () => {
  it('should show media menu content items', async () => {
    render(
      <MockedProvider mocks={[mediaPublisherMock]}>
        <MenuContent />
      </MockedProvider>
    )

    expect(
      await screen.findByRole('link', { name: 'Video Library' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Language Admin' })
    ).not.toBeInTheDocument()
  })

  it('should only show languages for language publishers', async () => {
    render(
      <MockedProvider mocks={[languagePublisherMock]}>
        <MenuContent />
      </MockedProvider>
    )

    expect(
      await screen.findByRole('link', { name: 'Language Admin' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Video Library' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Settings' })
    ).not.toBeInTheDocument()
  })

  it('should show all allowed sections for users with both publisher roles', async () => {
    render(
      <MockedProvider mocks={[bothPublisherMock]}>
        <MenuContent />
      </MockedProvider>
    )

    expect(
      await screen.findByRole('link', { name: 'Video Library' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Language Admin' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
  })
})
