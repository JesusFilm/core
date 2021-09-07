import { renderWithStore } from '../../../../test/testingLibrary'
import { VideoType } from '../../../types'
import { Video } from '.'

const block: VideoType = {
  __typename: 'Video',
  id: 'Video1',
  sources: [
    {
      src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8'
    }
  ],
  children: [
    {
      __typename: 'RadioQuestion',
      label: 'Choose a step to jump to',
      id: 'Question1',
      variant: 'light',
      parent: {
        id: 'Video1'
      },
      children: [
        {
          __typename: 'RadioOption',
          id: 'Option1',
          label: 'Step2',
          parent: {
            id: 'Question1'
          }
        },
        {
          __typename: 'RadioOption',
          id: 'Option2',
          label: 'No Step',
          action: 'Step3',
          parent: {
            id: 'Question1'
          }
        }
      ]
    }
  ]
}

describe('VideoComponent', () => {
  it('should render the video successfully', () => {
    const { getByTestId } = renderWithStore(<Video {...block} />)
    expect(getByTestId('VideoComponent')).toBeInTheDocument()
  })
})
