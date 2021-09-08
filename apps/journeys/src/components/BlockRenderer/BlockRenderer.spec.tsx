import { renderWithStore } from '../../../test/testingLibrary'
import { BlockRenderer } from '.'
import { TreeBlock } from '../../libs/transformer/transformer'

describe('BlockRenderer', () => {
  it('should render RadioOption', () => {
    const block: TreeBlock = {
      __typename: 'RadioOptionBlock',
      id: 'main',
      label: 'radio option',
      parentBlockId: null,
      image: null,
      children: []
    }
    const { getByText } = renderWithStore(<BlockRenderer {...block} />)
    expect(getByText('radio option')).toBeInTheDocument()
  })

  it('should render RadioQuestion', () => {
    const block: TreeBlock = {
      __typename: 'RadioQuestionBlock',
      id: 'main',
      label: 'radio question',
      parentBlockId: null,
      description: 'description',
      variant: null,
      children: []
    }
    const { getByText } = renderWithStore(<BlockRenderer {...block} />)
    expect(getByText('radio question')).toBeInTheDocument()
  })

  it('should render Step', () => {
    const block: TreeBlock = {
      __typename: 'StepBlock',
      id: 'step',
      parentBlockId: null,
      children: [{
        __typename: 'RadioQuestionBlock',
        id: 'question',
        label: 'radio question',
        parentBlockId: 'step',
        description: 'description',
        variant: null,
        children: []
      }]
    }
    const { getByText } = renderWithStore(<BlockRenderer {...block} />)
    expect(getByText('radio question')).toBeInTheDocument()
  })

  it('should render Video', () => {
    const block: TreeBlock = {
      __typename: 'VideoBlock',
      id: 'main',
      src: 'https://www.youtube.com',
      title: 'title',
      parentBlockId: null,
      provider: null,
      children: []
    }
    const { getByText } = renderWithStore(<BlockRenderer {...block} />)
    expect(getByText('Render title Here')).toBeInTheDocument()
  })
})
