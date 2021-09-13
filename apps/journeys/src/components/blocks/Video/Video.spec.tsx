import { renderWithStore } from '../../../../test/testingLibrary'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'
import { Video } from '.'

const block: TreeBlock<VideoBlock> = {
  __typename: 'VideoBlock',
  id: 'Video1',
  parentBlockId: '',
  src: 'https://playertest.longtailvideo.com/adaptive/elephants_dream_v4/index.m3u8',
  title: 'Video',
  provider: null,
  children: [
    {
      __typename: 'RadioQuestionBlock',
      label: 'Choose a step to jump to',
      description: 'This is a description',
      id: 'Question1',
      variant: null,
      parentBlockId: 'Video1',
      children: [
        {
          __typename: 'RadioOptionBlock',
          id: 'Option1',
          label: 'Step2',
          parentBlockId: 'Question1',
          action: null,
          children: []
        },
        {
          __typename: 'RadioOptionBlock',
          id: 'Option2',
          label: 'No Step',
          parentBlockId: 'Question1',
          action: null,
          children: []
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

  // Tests if overlay shows on video
  // Test won't work until database schema is updated
  it('should render overlay label', () => {
    const { getByText, getByTestId } = renderWithStore(<Video {...block} />)
    expect(getByText('Choose a step to jump to')).toBeInTheDocument()
    expect(getByText('Step2')).toBeInTheDocument()
    expect(getByTestId('RadioQuestionCard')).toBeInTheDocument()
  })
})
