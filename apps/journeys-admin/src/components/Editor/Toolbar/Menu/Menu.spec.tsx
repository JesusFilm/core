import { MockedProvider } from '@apollo/client/testing/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { useTeam } from '@core/journeys/ui/TeamProvider'

import { BlockFields_StepBlock as StepBlock } from '../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
import { Role } from '../../../../../__generated__/globalTypes'

import { GET_ROLE } from './Menu'

import { Menu } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

jest.mock('@core/journeys/ui/TeamProvider', () => ({
  __esModule: true,
  useTeam: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockedUseTeam = useTeam as jest.MockedFunction<typeof useTeam>

describe('Toolbar Menu', () => {
  const push = jest.fn()
  const on = jest.fn()

  const language = {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      }
    ]
  }

  beforeEach(() => {
    mockedUseTeam.mockReturnValue({
      activeTeam: {
        __typename: 'Team',
        id: 'teamId',
        title: 'Team Title',
        publicTitle: null,
        userTeams: [],
        customDomains: []
      },
      setActiveTeam: jest.fn(),
      refetch: jest.fn(),
      query: {} as any
    })
  })

  describe('smUp', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => true)
    )

    it('should render menu items', () => {
      const selectedBlock: TreeBlock<StepBlock> = {
        __typename: 'StepBlock',
        id: 'stepId',
        parentBlockId: 'journeyId',
        parentOrder: 0,
        locked: true,
        nextBlockId: null,
        children: [],
        slug: null
      }
      render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  title: 'Some title',
                  description: 'Some description',
                  slug: 'my-journey',
                  tags: [],
                  language
                } as unknown as Journey
              }}
            >
              <EditorProvider initialState={{ selectedBlock }}>
                <Menu />
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
      fireEvent.click(screen.getByRole('button'))
      expect(
        screen.getByRole('menuitem', { name: 'Manage Access' })
      ).toBeInTheDocument()
      expect(screen.getByTestId('menu-divider')).toBeInTheDocument()
      expect(
        screen.getByRole('menuitem', { name: 'Copy Link' })
      ).toBeInTheDocument()
    })

    it('should render journey menu items for publishers', async () => {
      const selectedBlock: TreeBlock<StepBlock> = {
        __typename: 'StepBlock',
        id: 'stepId',
        parentBlockId: 'journeyId',
        parentOrder: 0,
        locked: true,
        nextBlockId: null,
        children: [],
        slug: null
      }
      render(
        <SnackbarProvider>
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_ROLE
                },
                result: {
                  data: {
                    getUserRole: {
                      id: '1',
                      userId: 'userId',
                      roles: [Role.publisher]
                    }
                  }
                }
              }
            ]}
          >
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  title: 'Some title',
                  description: 'Some description',
                  slug: 'my-journey',
                  tags: [],
                  language
                } as unknown as Journey
              }}
            >
              <EditorProvider initialState={{ selectedBlock }}>
                <Menu />
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
      fireEvent.click(screen.getByRole('button'))
      expect(
        screen.getByRole('menuitem', { name: 'Edit Details' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('menuitem', { name: 'Manage Access' })
      ).toBeInTheDocument()
      await waitFor(() =>
        expect(
          screen.getByRole('menuitem', { name: 'Make Template' })
        ).toBeInTheDocument()
      )
      await waitFor(() =>
        expect(
          screen.getByRole('menuitem', { name: 'Make Global Template' })
        ).toBeInTheDocument()
      )
      expect(screen.getByTestId('menu-divider')).toBeInTheDocument()
      expect(
        screen.getByRole('menuitem', { name: 'Copy Link' })
      ).toBeInTheDocument()
    })

    it('should not render global template menu item for non-publishers', async () => {
      const selectedBlock: TreeBlock<StepBlock> = {
        __typename: 'StepBlock',
        id: 'stepId',
        parentBlockId: 'journeyId',
        parentOrder: 0,
        locked: true,
        nextBlockId: null,
        children: [],
        slug: null
      }
      render(
        <SnackbarProvider>
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_ROLE
                },
                result: {
                  data: {
                    getUserRole: {
                      id: '1',
                      userId: 'userId',
                      roles: []
                    }
                  }
                }
              }
            ]}
          >
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  title: 'Some title',
                  description: 'Some description',
                  slug: 'my-journey',
                  tags: [],
                  language
                } as unknown as Journey
              }}
            >
              <EditorProvider initialState={{ selectedBlock }}>
                <Menu />
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
      fireEvent.click(screen.getByRole('button'))
      expect(
        screen.getByRole('menuitem', { name: 'Make Template' })
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('menuitem', { name: 'Make Global Template' })
      ).not.toBeInTheDocument()
    })

    it('should not render make template menu item for shared with me team', async () => {
      mockedUseTeam.mockReturnValue({
        activeTeam: null,
        setActiveTeam: jest.fn(),
        refetch: jest.fn(),
        query: {} as any
      })
      const selectedBlock: TreeBlock<StepBlock> = {
        __typename: 'StepBlock',
        id: 'stepId',
        parentBlockId: 'journeyId',
        parentOrder: 0,
        locked: true,
        nextBlockId: null,
        children: [],
        slug: null
      }
      render(
        <SnackbarProvider>
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_ROLE
                },
                result: {
                  data: {
                    getUserRole: {
                      id: '1',
                      userId: 'userId',
                      roles: []
                    }
                  }
                }
              }
            ]}
          >
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  title: 'Some title',
                  description: 'Some description',
                  slug: 'my-journey',
                  tags: [],
                  language
                } as unknown as Journey
              }}
            >
              <EditorProvider initialState={{ selectedBlock }}>
                <Menu />
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
      fireEvent.click(screen.getByRole('button'))
      expect(
        screen.queryByRole('menuitem', { name: 'Make Template' })
      ).not.toBeInTheDocument()
    })

    it('should render global template menu items', async () => {
      const selectedBlock: TreeBlock<StepBlock> = {
        __typename: 'StepBlock',
        id: 'stepId',
        parentBlockId: 'journeyId',
        parentOrder: 0,
        locked: true,
        nextBlockId: null,
        children: [],
        slug: null
      }
      render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  title: 'Some title',
                  description: 'Some description',
                  slug: 'my-journey',
                  template: true,
                  tags: [],
                  language,
                  team: {
                    id: 'jfp-team'
                  }
                } as unknown as Journey
              }}
            >
              <EditorProvider initialState={{ selectedBlock }}>
                <Menu />
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
      fireEvent.click(screen.getByRole('button'))
      expect(
        screen.getByRole('menuitem', { name: 'Template Settings' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('menuitem', { name: 'Manage Access' })
      ).toBeInTheDocument()
    })

    it('should render local template menu items', async () => {
      const selectedBlock: TreeBlock<StepBlock> = {
        __typename: 'StepBlock',
        id: 'stepId',
        parentBlockId: 'journeyId',
        parentOrder: 0,
        locked: true,
        nextBlockId: null,
        children: [],
        slug: null
      }
      render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  title: 'Some title',
                  description: 'Some description',
                  slug: 'my-journey',
                  template: true,
                  tags: [],
                  language,
                  team: {
                    id: 'local-team-id'
                  }
                } as unknown as Journey
              }}
            >
              <EditorProvider initialState={{ selectedBlock }}>
                <Menu />
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
      fireEvent.click(screen.getByRole('button'))
      expect(
        screen.getByRole('menuitem', { name: 'Template Settings' })
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('menuitem', { name: 'Manage Access' })
      ).not.toBeInTheDocument()
    })

    it('should render Copy Link for template when user is publisher', async () => {
      const selectedBlock: TreeBlock<StepBlock> = {
        __typename: 'StepBlock',
        id: 'stepId',
        parentBlockId: 'journeyId',
        parentOrder: 0,
        locked: true,
        nextBlockId: null,
        children: [],
        slug: null
      }
      render(
        <SnackbarProvider>
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_ROLE
                },
                result: {
                  data: {
                    getUserRole: {
                      id: '1',
                      userId: 'userId',
                      roles: [Role.publisher]
                    }
                  }
                }
              }
            ]}
          >
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  title: 'Some title',
                  description: 'Some description',
                  slug: 'my-journey',
                  template: true,
                  tags: [],
                  language,
                  team: {
                    id: 'jfp-team'
                  }
                } as unknown as Journey
              }}
            >
              <EditorProvider initialState={{ selectedBlock }}>
                <Menu />
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
      fireEvent.click(screen.getByRole('button'))
      await waitFor(() =>
        expect(
          screen.getByRole('menuitem', { name: 'Copy Link' })
        ).toBeInTheDocument()
      )
    })

    it('should not render Copy Link for local template when user is not publisher', async () => {
      const selectedBlock: TreeBlock<StepBlock> = {
        __typename: 'StepBlock',
        id: 'stepId',
        parentBlockId: 'journeyId',
        parentOrder: 0,
        locked: true,
        nextBlockId: null,
        children: [],
        slug: null
      }
      render(
        <SnackbarProvider>
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_ROLE
                },
                result: {
                  data: {
                    getUserRole: {
                      id: '1',
                      userId: 'userId',
                      roles: []
                    }
                  }
                }
              }
            ]}
          >
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  title: 'Some title',
                  description: 'Some description',
                  slug: 'my-journey',
                  template: true,
                  tags: [],
                  language,
                  team: {
                    id: 'my-team-id'
                  }
                } as unknown as Journey
              }}
            >
              <EditorProvider initialState={{ selectedBlock }}>
                <Menu />
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
      fireEvent.click(screen.getByRole('button'))
      await waitFor(() =>
        expect(
          screen.queryByRole('menuitem', { name: 'Copy Link' })
        ).not.toBeInTheDocument()
      )
    })

    it('should handle edit journey details', async () => {
      mockedUseRouter.mockReturnValue({
        query: { param: null },
        push,
        events: {
          on
        }
      } as unknown as NextRouter)

      render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  title: 'Some title',
                  description: 'Some description',
                  slug: 'my-journey',
                  tags: [],
                  language
                } as unknown as Journey
              }}
            >
              <EditorProvider>
                <Menu />
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
      const menu = screen.getByRole('button')
      fireEvent.click(menu)
      fireEvent.click(screen.getByRole('menuitem', { name: 'Edit Details' }))
      await waitFor(() =>
        expect(
          screen.getByRole('textbox', { name: 'Title' })
        ).toBeInTheDocument()
      )
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(menu).not.toHaveAttribute('aria-expanded')

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          {
            query: { param: 'journeyDetails' }
          },
          undefined,
          { shallow: true }
        )
      })
    })
  })

  describe('smDown', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => false)
    )

    it('should render mobile menu items', () => {
      mockedUseRouter.mockReturnValue({
        events: {
          on: jest.fn(),
          off: jest.fn()
        }
      } as unknown as NextRouter)

      const selectedBlock: TreeBlock<StepBlock> = {
        __typename: 'StepBlock',
        id: 'stepId',
        parentBlockId: 'journeyId',
        parentOrder: 0,
        locked: true,
        nextBlockId: null,
        children: [],
        slug: null
      }
      render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  title: 'some title',
                  description: 'some description',
                  slug: 'my-journey',
                  tags: [],
                  language
                } as unknown as Journey
              }}
            >
              <EditorProvider initialState={{ selectedBlock }}>
                <Menu />
              </EditorProvider>
            </JourneyProvider>
          </MockedProvider>
        </SnackbarProvider>
      )
      fireEvent.click(screen.getByRole('button'))
      expect(screen.getByText('some title')).toBeInTheDocument()
      expect(screen.getByTestId('Globe1Icon')).toBeInTheDocument()
      expect(screen.getByText('English')).toBeInTheDocument()
      expect(screen.queryByTestId('DescriptionDot')).toBeInTheDocument()
      expect(screen.getByText('some description')).toBeInTheDocument()
      expect(
        screen.getByRole('menuitem', { name: 'Edit Details' })
      ).toBeInTheDocument()
      expect(screen.getByTestId('details-menu-divider')).toBeInTheDocument()
      expect(
        screen.getByRole('menuitem', { name: 'Manage Access' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('menuitem', { name: 'Analytics 0 visitors' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('menuitem', { name: 'Strategy' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('menuitem', { name: 'Share' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('menuitem', { name: 'Copy Link' })
      ).toBeInTheDocument()
      expect(screen.getByTestId('helpscout-menu-divider')).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'Help' })).toBeInTheDocument()
    })
  })
})
