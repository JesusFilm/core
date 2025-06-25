import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../__generated__/BlockFields'
import { SearchUnsplashPhotos_searchUnsplashPhotos_results as Result } from '../../../../../../../../../__generated__/SearchUnsplashPhotos'
import {
  TriggerUnsplashDownload,
  TriggerUnsplashDownloadVariables
} from '../../../../../../../../../__generated__/TriggerUnsplashDownload'
import { ThemeProvider } from '../../../../../../../ThemeProvider'

import { TRIGGER_UNSPLASH_DOWNLOAD, UnsplashList } from './UnsplashList'

describe('UnsplashList', () => {
  const item: Result = {
    id: '1',
    alt_description: 'white dome building during daytime',
    blur_hash: 'LEA,%vRjE1ay.AV@WAj@tnoef5ju',
    width: 3096,
    height: 4242,
    urls: {
      raw: 'https://images.unsplash.com/photo-1?ixid=1',
      regular: 'https://images.unsplash.com/photo-1?ixid=1&q=80&w=1080',
      __typename: 'UnsplashPhotoUrls'
    },
    links: {
      download_location: 'https://api.unsplash.com/photos/1/download?ixid=1',
      __typename: 'UnsplashPhotoLinks'
    },
    user: {
      first_name: 'Levi Meir',
      last_name: 'Clancy',
      username: 'levimeirclancy',
      __typename: 'UnsplashUser'
    },
    __typename: 'UnsplashPhoto'
  }

  const triggerUnsplashDownloadMock: MockedResponse<
    TriggerUnsplashDownload,
    TriggerUnsplashDownloadVariables
  > = {
    request: {
      query: TRIGGER_UNSPLASH_DOWNLOAD,
      variables: {
        url: 'https://api.unsplash.com/photos/1/download?ixid=1'
      }
    },
    result: {
      data: {
        triggerUnsplashDownload: true
      }
    }
  }

  it('should call onChange on image click', async () => {
    const onChange = jest.fn()
    render(
      <MockedProvider mocks={[triggerUnsplashDownloadMock]}>
        <ThemeProvider>
          <UnsplashList gallery={[item]} onChange={onChange} />
        </ThemeProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onChange).toHaveBeenCalledWith({
      alt: 'white dome building during daytime',
      blurhash: 'LEA,%vRjE1ay.AV@WAj@tnoef5ju',
      height: 1480,
      src: 'https://images.unsplash.com/photo-1?ixid=1&q=80&w=1080',
      width: 1080,
      scale: 100,
      focalLeft: 50,
      focalTop: 50
    })
  })

  it('should highlight selected block', async () => {
    render(
      <MockedProvider>
        <ThemeProvider>
          <UnsplashList
            selectedBlock={{ src: item.urls.regular } as unknown as ImageBlock}
            gallery={[item]}
            onChange={jest.fn()}
          />
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getByTestId('image-1')).toHaveStyle(
        'outline-color: #C52D3A'
      )
    )
  })
})
