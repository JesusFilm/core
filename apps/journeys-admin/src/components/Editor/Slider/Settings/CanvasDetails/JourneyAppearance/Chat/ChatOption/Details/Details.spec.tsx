import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { MessagePlatform } from '../../../../../../../../../../__generated__/globalTypes'
import {
  JourneyChatButtonUpdate,
  JourneyChatButtonUpdateVariables
} from '../../../../../../../../../../__generated__/JourneyChatButtonUpdate'
import { CommandRedoItem } from '../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { JOURNEY_CHAT_BUTTON_UPDATE } from './Details'

import { Details } from '.'

describe('Details', () => {
  const defaultProps = {
    journeyId: 'journeyId',
    chatButtonId: 'chat.id',
    currentPlatform: MessagePlatform.whatsApp,
    currentLink: 'https://example.com',
    currentCustomizable: null as boolean | null,
    active: true,
    setCurrentPlatform: noop,
    setCurrentLink: noop,
    helperInfo: 'helper info',
    enableIconSelect: false
  }

  it('should render', () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <Details {...defaultProps} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('textbox')).toHaveValue('https://example.com')
    expect(getByText('helper info')).toBeInTheDocument()
  })

  it('should update link', async () => {
    const props = {
      ...defaultProps,
      currentPlatform: MessagePlatform.telegram
    }

    const result = jest.fn(() => ({
      data: {
        chatButtonUpdate: {
          __typename: 'ChatButton' as const,
          id: 'chat.id',
          link: 'https://newlink.com',
          platform: MessagePlatform.telegram,
          customizable: null
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_CHAT_BUTTON_UPDATE,
              variables: {
                chatButtonUpdateId: 'chat.id',
                journeyId: 'journeyId',
                input: {
                  link: 'https://newlink.com',
                  platform: MessagePlatform.telegram
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <Details {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'https://newlink.com' }
    })
    fireEvent.blur(getByRole('textbox'))

    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should update link with a protocol', async () => {
    const props = {
      ...defaultProps,
      currentPlatform: MessagePlatform.telegram
    }

    const result = jest.fn(() => ({
      data: {
        chatButtonUpdate: {
          __typename: 'ChatButton' as const,
          id: 'chat.id',
          link: 'newlink.com',
          platform: MessagePlatform.telegram,
          customizable: null
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_CHAT_BUTTON_UPDATE,
              variables: {
                chatButtonUpdateId: 'chat.id',
                journeyId: 'journeyId',
                input: {
                  link: 'https://newlink.com',
                  platform: MessagePlatform.telegram
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <Details {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'https://newlink.com' }
    })
    fireEvent.blur(getByRole('textbox'))

    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should update platform', async () => {
    const props = {
      ...defaultProps,
      currentPlatform: MessagePlatform.tikTok,
      enableIconSelect: true
    }

    const result = jest.fn(() => ({
      data: {
        chatButtonUpdate: {
          __typename: 'ChatButton' as const,
          id: 'chat.id',
          link: 'https://example.com',
          platform: MessagePlatform.snapchat,
          customizable: null
        }
      }
    }))

    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_CHAT_BUTTON_UPDATE,
              variables: {
                chatButtonUpdateId: 'chat.id',
                journeyId: 'journeyId',
                input: {
                  link: 'https://example.com',
                  platform: MessagePlatform.snapchat
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <Details {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('combobox'))
    fireEvent.click(getByText('Snapchat'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should display human-readable label for legacy platform in dropdown', () => {
    const props = {
      ...defaultProps,
      currentPlatform: MessagePlatform.messageNotifySquare,
      enableIconSelect: true
    }

    render(
      <MockedProvider>
        <SnackbarProvider>
          <Details {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Message Notify Square')).toBeInTheDocument()
  })

  describe('customizable toggle', () => {
    const templateJourney = {
      ...defaultJourney,
      template: true
    } as unknown as Journey

    const nonTemplateJourney = {
      ...defaultJourney,
      template: false
    } as unknown as Journey

    it('renders toggle when journey.template is true and chat option is active', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider
              value={{ journey: templateJourney, variant: 'admin' }}
            >
              <CommandProvider>
                <Details {...defaultProps} currentCustomizable={false} />
              </CommandProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(
        screen.getByRole('checkbox', { name: 'Toggle customizable' })
      ).toBeInTheDocument()
      expect(screen.getByText('Needs Customization')).toBeInTheDocument()
    })

    it('does not render toggle when journey.template is false', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider
              value={{ journey: nonTemplateJourney, variant: 'admin' }}
            >
              <CommandProvider>
                <Details {...defaultProps} currentCustomizable={false} />
              </CommandProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(
        screen.queryByRole('checkbox', { name: 'Toggle customizable' })
      ).not.toBeInTheDocument()
      expect(screen.queryByText('Needs Customization')).not.toBeInTheDocument()
    })

    it('does not render toggle when active is false', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider
              value={{ journey: templateJourney, variant: 'admin' }}
            >
              <CommandProvider>
                <Details
                  {...defaultProps}
                  active={false}
                  currentCustomizable={false}
                />
              </CommandProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(
        screen.queryByRole('checkbox', { name: 'Toggle customizable' })
      ).not.toBeInTheDocument()
    })

    it('calls chatButtonUpdate with correct customizable value when toggled', async () => {
      const result = jest.fn(() => ({
        data: {
          chatButtonUpdate: {
            __typename: 'ChatButton' as const,
            id: 'chat.id',
            link: 'https://example.com',
            platform: MessagePlatform.whatsApp,
            customizable: true
          }
        }
      }))

      const mock: MockedResponse<
        JourneyChatButtonUpdate,
        JourneyChatButtonUpdateVariables
      > = {
        request: {
          query: JOURNEY_CHAT_BUTTON_UPDATE,
          variables: {
            chatButtonUpdateId: 'chat.id',
            journeyId: 'journeyId',
            input: {
              customizable: true
            }
          }
        },
        result
      }

      render(
        <MockedProvider mocks={[mock]}>
          <SnackbarProvider>
            <JourneyProvider
              value={{ journey: templateJourney, variant: 'admin' }}
            >
              <CommandProvider>
                <Details {...defaultProps} currentCustomizable={false} />
              </CommandProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      const toggle = screen.getByRole('checkbox', {
        name: 'Toggle customizable'
      })
      expect(toggle).not.toBeChecked()

      fireEvent.click(toggle)

      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('undo after toggling customizable calls chatButtonUpdate with previous value', async () => {
      const executeResult = jest.fn(() => ({
        data: {
          chatButtonUpdate: {
            __typename: 'ChatButton' as const,
            id: 'chat.id',
            link: 'https://example.com',
            platform: MessagePlatform.whatsApp,
            customizable: true
          }
        }
      }))
      const undoResult = jest.fn(() => ({
        data: {
          chatButtonUpdate: {
            __typename: 'ChatButton' as const,
            id: 'chat.id',
            link: 'https://example.com',
            platform: MessagePlatform.whatsApp,
            customizable: false
          }
        }
      }))

      const executeMock: MockedResponse<
        JourneyChatButtonUpdate,
        JourneyChatButtonUpdateVariables
      > = {
        request: {
          query: JOURNEY_CHAT_BUTTON_UPDATE,
          variables: {
            chatButtonUpdateId: 'chat.id',
            journeyId: 'journeyId',
            input: { customizable: true }
          }
        },
        result: executeResult
      }
      const undoMock: MockedResponse<
        JourneyChatButtonUpdate,
        JourneyChatButtonUpdateVariables
      > = {
        request: {
          query: JOURNEY_CHAT_BUTTON_UPDATE,
          variables: {
            chatButtonUpdateId: 'chat.id',
            journeyId: 'journeyId',
            input: { customizable: false }
          }
        },
        result: undoResult
      }

      render(
        <MockedProvider mocks={[executeMock, undoMock]}>
          <SnackbarProvider>
            <JourneyProvider
              value={{ journey: templateJourney, variant: 'admin' }}
            >
              <CommandProvider>
                <Details {...defaultProps} currentCustomizable={false} />
                <CommandUndoItem variant="button" />
              </CommandProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      fireEvent.click(
        screen.getByRole('checkbox', { name: 'Toggle customizable' })
      )
      await waitFor(() => expect(executeResult).toHaveBeenCalled())

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(undoResult).toHaveBeenCalled())
    })

    it('redo after undo calls chatButtonUpdate with execute value', async () => {
      const executeResult = jest.fn(() => ({
        data: {
          chatButtonUpdate: {
            __typename: 'ChatButton' as const,
            id: 'chat.id',
            link: 'https://example.com',
            platform: MessagePlatform.whatsApp,
            customizable: true
          }
        }
      }))
      const undoResult = jest.fn(() => ({
        data: {
          chatButtonUpdate: {
            __typename: 'ChatButton' as const,
            id: 'chat.id',
            link: 'https://example.com',
            platform: MessagePlatform.whatsApp,
            customizable: false
          }
        }
      }))
      const redoResult = jest.fn(() => ({
        data: {
          chatButtonUpdate: {
            __typename: 'ChatButton' as const,
            id: 'chat.id',
            link: 'https://example.com',
            platform: MessagePlatform.whatsApp,
            customizable: true
          }
        }
      }))

      const executeMock: MockedResponse<
        JourneyChatButtonUpdate,
        JourneyChatButtonUpdateVariables
      > = {
        request: {
          query: JOURNEY_CHAT_BUTTON_UPDATE,
          variables: {
            chatButtonUpdateId: 'chat.id',
            journeyId: 'journeyId',
            input: { customizable: true }
          }
        },
        result: executeResult
      }
      const undoMock: MockedResponse<
        JourneyChatButtonUpdate,
        JourneyChatButtonUpdateVariables
      > = {
        request: {
          query: JOURNEY_CHAT_BUTTON_UPDATE,
          variables: {
            chatButtonUpdateId: 'chat.id',
            journeyId: 'journeyId',
            input: { customizable: false }
          }
        },
        result: undoResult
      }
      const redoMock: MockedResponse<
        JourneyChatButtonUpdate,
        JourneyChatButtonUpdateVariables
      > = {
        request: {
          query: JOURNEY_CHAT_BUTTON_UPDATE,
          variables: {
            chatButtonUpdateId: 'chat.id',
            journeyId: 'journeyId',
            input: { customizable: true }
          }
        },
        result: redoResult
      }

      render(
        <MockedProvider mocks={[executeMock, undoMock, redoMock]}>
          <SnackbarProvider>
            <JourneyProvider
              value={{ journey: templateJourney, variant: 'admin' }}
            >
              <CommandProvider>
                <Details {...defaultProps} currentCustomizable={false} />
                <CommandUndoItem variant="button" />
                <CommandRedoItem variant="button" />
              </CommandProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      fireEvent.click(
        screen.getByRole('checkbox', { name: 'Toggle customizable' })
      )
      await waitFor(() => expect(executeResult).toHaveBeenCalled())

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(undoResult).toHaveBeenCalled())

      fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
      await waitFor(() => expect(redoResult).toHaveBeenCalled())
    })

    it('renders checked state when currentCustomizable is true', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider
              value={{ journey: templateJourney, variant: 'admin' }}
            >
              <CommandProvider>
                <Details {...defaultProps} currentCustomizable={true} />
              </CommandProvider>
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      const toggle = screen.getByRole('checkbox', {
        name: 'Toggle customizable'
      })
      expect(toggle).toBeChecked()
    })
  })
})
