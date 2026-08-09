import { MockedProvider } from '@apollo/client/testing'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { render, screen, waitFor } from '@testing-library/react'
import { type Mock } from 'vitest'

import { TreeBlock } from '../../../../libs/block/TreeBlock'
import { JourneyProvider } from '../../../../libs/JourneyProvider'
import { journey } from '../../../../libs/JourneyProvider/JourneyProvider.mock'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../libs/useJourneyQuery/__generated__/GetJourney'

import { TemplateCardPreview } from './TemplateCardPreview'

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: vi.fn()
}))

const mockSlideTo = vi.fn()
const mockUpdate = vi.fn()

vi.mock('swiper/react', () => {
  const React = require('react')
  return {
    Swiper: ({ children, onSwiper, onSlideChangeTransitionEnd }: any) => {
      React.useEffect(() => {
        onSwiper?.({
          slideTo: mockSlideTo,
          update: mockUpdate,
          realIndex: 0
        })
      }, [onSwiper])
      return <div data-testid="Swiper">{children}</div>
    },
    SwiperSlide: ({ children, 'data-testid': dataTestId, className }: any) => (
      <div
        data-testid={dataTestId ?? 'TemplateCardsSwiperSlide'}
        className={className}
      >
        {children}
      </div>
    )
  }
})

