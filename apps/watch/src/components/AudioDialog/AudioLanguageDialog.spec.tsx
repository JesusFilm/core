import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import {
  GetVideoLanguages_video_variant as Variant,
  GetVideoLanguages_video_variantLanguagesWithSlug as VariantLanguagesWithSlug
} from '../../../__generated__/GetVideoLanguages'
import { GET_VIDEO_LANGUAGES } from '../VideoContentPage/AudioLanguageButton'
import { AudioLanguageDialog } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('AudioLanguageDialog', () => {
  const variant: Variant = {
    id: '529',
    __typename: 'VideoVariant',
    language: {
      __typename: 'Language',
      name: [
        {
          value: 'English',
          primary: true,
          __typename: 'Translation'
        }
      ]
    }
  }

  const variantLanguagesWithSlug: VariantLanguagesWithSlug[] = [
    {
      __typename: 'LanguageWithSlug',
      slug: 'jesus/english',
      language: {
        id: '529',
        __typename: 'Language',
        name: [
          {
            value: 'English',
            primary: true,
            __typename: 'Translation'
          }
        ]
      }
    },
    {
      __typename: 'LanguageWithSlug',
      slug: 'jesus/french',
      language: {
        id: '496',
        __typename: 'Language',
        name: [
          {
            value: 'Français',
            primary: true,
            __typename: 'Translation'
          },
          {
            value: 'French',
            primary: false,
            __typename: 'Translation'
          }
        ]
      }
    },
    {
      __typename: 'LanguageWithSlug',
      slug: 'jesus/Deutsch',
      language: {
        id: '1106',
        __typename: 'Language',
        name: [
          {
            value: 'Deutsch',
            primary: true,
            __typename: 'Translation'
          },
          {
            value: 'German, Standard',
            primary: false,
            __typename: 'Translation'
          }
        ]
      }
    }
  ]

  const slug = 'jesus/english'
  const mocks = [
    {
      request: {
        query: GET_VIDEO_LANGUAGES,
        variables: {
          id: slug
        }
      },
      result: {
        data: {
          video: {
            id: '1_jf-0-0',
            variant,
            variantLanguagesWithSlug
          }
        }
      }
    }
  ]

  it('should sort langauge options alphabetically', async () => {
    const { getByRole, queryAllByRole } = render(
      <MockedProvider mocks={mocks}>
        <AudioLanguageDialog
          variant={variant}
          variantLanguagesWithSlug={variantLanguagesWithSlug}
          loading={false}
          open
          onClose={jest.fn()}
        />
      </MockedProvider>
    )
    await waitFor(() => fireEvent.focus(getByRole('textbox')))
    fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowDown' })
    expect(queryAllByRole('option')[0]).toHaveTextContent('English')
    expect(queryAllByRole('option')[1]).toHaveTextContent('French')
    expect(queryAllByRole('option')[2]).toHaveTextContent('German')
  })

  it('should set default value', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <AudioLanguageDialog
          variant={variant}
          variantLanguagesWithSlug={variantLanguagesWithSlug}
          loading={false}
          open
          onClose={jest.fn()}
        />
      </MockedProvider>
    )
    await waitFor(() => expect(getByRole('textbox')).toHaveValue('English'))
  })

  it('should redirect to the selected language', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const { getByRole, queryAllByRole } = render(
      <MockedProvider mocks={mocks}>
        <AudioLanguageDialog
          variant={variant}
          variantLanguagesWithSlug={variantLanguagesWithSlug}
          loading={false}
          open
          onClose={jest.fn()}
        />
      </MockedProvider>
    )
    await waitFor(() => fireEvent.focus(getByRole('textbox')))
    fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowDown' })
    expect(queryAllByRole('option')[1]).toHaveTextContent('French')
    fireEvent.click(queryAllByRole('option')[1])
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/jesus/french')
    })
  })
})
