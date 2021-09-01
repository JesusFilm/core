import { renderWithStore } from '../../../test/testingLibrary'
import { BlockRenderer } from '.'
import { RadioOptionType, RadioQuestionType, StepType, VideoType } from '../../types'

describe('BlockRenderer', () => {
  it('should render RadioOption', () => {
    const block: RadioOptionType = {
      __typename: 'RadioOption',
      id: 'main',
      label: 'radio option'
    }
    const { getByText } = renderWithStore(<BlockRenderer {...block} />)
    expect(getByText('radio option')).toBeInTheDocument()
  })

  it('should render RadioQuestion', () => {
    const block: RadioQuestionType = {
      __typename: 'RadioQuestion',
      id: 'main',
      label: 'radio question'
    }
    const { getByText } = renderWithStore(<BlockRenderer {...block} />)
    expect(getByText('radio question')).toBeInTheDocument()
  })

  it('should render Step', () => {
    const block: StepType = {
      __typename: 'Step',
      id: 'main',
      children: [{
        __typename: 'RadioQuestion',
        id: 'main',
        label: 'radio question'
      }]
    }
    const { getByText } = renderWithStore(<BlockRenderer {...block} />)
    expect(getByText('radio question')).toBeInTheDocument()
  })

  it('should render Video', () => {
    const block: VideoType = {
      __typename: 'Video',
      id: 'main',
      src: 'https://www.youtube.com'
    }
    const { getByText } = renderWithStore(<BlockRenderer {...block} />)
    expect(getByText('Render Video Here')).toBeInTheDocument()
  })
})
