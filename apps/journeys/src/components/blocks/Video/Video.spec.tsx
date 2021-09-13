import { renderWithStore } from '../../../../test/testingLibrary'
import { VideoType } from '../../../types'
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
  children: []
  // children: [
  //   {
  //     __typename: 'RadioQuestion',
  //     label: 'Choose a step to jump to',
  //     id: 'Question1',
  //     variant: 'light',
  //     parent: {
  //       id: 'Video1'
  //     },
  //     children: [
  //       {
  //         __typename: 'RadioOption',
  //         id: 'Option1',
  //         label: 'Step2',
  //         parent: {
  //           id: 'Question1'
  //         }
  //       },
  //       {
  //         __typename: 'RadioOption',
  //         id: 'Option2',
  //         label: 'No Step',
  //         parent: {
  //           id: 'Question1'
  //         }
  //       }
  //     ]
  //   }
  // ]
}

// const blocks: TreeBlock<VideoBlock> = {
//   __typename: 'VideoBlock',
//   id: 'main',
//   src: 'https://www.youtube.com',
//   title: 'title',
//   parentBlockId: null,
//   provider: null,
//   children: []
// }

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
  })

  it('should render successfully', () => {
    const { getByText } = renderWithStore(<Video {...block} />)
    expect(getByText('Render title Here')).toBeInTheDocument()
  })
})
