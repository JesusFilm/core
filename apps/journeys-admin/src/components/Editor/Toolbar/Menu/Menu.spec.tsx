import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_StepBlock as StepBlock } from '../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
import { Role } from '../../../../../__generated__/globalTypes'

import { GET_ROLE } from './Menu'

import { Menu } from '.'

jest.mock('next-firebase-auth', () => ({
  __esModule: true,
  useUser: jest.fn(() => ({
    id: 'userId',
    name: 'userName',
    email: 'user@example.com'
  }))
}))

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('Toolbar Menu', () => {
  const push = jest.fn()
  const on = jest.fn()

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
        children: []
      }
      const { getByRole, getByTestId } = render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  slug: 'my-journey',
                  tags: []
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
      fireEvent.click(getByRole('button'))
      expect(
        getByRole('menuitem', { name: 'Manage Access' })
      ).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Title' })).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Description' })).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Language' })).toBeInTheDocument()
      expect(getByTestId('menu-divider')).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Copy Link' })).toBeInTheDocument()
    })

    it('should render journey menu items for publishers', async () => {
      const selectedBlock: TreeBlock<StepBlock> = {
        __typename: 'StepBlock',
        id: 'stepId',
        parentBlockId: 'journeyId',
        parentOrder: 0,
        locked: true,
        nextBlockId: null,
        children: []
      }
      const { getByRole, getByTestId } = render(
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
                  slug: 'my-journey',
                  tags: []
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
      fireEvent.click(getByRole('button'))
      expect(
        getByRole('menuitem', { name: 'Manage Access' })
      ).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Title' })).toBeInTheDocument()
      await waitFor(() => {
        expect(
          getByRole('menuitem', { name: 'Description' })
        ).toBeInTheDocument()
      })
      expect(
        getByRole('menuitem', { name: 'Create Template' })
      ).toBeInTheDocument()
      expect(getByTestId('menu-divider')).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Language' })).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Copy Link' })).toBeInTheDocument()
    })

    it('should render template menu items', async () => {
      const selectedBlock: TreeBlock<StepBlock> = {
        __typename: 'StepBlock',
        id: 'stepId',
        parentBlockId: 'journeyId',
        parentOrder: 0,
        locked: true,
        nextBlockId: null,
        children: []
      }
      const { getByRole } = render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  slug: 'my-journey',
                  template: true,
                  tags: []
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
      fireEvent.click(getByRole('button'))
      expect(
        getByRole('menuitem', { name: 'Template Settings' })
      ).toBeInTheDocument()
    })

    it('should handle edit journey title', async () => {
      mockedUseRouter.mockReturnValue({
        query: { param: null },
        push,
        events: {
          on
        }
      } as unknown as NextRouter)

      const { getByRole } = render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  slug: 'my-journey',
                  tags: []
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
      const menu = getByRole('button')
      fireEvent.click(menu)
      fireEvent.click(getByRole('menuitem', { name: 'Title' }))
      await waitFor(() =>
        expect(getByRole('dialog', { name: 'Edit Title' })).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Cancel' }))
      expect(menu).not.toHaveAttribute('aria-expanded')

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          {
            query: { param: 'title' }
          },
          undefined,
          { shallow: true }
        )
      })
    })

    it('should handle edit journey description', async () => {
      mockedUseRouter.mockReturnValue({
        query: { param: null },
        push,
        events: {
          on
        }
      } as unknown as NextRouter)

      const { getByRole } = render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  slug: 'my-journey',
                  tags: []
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
      const menu = getByRole('button')
      fireEvent.click(menu)
      fireEvent.click(getByRole('menuitem', { name: 'Description' }))
      await waitFor(() =>
        expect(
          getByRole('dialog', { name: 'Edit Description' })
        ).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Cancel' }))
      expect(menu).not.toHaveAttribute('aria-expanded')

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          {
            query: { param: 'description' }
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
        children: []
      }
      const { getByRole, getByTestId } = render(
        <SnackbarProvider>
          <MockedProvider>
            <JourneyProvider
              value={{
                journey: {
                  id: 'journeyId',
                  slug: 'my-journey',
                  tags: []
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
      fireEvent.click(getByRole('button'))
      expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
      expect(
        getByRole('menuitem', { name: 'Manage Access' })
      ).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Title' })).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Description' })).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Language' })).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Analytics' })).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Strategy' })).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Share' })).toBeInTheDocument()
      expect(getByTestId('menu-divider')).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Copy Link' })).toBeInTheDocument()
    })
  })
})
