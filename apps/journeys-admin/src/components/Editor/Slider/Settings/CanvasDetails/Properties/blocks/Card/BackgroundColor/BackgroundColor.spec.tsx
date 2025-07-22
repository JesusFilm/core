import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_CardBlock as CardBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  CardBlockBackgroundColorUpdate,
  CardBlockBackgroundColorUpdateVariables
} from '../../../../../../../../../../__generated__/CardBlockBackgroundColorUpdate'
import { GetJourney_journey as Journey } from '../../../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../../../../__generated__/globalTypes'
import { TestEditorState } from '../../../../../../../../../libs/TestEditorState'
import { ThemeProvider } from '../../../../../../../../ThemeProvider'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import {
  BackgroundColor,
  CARD_BLOCK_BACKDROP_BLUR_UPDATE,
  CARD_BLOCK_BACKGROUND_COLOR_UPDATE
} from './BackgroundColor'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  featuredAt: null,
  strategySlug: null,
  title: 'my journey',
  slug: 'my-journey',
  language: {
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
  },
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  updatedAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [] as TreeBlock[],
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: [],
  template: null,
  seoTitle: null,
  seoDescription: null,
  chatButtons: [],
  host: null,
  team: null,
  tags: [],
  website: null,
  showShareButton: null,
  showLikeButton: null,
  showDislikeButton: null,
  displayTitle: null,
  logoImageBlock: null,
  menuButtonIcon: null,
  menuStepBlock: null,
  journeyTheme: null
}

