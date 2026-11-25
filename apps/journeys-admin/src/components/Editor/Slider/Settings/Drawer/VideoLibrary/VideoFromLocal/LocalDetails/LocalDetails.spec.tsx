import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { print } from 'graphql'
import { SnackbarProvider } from 'notistack'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../__generated__/BlockFields'
import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'

import { GET_VIDEO, LocalDetails } from './LocalDetails'

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: vi.fn()
}))

describe('LocalDetails', () => {
  const getVideoMock = {
    request: {
      query: GET_VIDEO,
      variables: {
        id: '2_Acts7302-0-0',
        languageId: '529'
      }
    },
    result: {
      data: {
        video: {
          id: '2_Acts7302-0-0',
          primaryLanguageId: '529',
          images: [
            {
              __typename: 'CloudflareImage',
              mobileCinematicHigh:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
            }
          ],
          title: [
            {
              primary: true,
              value: 'Jesus Taken Up Into Heaven'
            }
          ],
          description: [
            {
              primary: true,
              value: 'Jesus promises the Holy Spirit.'
            }
          ],
          variant: {
            id: 'variantA',
            duration: 144,
            hls: 'https://arc.gt/opsgn',
            published: true
          },
          variantLanguages: [
            {
              __typename: 'Language',
              id: '529',
              name: [
                {
                  value: 'English',
                  primary: true,
                  __typename: 'LanguageName'
                }
              ]
            }
          ]
        }
      }
    }
  }

  it('should request the variant without a published-only filter', () => {
    // variantLanguages (below) has no publish filter, so the language picker
    // already lists unpublished languages. If variant(languageId:) reverts to
    // its published-only default, it resolves null for exactly those
    // languages, duration/hls fall back to empty, and commitSelection writes
    // a zero-length clip (see LocalDetails.tsx variant() usage). Pinning the
    // literal query argument here fails loudly on that regression, since the
    // MockedProvider tests below cannot: they import GET_VIDEO directly, so
    // they'd match a reverted query just as happily.
    expect(print(GET_VIDEO)).toContain('onlyPublished: false')
  })

  it('should render details of a video', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider mocks={[getVideoMock]}>
        <LocalDetails id="2_Acts7302-0-0" open onSelect={vi.fn()} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        getByRole('heading', { name: 'Jesus Taken Up Into Heaven' })
      ).toBeInTheDocument()
    )
    expect(getByText('Jesus promises the Holy Spirit.')).toBeInTheDocument()
    const videoPlayer = getByRole('region', {
      name: 'Video Player'
    })
    const sourceTag = videoPlayer.querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toBe('https://arc.gt/opsgn')
    expect(sourceTag?.getAttribute('type')).toBe('application/x-mpegURL')
    const imageTag = videoPlayer.querySelector('.vjs-poster > picture > img')
    expect(imageTag?.getAttribute('src')).toBe(
      'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
    )
  })

  it('should open the languages drawer on language button click', () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <LocalDetails id="2_Acts7302-0-0" open onSelect={vi.fn()} />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'English' }))
    expect(getByText('Available Languages')).toBeInTheDocument()
  })

  it('should render variant language', async () => {
    const result = vi.fn(() => ({
      data: {
        video: {
          id: '2_Acts7302-0-0',
          primaryLanguageId: '529',
          images: [
            {
              __typename: 'CloudflareImage',
              mobileCinematicHigh:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
            }
          ],
          title: [
            {
              primary: true,
              value: 'Jesus Taken Up Into Heaven'
            }
          ],
          description: [
            {
              primary: true,
              value: 'Jesus promises the Holy Spirit.'
            }
          ],
          variant: {
            id: 'variantA',
            duration: 144,
            hls: 'https://arc.gt/opsgn',
            published: true
          },
          variantLanguages: [
            {
              __typename: 'Language',
              id: '525',
              name: [
                {
                  value: 'Algerian',
                  primary: true,
                  __typename: 'LanguageName'
                }
              ]
            }
          ]
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_VIDEO,
              variables: {
                id: '2_Acts7302-0-0',
                languageId: '525'
              }
            },
            result
          }
        ]}
      >
        <EditorProvider
          initialState={{
            selectedBlock: {
              id: 'videoId',
              videoId: '2_Acts7302-0-0',
              source: VideoBlockSource.internal,
              duration: 144,
              startAt: 0,
              endAt: 0,
              videoVariantLanguageId: '525',
              mediaVideo: {
                __typename: 'Video',
                id: '2_Acts7302-0-0'
              }
            } as unknown as TreeBlock<VideoBlock>
          }}
        >
          <LocalDetails id="2_Acts7302-0-0" open onSelect={vi.fn()} />
        </EditorProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Algerian' })).toBeInTheDocument()
    )
    expect(result).toHaveBeenCalled()
  })

  it('should call onSelect on select click', async () => {
    const onSelect = vi.fn()
    const result = vi.fn().mockReturnValue(getVideoMock.result)
    const { getByRole } = render(
      <MockedProvider mocks={[{ ...getVideoMock, result }]}>
        <LocalDetails id="2_Acts7302-0-0" open onSelect={onSelect} />
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Select' }))
    expect(onSelect).toHaveBeenCalledWith({
      duration: 144,
      endAt: 144,
      startAt: 0,
      source: VideoBlockSource.internal,
      videoId: '2_Acts7302-0-0',
      videoVariantLanguageId: '529'
    })
  })

  it('should disable select button if loading', async () => {
    const onSelect = vi.fn()
    const result = vi.fn().mockReturnValue(getVideoMock.result)
    const { getByRole } = render(
      <MockedProvider mocks={[{ ...getVideoMock, result }]}>
        <LocalDetails id="2_Acts7302-0-0" open onSelect={onSelect} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Select' })).toBeDisabled()
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(getByRole('button', { name: 'Select' })).not.toBeDisabled()
  })

  it('should pin the select button width so a long language name cannot squeeze it', async () => {
    const result = vi.fn().mockReturnValue(getVideoMock.result)
    render(
      <MockedProvider mocks={[{ ...getVideoMock, result }]}>
        <LocalDetails id="2_Acts7302-0-0" open onSelect={vi.fn()} />
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    // The chip label is an arbitrarily long language name, so the chip must be
    // the flex item that gives way. Without flexShrink: 0 the Select button
    // collapses to MUI's 64px min-width floor and its label wraps onto two
    // lines — visible in CJK locales, where text can break between characters.
    //
    // Only the button is asserted: jsdom reports min-width as 0px by default,
    // so an equivalent assertion on the chip would pass whether or not the
    // style is present. The chip side is verified visually in Storybook.
    expect(screen.getByRole('button', { name: 'Select' })).toHaveStyle({
      flexShrink: 0
    })
  })

  it('should commit the language change and close the picker when Apply is clicked', async () => {
    const onSelect = vi.fn()
    const result = vi.fn().mockReturnValue(getVideoMock.result)
    render(
      <MockedProvider mocks={[{ ...getVideoMock, result }]}>
        <LocalDetails id="2_Acts7302-0-0" open onSelect={onSelect} />
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    // open the language picker
    fireEvent.click(screen.getByRole('button', { name: 'English' }))
    expect(screen.getByText('Available Languages')).toBeInTheDocument()
    const applyButton = screen.getByRole('button', { name: 'Apply' })
    expect(applyButton).toBeVisible()
    // click Apply: commits the language change and dismisses the picker
    fireEvent.click(applyButton)
    expect(onSelect).toHaveBeenCalledWith({
      duration: 144,
      endAt: 144,
      startAt: 0,
      source: VideoBlockSource.internal,
      videoId: '2_Acts7302-0-0',
      videoVariantLanguageId: '529'
    })
    // the language picker drawer is dismissed (its Apply button is no longer
    // visible once the transition starts)
    await waitFor(() => expect(applyButton).not.toBeVisible())
  })

  it('should commit the matching language id (not the video id) when Apply is clicked on an existing video block without changing language', async () => {
    const onSelect = vi.fn()
    const result = vi.fn().mockReturnValue(getVideoMock.result)
    render(
      <MockedProvider mocks={[{ ...getVideoMock, result }]}>
        <EditorProvider
          initialState={{
            selectedBlock: {
              id: 'videoId',
              videoId: '2_Acts7302-0-0',
              source: VideoBlockSource.internal,
              duration: 144,
              startAt: 7,
              endAt: 60,
              videoVariantLanguageId: '529',
              mediaVideo: {
                __typename: 'Video',
                id: '2_Acts7302-0-0'
              }
            } as unknown as TreeBlock<VideoBlock>
          }}
        >
          <LocalDetails id="2_Acts7302-0-0" open onSelect={onSelect} />
        </EditorProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    // chip reflects the matched language (English) from variantLanguages
    fireEvent.click(screen.getByRole('button', { name: 'English' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    // videoVariantLanguageId must be the language id ('529'), not the video id
    // ('2_Acts7302-0-0'). Pre-fix, getVideoVariantLanguage returned the video
    // id by mistake; this test pins the correct shape on the Apply path.
    expect(onSelect).toHaveBeenCalledWith({
      duration: 144,
      endAt: 60,
      startAt: 7,
      source: VideoBlockSource.internal,
      videoId: '2_Acts7302-0-0',
      videoVariantLanguageId: '529'
    })
  })

  it('should keep startAt and endAt values if already exist on select click', async () => {
    const onSelect = vi.fn()
    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider
          initialState={{
            selectedBlock: {
              id: 'videoId',
              videoId: '2_Acts7302-0-0',
              source: VideoBlockSource.internal,
              duration: 0,
              startAt: 5,
              endAt: 41,
              videoVariantLanguageId: '529',
              mediaVideo: {
                __typename: 'Video',
                id: '2_Acts7302-0-0'
              }
            } as unknown as TreeBlock<VideoBlock>
          }}
        >
          <LocalDetails id="2_Acts7302-0-0" open onSelect={onSelect} />
        </EditorProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Select' })).toBeEnabled()
    )
    fireEvent.click(getByRole('button', { name: 'Select' }))
    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith({
        duration: 0,
        endAt: 41,
        startAt: 5,
        source: VideoBlockSource.internal,
        videoId: '2_Acts7302-0-0',
        videoVariantLanguageId: '529'
      })
    )
  })

  describe('unpublished variant', () => {
    const unpublishedMock = {
      request: {
        query: GET_VIDEO,
        variables: {
          id: '2_Acts7302-0-0',
          languageId: '529'
        }
      },
      result: {
        data: {
          video: {
            ...getVideoMock.result.data.video,
            variant: {
              id: 'variantA',
              duration: 144,
              hls: 'https://arc.gt/opsgn',
              published: false
            }
          }
        }
      }
    }

    it('should show a banner explaining the video is unpublished', async () => {
      const { getByText } = render(
        <SnackbarProvider>
          <MockedProvider mocks={[unpublishedMock]}>
            <LocalDetails id="2_Acts7302-0-0" open onSelect={vi.fn()} />
          </MockedProvider>
        </SnackbarProvider>
      )
      await waitFor(() => expect(getByText('Unpublished')).toBeInTheDocument())
    })

    it('should not show the banner for a published variant', async () => {
      const { getByRole, queryByText } = render(
        <SnackbarProvider>
          <MockedProvider mocks={[getVideoMock]}>
            <LocalDetails id="2_Acts7302-0-0" open onSelect={vi.fn()} />
          </MockedProvider>
        </SnackbarProvider>
      )
      await waitFor(() =>
        expect(
          getByRole('heading', { name: 'Jesus Taken Up Into Heaven' })
        ).toBeInTheDocument()
      )
      expect(queryByText('Unpublished')).not.toBeInTheDocument()
    })

    it('should block the select until the unpublished warning is confirmed', async () => {
      const onSelect = vi.fn()
      const { findByText, getByRole, getByText, queryByText } = render(
        <SnackbarProvider>
          <MockedProvider mocks={[unpublishedMock]}>
            <LocalDetails id="2_Acts7302-0-0" open onSelect={onSelect} />
          </MockedProvider>
        </SnackbarProvider>
      )
      await waitFor(() => expect(getByText('Unpublished')).toBeInTheDocument())

      fireEvent.click(getByRole('button', { name: 'Select' }))
      expect(onSelect).not.toHaveBeenCalled()
      expect(await findByText('Unpublished Video')).toBeInTheDocument()

      fireEvent.click(getByRole('button', { name: 'Use Anyway' }))
      expect(onSelect).toHaveBeenCalledWith({
        duration: 144,
        endAt: 144,
        startAt: 0,
        source: VideoBlockSource.internal,
        videoId: '2_Acts7302-0-0',
        videoVariantLanguageId: '529'
      })
      await waitFor(() =>
        expect(queryByText('Unpublished Video')).not.toBeInTheDocument()
      )
    })

    it('should not select when the unpublished warning is cancelled', async () => {
      const onSelect = vi.fn()
      const { findByText, getByRole, getByText, queryByText } = render(
        <SnackbarProvider>
          <MockedProvider mocks={[unpublishedMock]}>
            <LocalDetails id="2_Acts7302-0-0" open onSelect={onSelect} />
          </MockedProvider>
        </SnackbarProvider>
      )
      await waitFor(() => expect(getByText('Unpublished')).toBeInTheDocument())

      fireEvent.click(getByRole('button', { name: 'Select' }))
      expect(await findByText('Unpublished Video')).toBeInTheDocument()

      fireEvent.click(getByRole('button', { name: 'Cancel' }))
      expect(onSelect).not.toHaveBeenCalled()
      await waitFor(() =>
        expect(queryByText('Unpublished Video')).not.toBeInTheDocument()
      )
    })

    describe('language switching', () => {
      const frenchLanguage = {
        __typename: 'Language',
        id: '496',
        name: [
          { value: 'Français', primary: true, __typename: 'LanguageName' },
          { value: 'French', primary: false, __typename: 'LanguageName' }
        ]
      }
      const withVariant = (published: boolean, languageId: string) => ({
        request: {
          query: GET_VIDEO,
          variables: { id: '2_Acts7302-0-0', languageId }
        },
        result: {
          data: {
            video: {
              ...getVideoMock.result.data.video,
              variant: {
                id: `variant-${languageId}`,
                duration: 144,
                hls: 'https://arc.gt/opsgn',
                published
              },
              variantLanguages: [
                ...getVideoMock.result.data.video.variantLanguages,
                frenchLanguage
              ]
            }
          }
        }
      })

      async function applyFrench(): Promise<void> {
        fireEvent.click(await screen.findByRole('button', { name: 'English' }))
        const combobox = screen.getByRole('combobox')
        fireEvent.focus(combobox)
        fireEvent.keyDown(combobox, { key: 'ArrowDown' })
        fireEvent.click(
          await screen.findByRole('option', { name: 'French Français' })
        )
        // Select is disabled while the picked language's variant is looked up
        expect(screen.getByRole('button', { name: 'Select' })).toBeDisabled()
        await waitFor(() =>
          expect(screen.getByRole('button', { name: 'Select' })).toBeEnabled()
        )
        fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
      }

      it('should disable Apply while the picked language publish status is being checked', async () => {
        render(
          <SnackbarProvider>
            <MockedProvider
              mocks={[withVariant(true, '529'), withVariant(false, '496')]}
            >
              <LocalDetails id="2_Acts7302-0-0" open onSelect={vi.fn()} />
            </MockedProvider>
          </SnackbarProvider>
        )
        fireEvent.click(await screen.findByRole('button', { name: 'English' }))
        const combobox = screen.getByRole('combobox')
        fireEvent.focus(combobox)
        fireEvent.keyDown(combobox, { key: 'ArrowDown' })
        fireEvent.click(
          await screen.findByRole('option', { name: 'French Français' })
        )

        // Apply mirrors Select's disabled state while the picked language's
        // variant is still being looked up, rather than silently no-opping
        expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
        await waitFor(() =>
          expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()
        )
      })

      it('should warn when the picked language is unpublished but the loaded one is published', async () => {
        const onSelect = vi.fn()
        render(
          <SnackbarProvider>
            <MockedProvider
              mocks={[withVariant(true, '529'), withVariant(false, '496')]}
            >
              <LocalDetails id="2_Acts7302-0-0" open onSelect={onSelect} />
            </MockedProvider>
          </SnackbarProvider>
        )
        await applyFrench()
        expect(await screen.findByText('Unpublished Video')).toBeInTheDocument()
        expect(onSelect).not.toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button', { name: 'Use Anyway' }))
        expect(onSelect).toHaveBeenCalledWith(
          expect.objectContaining({ videoVariantLanguageId: '496' })
        )
      })

      it('should show the banner for the picked language, not the loaded one', async () => {
        render(
          <SnackbarProvider>
            <MockedProvider
              mocks={[withVariant(true, '529'), withVariant(false, '496')]}
            >
              <LocalDetails id="2_Acts7302-0-0" open onSelect={vi.fn()} />
            </MockedProvider>
          </SnackbarProvider>
        )
        fireEvent.click(await screen.findByRole('button', { name: 'English' }))
        expect(screen.queryByText('Unpublished')).not.toBeInTheDocument()
        const combobox = screen.getByRole('combobox')
        fireEvent.focus(combobox)
        fireEvent.keyDown(combobox, { key: 'ArrowDown' })
        fireEvent.click(
          await screen.findByRole('option', { name: 'French Français' })
        )
        expect(await screen.findByText('Unpublished')).toBeInTheDocument()
      })

      it('should not warn when the picked language is published but the loaded one is unpublished', async () => {
        const onSelect = vi.fn()
        render(
          <SnackbarProvider>
            <MockedProvider
              mocks={[withVariant(false, '529'), withVariant(true, '496')]}
            >
              <LocalDetails id="2_Acts7302-0-0" open onSelect={onSelect} />
            </MockedProvider>
          </SnackbarProvider>
        )
        await applyFrench()
        await waitFor(() =>
          expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({ videoVariantLanguageId: '496' })
          )
        )
        expect(screen.queryByText('Unpublished Video')).not.toBeInTheDocument()
      })

      it('should offer a retry when the published lookup for the picked language fails', async () => {
        const erroredLookup = {
          request: {
            query: GET_VIDEO,
            variables: { id: '2_Acts7302-0-0', languageId: '496' }
          },
          error: new Error('Network error')
        }
        render(
          <SnackbarProvider>
            <MockedProvider
              mocks={[
                withVariant(true, '529'),
                erroredLookup,
                withVariant(false, '496')
              ]}
            >
              <LocalDetails id="2_Acts7302-0-0" open onSelect={vi.fn()} />
            </MockedProvider>
          </SnackbarProvider>
        )
        fireEvent.click(await screen.findByRole('button', { name: 'English' }))
        const combobox = screen.getByRole('combobox')
        fireEvent.focus(combobox)
        fireEvent.keyDown(combobox, { key: 'ArrowDown' })
        fireEvent.click(
          await screen.findByRole('option', { name: 'French Français' })
        )

        // the lookup failed: Select stays disabled rather than resolving to
        // either published or unpublished, and a retry affordance appears
        // instead of leaving the user stuck with only a one-shot snackbar
        const retryButton = await screen.findByRole('button', {
          name: 'Retry'
        })
        expect(
          screen.getByText("Couldn't verify this language's publish status")
        ).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Select' })).toBeDisabled()

        fireEvent.click(retryButton)
        await waitFor(() =>
          expect(screen.getByRole('button', { name: 'Select' })).toBeEnabled()
        )
        expect(
          screen.queryByText("Couldn't verify this language's publish status")
        ).not.toBeInTheDocument()
      })

      it('should not reuse a stale lookup when re-picking an already-checked language', async () => {
        render(
          <SnackbarProvider>
            <MockedProvider
              mocks={[
                withVariant(true, '529'),
                withVariant(false, '496'),
                {
                  request: {
                    query: GET_VIDEO,
                    variables: { id: '2_Acts7302-0-0', languageId: '496' }
                  },
                  error: new Error('Network error')
                }
              ]}
            >
              <LocalDetails id="2_Acts7302-0-0" open onSelect={vi.fn()} />
            </MockedProvider>
          </SnackbarProvider>
        )

        fireEvent.click(await screen.findByRole('button', { name: 'English' }))
        const combobox = screen.getByRole('combobox')
        fireEvent.focus(combobox)
        fireEvent.keyDown(combobox, { key: 'ArrowDown' })
        fireEvent.click(
          await screen.findByRole('option', { name: 'French Français' })
        )
        await waitFor(() =>
          expect(screen.getByRole('button', { name: 'Select' })).toBeEnabled()
        )

        // switch back to the loaded language, then re-pick French: this
        // re-triggers the lookup for a language that already has a (now
        // stale) cached result
        fireEvent.focus(combobox)
        fireEvent.keyDown(combobox, { key: 'ArrowDown' })
        fireEvent.click(await screen.findByRole('option', { name: 'English' }))
        fireEvent.focus(combobox)
        fireEvent.keyDown(combobox, { key: 'ArrowDown' })
        fireEvent.click(
          await screen.findByRole('option', { name: 'French Français' })
        )

        // the new lookup is in flight: Select must not resolve to the
        // previous lookup's result while it's pending
        expect(screen.getByRole('button', { name: 'Select' })).toBeDisabled()

        // the new lookup fails: Select stays disabled alongside the error,
        // rather than falling back to the earlier, now-stale result
        await waitFor(() =>
          expect(
            screen.getByText("Couldn't verify this language's publish status")
          ).toBeInTheDocument()
        )
        expect(screen.getByRole('button', { name: 'Select' })).toBeDisabled()
      })
    })
  })
})