describe('TemplateCardPreview', () => {
  beforeEach(() => {
    mockSlideTo.mockClear()
  })

  it('renders correct number of cards', async () => {
    ;(useMediaQuery as unknown as Mock).mockReturnValue(false)
    const steps = [
      {
        id: '1',
        children: [
          {
            __typename: 'CardBlock',
            showAssistant: null,
            expandChatByDefault: null
          }
        ]
      },
      {
        id: '2',
        children: [
          {
            __typename: 'CardBlock',
            showAssistant: null,
            expandChatByDefault: null
          }
        ]
      },
      {
        id: '3',
        children: [
          {
            __typename: 'CardBlock',
            showAssistant: null,
            expandChatByDefault: null
          }
        ]
      }
    ] as Array<TreeBlock<StepBlock>>

    render(
      <ThemeProvider theme={createTheme()}>
        <JourneyProvider value={{ journey }}>
          <TemplateCardPreview steps={steps} />
        </JourneyProvider>
      </ThemeProvider>
    )
    await waitFor(() =>
      expect(screen.getAllByTestId('TemplateCardsSwiperSlide')).toHaveLength(3)
    )
  })

  it('renders use template slide if more than 7 cards in journey', async () => {
    const steps = [
      {
        id: '1',
        children: [
          {
            __typename: 'CardBlock',
            showAssistant: null,
            expandChatByDefault: null
          }
        ]
      },
      {
        id: '2',
        children: [
          {
            __typename: 'CardBlock',
            showAssistant: null,
            expandChatByDefault: null
          }
        ]
      },
      {
        id: '3',
        children: [
          {
            __typename: 'CardBlock',
            showAssistant: null,
            expandChatByDefault: null
          }
        ]
      },
      {
        id: '4',
        children: [
          {
            __typename: 'CardBlock',
            showAssistant: null,
            expandChatByDefault: null
          }
        ]
      },
      {
        id: '5',
        children: [
          {
            __typename: 'CardBlock',
            showAssistant: null,
            expandChatByDefault: null
          }
        ]
      },
      {
        id: '6',
        children: [
          {
            __typename: 'CardBlock',
            showAssistant: null,
            expandChatByDefault: null
          }
        ]
      },
      {
        id: '7',
        children: [
          {
            __typename: 'CardBlock',
            showAssistant: null,
            expandChatByDefault: null
          }
        ]
      },
      {
        id: '8',
        children: [
          {
            __typename: 'CardBlock',
            showAssistant: null,
            expandChatByDefault: null
          }
        ]
      },
      {
        id: '9',
        children: [
          {
            __typename: 'CardBlock',
            showAssistant: null,
            expandChatByDefault: null
          }
        ]
      },
      {
        id: '10',
        children: [
          {
            __typename: 'CardBlock',
            showAssistant: null,
            expandChatByDefault: null
          }
        ]
      }
    ] as Array<TreeBlock<StepBlock>>

    render(
      <MockedProvider>
        <ThemeProvider theme={createTheme()}>
          <TemplateCardPreview steps={steps} />
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getAllByTestId('TemplateCardsSwiperSlide')).toHaveLength(7)
    )
    expect(screen.getByTestId('UseTemplatesSlide')).toBeInTheDocument()
    expect(
      screen.getByTestId('UseThisTemplateButtonSkeleton')
    ).toBeInTheDocument()
  })

  it('renders correct number of cards on small breakpoints', async () => {
    ;(useMediaQuery as unknown as Mock).mockReturnValue(true)
    const steps = [
      {
        id: '1',
        children: [
          {
            __typename: 'CardBlock',
            showAssistant: null,
            expandChatByDefault: null
          }
        ]
      },
      {
        id: '2',
        children: [
          {
            __typename: 'CardBlock',
            showAssistant: null,
            expandChatByDefault: null
          }
        ]
      },
      {
        id: '3',
        children: [
          {
            __typename: 'CardBlock',
            showAssistant: null,
            expandChatByDefault: null
          }
        ]
      }
    ] as Array<TreeBlock<StepBlock>>

    render(
      <ThemeProvider theme={createTheme()}>
        <JourneyProvider value={{ journey }}>
          <TemplateCardPreview steps={steps} />
        </JourneyProvider>
      </ThemeProvider>
    )
    await waitFor(() =>
      expect(screen.getAllByTestId('TemplateCardsSwiperSlide')).toHaveLength(3)
    )
  })

  it('renders skeleton cards while loading', async () => {
    const steps = undefined

    render(
      <ThemeProvider theme={createTheme()}>
        <JourneyProvider value={{ journey }}>
          <TemplateCardPreview steps={steps} />
        </JourneyProvider>
      </ThemeProvider>
    )
    await waitFor(() =>
      expect(screen.getAllByTestId('TemplateCardSkeleton')).toHaveLength(7)
    )
  })

  describe('media variant', () => {
    it('should render all steps and not show more cards slide', async () => {
      const steps = [
        {
          id: '1',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: '2',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: '3',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: '4',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: '5',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: '6',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: '7',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: '8',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: '9',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: '10',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        }
      ] as Array<TreeBlock<StepBlock>>

      render(
        <ThemeProvider theme={createTheme()}>
          <JourneyProvider value={{ journey }}>
            <TemplateCardPreview steps={steps} variant="compact" />
          </JourneyProvider>
        </ThemeProvider>
      )
      await waitFor(() =>
        expect(screen.getAllByTestId('TemplateCardsSwiperSlide')).toHaveLength(
          10
        )
      )
      expect(screen.queryByTestId('UseTemplatesSlide')).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('UseThisTemplateButtonSkeleton')
      ).not.toBeInTheDocument()
    })

    it('should slide to selected step', async () => {
      const steps = [
        {
          id: '1',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: '2',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: '3',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        }
      ] as Array<TreeBlock<StepBlock>>

      render(
        <ThemeProvider theme={createTheme()}>
          <JourneyProvider value={{ journey }}>
            <TemplateCardPreview
              steps={steps}
              variant="compact"
              selectedStep={steps[1]}
            />
          </JourneyProvider>
        </ThemeProvider>
      )
      await waitFor(() => expect(mockSlideTo).toHaveBeenCalledWith(1, 500))
    })

    it('should size the card label to wrap instead of overflowing the card', async () => {
      const steps = [
        {
          id: '1',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: '2',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        }
      ] as Array<TreeBlock<StepBlock>>

      render(
        <ThemeProvider theme={createTheme()}>
          <JourneyProvider value={{ journey }}>
            <TemplateCardPreview
              steps={steps}
              variant="compact"
              selectedStep={steps[0]}
              cardLabel="Ketuk untuk melihat pratinjau"
            />
          </JourneyProvider>
        </ThemeProvider>
      )

      const label = await screen.findByText('Ketuk untuk melihat pratinjau')
      // Width is bound to the card slide (its positioned ancestor) so long
      // translations wrap onto a second line instead of overflowing past
      // the card's edges the way `whiteSpace: 'nowrap'` used to.
      expect(label).toHaveStyle({ width: '100%', overflowWrap: 'break-word' })
      expect(label).not.toHaveStyle({ whiteSpace: 'nowrap' })
      // The label must sit in normal document flow below the card, not be
      // absolutely positioned over it -- absolute positioning is what let a
      // wrapped (multi-line) label overlap the card's own content, since a
      // taller label grows upward from a `bottom: 0` anchor instead of
      // pushing layout below the card.
      expect(label).not.toHaveStyle({ position: 'absolute' })
      const card = screen.getAllByTestId('TemplateCardPreviewItem')[0]
      expect(
        card.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy()
    })
  })

  describe('guestPreview variant', () => {
    it('should render all steps and not show more cards slide', async () => {
      const steps = [
        {
          id: '1',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: '2',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: '3',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: '4',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: '5',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: '6',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: '7',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: '8',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: '9',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: '10',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        }
      ] as Array<TreeBlock<StepBlock>>

      render(
        <MockedProvider>
          <ThemeProvider theme={createTheme()}>
            <JourneyProvider value={{ journey, renderMode: 'admin' }}>
              <TemplateCardPreview steps={steps} variant="guestPreview" />
            </JourneyProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(screen.getAllByTestId('TemplateCardsSwiperSlide')).toHaveLength(
          10
        )
      )
      expect(screen.queryByTestId('UseTemplatesSlide')).not.toBeInTheDocument()
    })

    it('should accept initialStepId and render without error', async () => {
      const steps = [
        {
          id: 'step-1',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: 'step-2',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        },
        {
          id: 'step-3',
          children: [
            {
              __typename: 'CardBlock',
              showAssistant: null,
              expandChatByDefault: null
            }
          ]
        }
      ] as Array<TreeBlock<StepBlock>>

      render(
        <MockedProvider>
          <ThemeProvider theme={createTheme()}>
            <JourneyProvider value={{ journey, renderMode: 'admin' }}>
              <TemplateCardPreview
                steps={steps}
                variant="guestPreview"
                initialStepId="step-2"
              />
            </JourneyProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() =>
        expect(screen.getAllByTestId('TemplateCardsSwiperSlide')).toHaveLength(
          3
        )
      )
    })
  })
})
