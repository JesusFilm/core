<<<<<<< HEAD
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

  it('should render overlay label', () => {
    const { getByText, getByTestId } = renderWithStore(<Video {...block} />)
    expect(getByText('Choose a step to jump to')).toBeInTheDocument()
    expect(getByText('Step2')).toBeInTheDocument()
    expect(getByTestId('RadioQuestionCard')).toBeInTheDocument()
=======
import { render } from '@testing-library/react'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'
import { Video } from '.'

describe('BlockRendererVideo', () => {
  const block: TreeBlock<VideoBlock> = {
    __typename: 'VideoBlock',
    id: 'main',
    src: 'https://www.youtube.com',
    title: 'title',
    parentBlockId: null,
    provider: null,
    children: []
  }
  it('should render successfully', () => {
    const { getByText } = render(<Video {...block} />)

    expect(getByText('Render title Here')).toBeInTheDocument()
>>>>>>> main
  })
})