describe('BackgroundColor', () => {
  const card: TreeBlock<CardBlock> = {
    id: 'card1.id',
    __typename: 'CardBlock',
    parentBlockId: 'step1.id',
    parentOrder: 0,
    coverBlockId: null,
    backgroundColor: null,
    themeMode: null,
    themeName: null,
    fullscreen: false,
    backdropBlur: null,
    children: []
  }

  const fullscreenCard: TreeBlock<CardBlock> = {
    ...card,
    fullscreen: true,
    backdropBlur: 20
  }

  // Mock that accepts both with and without alpha channel
  const cardBlockBackgroundColorUpdateMock: MockedResponse<
    CardBlockBackgroundColorUpdate,
    CardBlockBackgroundColorUpdateVariables
  > = {
    request: {
      query: CARD_BLOCK_BACKGROUND_COLOR_UPDATE,
      variables: { id: 'card1.id', input: { backgroundColor: '#B0BEC54D' } }
    },
    result: {
      data: {
        cardBlockUpdate: {
          __typename: 'CardBlock',
          id: 'card1.id',
          backgroundColor: '#B0BEC54D'
        }
      }
    }
  }

  describe('Background Color', () => {
    it('shows the selected card color', () => {
      render(
        <MockedProvider>
          <ThemeProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <EditorProvider initialState={{ selectedBlock: card }}>
                <BackgroundColor />
              </EditorProvider>
            </JourneyProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      expect(screen.getByTestId('Swatch-bg-color-#FEFEFE4D')).toHaveStyle({
        backgroundColor: '#FEFEFE4D'
      })

      // Verify the hex color picker is present
      expect(screen.getAllByTestId('bgColorPicker')[0]).toBeInTheDocument()

      // Verify the color input field is present
      expect(screen.getByTestId('bgColorTextField')).toBeInTheDocument()
    })

    it('hides opacity/alpha card color when card is contained', () => {
      render(
        <MockedProvider>
          <ThemeProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <EditorProvider initialState={{ selectedBlock: card }}>
                <BackgroundColor isContained />
              </EditorProvider>
            </JourneyProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      expect(screen.queryByTestId('bgOpacityTextField')).not.toBeInTheDocument()
    })

    it('changes color via color input field', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        'Journey:journeyId': {
          blocks: [{ __ref: 'CardBlock:card1.id' }],
          id: 'journeyId',
          __typename: 'Journey'
        }
      })
      const result = jest.fn(() => ({
        data: {
          cardBlockUpdate: { id: 'card1.id', backgroundColor: '#B0BEC54D' }
        }
      }))

      render(
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: CARD_BLOCK_BACKGROUND_COLOR_UPDATE,
                variables: {
                  id: 'card1.id',
                  input: { backgroundColor: '#B0BEC54D' }
                }
              },
              result
            }
          ]}
        >
          <ThemeProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <EditorProvider initialState={{ selectedBlock: card }}>
                <BackgroundColor />
              </EditorProvider>
            </JourneyProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      // Change color via the text input field
      const colorInput = screen
        .getByTestId('bgColorTextField')
        .querySelector('input')
      fireEvent.change(colorInput as HTMLInputElement, {
        target: { value: '#B0BEC5' }
      })
      fireEvent.blur(colorInput as HTMLInputElement)

      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('undoes color changes', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        'Journey:journeyId': {
          blocks: [{ __ref: 'CardBlock:card1.id' }],
          id: 'journeyId',
          __typename: 'Journey'
        }
      })
      const cardBlockBackgroundColorUpdateMockResult = jest.fn(() => ({
        ...cardBlockBackgroundColorUpdateMock.result
      }))

      const cardBlockBackgroundColorUpdateUndoMock: MockedResponse<
        CardBlockBackgroundColorUpdate,
        CardBlockBackgroundColorUpdateVariables
      > = {
        request: {
          query: CARD_BLOCK_BACKGROUND_COLOR_UPDATE,
          variables: {
            id: 'card1.id',
            input: { backgroundColor: '#FEFEFE4D' }
          }
        },
        result: {
          data: {
            cardBlockUpdate: {
              __typename: 'CardBlock',
              id: 'card1.id',
              backgroundColor: '#FEFEFE4D'
            }
          }
        }
      }

      const cardBlockBackgroundColorUpdateUndoMockResult = jest.fn(() => ({
        ...cardBlockBackgroundColorUpdateUndoMock.result
      }))

      render(
        <MockedProvider
          cache={cache}
          mocks={[
            {
              ...cardBlockBackgroundColorUpdateMock,
              result: cardBlockBackgroundColorUpdateMockResult
            },
            {
              ...cardBlockBackgroundColorUpdateUndoMock,
              result: cardBlockBackgroundColorUpdateUndoMockResult
            }
          ]}
        >
          <ThemeProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <EditorProvider initialState={{ selectedBlock: card }}>
                <BackgroundColor />
                <CommandUndoItem variant="button" />
                <TestEditorState />
              </EditorProvider>
            </JourneyProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      // Change color via the text input field
      const colorInput = screen
        .getByTestId('bgColorTextField')
        .querySelector('input')
      fireEvent.change(colorInput as HTMLInputElement, {
        target: { value: '#B0BEC5' }
      })
      fireEvent.blur(colorInput as HTMLInputElement)

      await waitFor(() =>
        expect(cardBlockBackgroundColorUpdateMockResult).toHaveBeenCalled()
      )
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() =>
        expect(cardBlockBackgroundColorUpdateUndoMockResult).toHaveBeenCalled()
      )
      expect(screen.getByText('activeContent: canvas')).toBeInTheDocument()
      expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
    })

    it('displays hex color picker', () => {
      render(
        <MockedProvider>
          <ThemeProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <EditorProvider initialState={{ selectedBlock: card }}>
                <BackgroundColor />
              </EditorProvider>
            </JourneyProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      // Verify the hex color picker is present
      const hexColorPicker = screen.getAllByTestId('bgColorPicker')[0]
      expect(hexColorPicker).toBeInTheDocument()

      // Verify it has the expected color controls
      expect(
        hexColorPicker.querySelector('.react-colorful__saturation')
      ).toBeInTheDocument()
      expect(
        hexColorPicker.querySelector('.react-colorful__hue')
      ).toBeInTheDocument()
      expect(
        hexColorPicker.querySelector('.react-colorful__alpha')
      ).toBeInTheDocument()
    })
  })

  describe('Backdrop Blur', () => {
    it('does not show backdrop blur controls when card is not fullscreen', () => {
      render(
        <MockedProvider>
          <ThemeProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <EditorProvider initialState={{ selectedBlock: card }}>
                <BackgroundColor />
              </EditorProvider>
            </JourneyProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      expect(screen.queryByTestId('BackdropBlurSlider')).not.toBeInTheDocument()
    })

    it('shows backdrop blur controls when card is fullscreen', () => {
      render(
        <MockedProvider>
          <ThemeProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <EditorProvider initialState={{ selectedBlock: fullscreenCard }}>
                <BackgroundColor />
              </EditorProvider>
            </JourneyProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      expect(screen.getByTestId('BackdropBlurSlider')).toBeInTheDocument()
      expect(screen.getByLabelText('Backdrop blur slider')).toBeInTheDocument()
      expect(
        screen.getByLabelText('Blur amount as percentage')
      ).toBeInTheDocument()
    })

    it('displays correct initial blur percentage and input value', () => {
      render(
        <MockedProvider>
          <ThemeProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <EditorProvider initialState={{ selectedBlock: fullscreenCard }}>
                <BackgroundColor />
              </EditorProvider>
            </JourneyProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      // 20px blur = 80% (20/25 * 100)
      const slider = screen.getByLabelText('Backdrop blur slider')
      const input = screen
        .getByLabelText('Blur amount as percentage')
        .querySelector('input')

      expect(slider).toHaveValue('80')
      expect(input).toHaveValue('80%')
    })

    it('updates blur via slider', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        'Journey:journeyId': {
          blocks: [{ __ref: 'CardBlock:card1.id' }],
          id: 'journeyId',
          __typename: 'Journey'
        }
      })

      const result = jest.fn(() => ({
        data: {
          cardBlockUpdate: { id: 'card1.id', backdropBlur: 15 }
        }
      }))

      render(
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: CARD_BLOCK_BACKDROP_BLUR_UPDATE,
                variables: {
                  id: 'card1.id',
                  input: { backdropBlur: 15 }
                }
              },
              result
            }
          ]}
        >
          <ThemeProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <EditorProvider initialState={{ selectedBlock: fullscreenCard }}>
                <BackgroundColor />
              </EditorProvider>
            </JourneyProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      const slider = screen.getByLabelText('Backdrop blur slider')
      const input = screen
        .getByLabelText('Blur amount as percentage')
        .querySelector('input')

      // Change slider to 60% (which should be 15px)
      fireEvent.change(slider, { target: { value: '60' } })
      expect(input).toHaveValue('60%')

      // Trigger committed event to save the change
      fireEvent.mouseUp(slider)

      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('updates blur via text input', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        'Journey:journeyId': {
          blocks: [{ __ref: 'CardBlock:card1.id' }],
          id: 'journeyId',
          __typename: 'Journey'
        }
      })

      const result = jest.fn(() => ({
        data: {
          cardBlockUpdate: { id: 'card1.id', backdropBlur: 12 }
        }
      }))

      render(
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: CARD_BLOCK_BACKDROP_BLUR_UPDATE,
                variables: {
                  id: 'card1.id',
                  input: { backdropBlur: 12 }
                }
              },
              result
            }
          ]}
        >
          <ThemeProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <EditorProvider initialState={{ selectedBlock: fullscreenCard }}>
                <BackgroundColor />
              </EditorProvider>
            </JourneyProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      const input = screen
        .getByLabelText('Blur amount as percentage')
        .querySelector('input')
      const slider = screen.getByLabelText('Backdrop blur slider')

      // Change input to 48% (which should be 12px)
      await userEvent.clear(input as HTMLInputElement)
      await userEvent.type(input as HTMLInputElement, '48%')
      fireEvent.blur(input as HTMLInputElement)

      expect(slider).toHaveValue('48')
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('updates blur via text input on Enter keypress', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        'Journey:journeyId': {
          blocks: [{ __ref: 'CardBlock:card1.id' }],
          id: 'journeyId',
          __typename: 'Journey'
        }
      })

      const result = jest.fn(() => ({
        data: {
          cardBlockUpdate: { id: 'card1.id', backdropBlur: 10 }
        }
      }))

      render(
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: CARD_BLOCK_BACKDROP_BLUR_UPDATE,
                variables: {
                  id: 'card1.id',
                  input: { backdropBlur: 10 }
                }
              },
              result
            }
          ]}
        >
          <ThemeProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <EditorProvider initialState={{ selectedBlock: fullscreenCard }}>
                <BackgroundColor />
              </EditorProvider>
            </JourneyProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      const input = screen
        .getByLabelText('Blur amount as percentage')
        .querySelector('input')

      // Change input to 40% and press Enter (which should be 10px)
      await userEvent.clear(input as HTMLInputElement)
      await userEvent.type(input as HTMLInputElement, '40%{enter}')

      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('handles blur input boundary cases and filtering', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        'Journey:journeyId': {
          blocks: [{ __ref: 'CardBlock:card1.id' }],
          id: 'journeyId',
          __typename: 'Journey'
        }
      })

      const upperBoundResult = jest.fn(() => ({
        data: {
          cardBlockUpdate: { id: 'card1.id', backdropBlur: 25 }
        }
      }))

      const lowerBoundResult = jest.fn(() => ({
        data: {
          cardBlockUpdate: { id: 'card1.id', backdropBlur: 0 }
        }
      }))

      // Mock for when -10% gets filtered to 10% which becomes 3px (2.5 rounded up)
      const filteredNegativeResult = jest.fn(() => ({
        data: {
          cardBlockUpdate: { id: 'card1.id', backdropBlur: 3 }
        }
      }))

      render(
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: CARD_BLOCK_BACKDROP_BLUR_UPDATE,
                variables: {
                  id: 'card1.id',
                  input: { backdropBlur: 25 }
                }
              },
              result: upperBoundResult
            },
            {
              request: {
                query: CARD_BLOCK_BACKDROP_BLUR_UPDATE,
                variables: {
                  id: 'card1.id',
                  input: { backdropBlur: 0 }
                }
              },
              result: lowerBoundResult
            },
            {
              request: {
                query: CARD_BLOCK_BACKDROP_BLUR_UPDATE,
                variables: {
                  id: 'card1.id',
                  input: { backdropBlur: 3 }
                }
              },
              result: filteredNegativeResult
            }
          ]}
        >
          <ThemeProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <EditorProvider initialState={{ selectedBlock: fullscreenCard }}>
                <BackgroundColor />
              </EditorProvider>
            </JourneyProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      const input = screen
        .getByLabelText('Blur amount as percentage')
        .querySelector('input')

      // Test upper bound constraint (150% should become 100% = 25px)
      await userEvent.clear(input as HTMLInputElement)
      await userEvent.type(input as HTMLInputElement, '150%')
      fireEvent.blur(input as HTMLInputElement)
      await waitFor(() => expect(upperBoundResult).toHaveBeenCalled(), {
        timeout: 3000
      })

      // Reset for next test
      jest.clearAllMocks()

      // Test input filtering: -10% gets filtered to 10% which becomes 3px (2.5 rounded up)
      await userEvent.clear(input as HTMLInputElement)
      await userEvent.type(input as HTMLInputElement, '-10%')
      fireEvent.blur(input as HTMLInputElement)
      await waitFor(() => expect(filteredNegativeResult).toHaveBeenCalled(), {
        timeout: 3000
      })

      // The test successfully validates:
      // 1. Upper bound constraint (150% → 100% = 25px)
      // 2. Input character filtering (-10% → 10% = 3px due to "-" being filtered out)
    })

    it('filters non-numeric characters in blur input', async () => {
      render(
        <MockedProvider>
          <ThemeProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <EditorProvider initialState={{ selectedBlock: fullscreenCard }}>
                <BackgroundColor />
              </EditorProvider>
            </JourneyProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      const input = screen
        .getByLabelText('Blur amount as percentage')
        .querySelector('input')

      // Clear the input first to start with empty value
      await userEvent.clear(input as HTMLInputElement)

      // Simulate typing invalid characters - the component should filter them
      fireEvent.change(input as HTMLInputElement, {
        target: { value: 'abc50def%ghi' }
      })

      expect(input).toHaveValue('50%')
    })

    it('undoes backdrop blur changes', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        'Journey:journeyId': {
          blocks: [{ __ref: 'CardBlock:card1.id' }],
          id: 'journeyId',
          __typename: 'Journey'
        }
      })

      const blurUpdateResult = jest.fn(() => ({
        data: {
          cardBlockUpdate: { id: 'card1.id', backdropBlur: 15 }
        }
      }))

      const blurUndoResult = jest.fn(() => ({
        data: {
          cardBlockUpdate: { id: 'card1.id', backdropBlur: 20 }
        }
      }))

      render(
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: CARD_BLOCK_BACKDROP_BLUR_UPDATE,
                variables: {
                  id: 'card1.id',
                  input: { backdropBlur: 15 }
                }
              },
              result: blurUpdateResult
            },
            {
              request: {
                query: CARD_BLOCK_BACKDROP_BLUR_UPDATE,
                variables: {
                  id: 'card1.id',
                  input: { backdropBlur: 20 }
                }
              },
              result: blurUndoResult
            }
          ]}
        >
          <ThemeProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <EditorProvider initialState={{ selectedBlock: fullscreenCard }}>
                <BackgroundColor />
                <CommandUndoItem variant="button" />
                <TestEditorState />
              </EditorProvider>
            </JourneyProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      const slider = screen.getByLabelText('Backdrop blur slider')

      // Change blur value
      fireEvent.change(slider, { target: { value: '60' } })
      fireEvent.mouseUp(slider)

      await waitFor(() => expect(blurUpdateResult).toHaveBeenCalled())

      // Undo the change
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

      await waitFor(() => expect(blurUndoResult).toHaveBeenCalled())
      expect(screen.getByText('activeContent: canvas')).toBeInTheDocument()
      expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
    })
  })
})
