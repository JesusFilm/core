import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { GET_ALL_TEAM_HOSTS, HostList } from './HostList'

const mocks = [
  {
    request: {
      query: GET_ALL_TEAM_HOSTS,
      variables: { teamId: 'jfp-team' }
    },
    result: {
      data: {
        hosts: [
          {
            id: '1',
            location: 'New Zealand',
            src1: 'https://tinyurl.com/3bxusmyb',
            src2: null,
            title: `John "The Rock" Geronimo`
          },
          {
            id: '2',
            location: 'Tokyo, Japan',
            src1: 'https://tinyurl.com/3bxusmyb',
            src2: 'https://tinyurl.com/mr4a78kb',
            title: 'John G & Siyang C'
          }
        ]
      }
    }
  }
]

describe('HostList', () => {
  it('renders host list with correct data', async () => {
    const { getByText, getAllByRole } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <HostList />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByText('John "The Rock" Geronimo')).toBeInTheDocument()
      expect(getByText('New Zealand')).toBeInTheDocument()
      expect(getByText('Tokyo, Japan')).toBeInTheDocument()
      expect(getByText('John G & Siyang C')).toBeInTheDocument()
      const avatars = getAllByRole('img')
      expect(avatars).toHaveLength(3)
      expect(avatars[0]).toHaveAttribute('src', 'https://tinyurl.com/3bxusmyb')
      expect(avatars[1]).toHaveAttribute('src', 'https://tinyurl.com/mr4a78kb')
      expect(avatars[2]).toHaveAttribute('src', 'https://tinyurl.com/3bxusmyb')
    })
  })
})
