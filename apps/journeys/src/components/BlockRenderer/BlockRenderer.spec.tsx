import { renderWithApolloClient } from '../../../test/testingLibrary'
import { BlockRenderer } from '.'
import { TreeBlock } from '../../libs/transformer/transformer'

describe('BlockRenderer', () => {
  it('should render Button', () => {
    const block: TreeBlock = {
      __typename: 'ButtonBlock',
      id: 'button',
      parentBlockId: 'question',
      label: 'Click to continue',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIcon: null,
      endIcon: null,
      action: null,
      children: []
    }
    const { getByText } = renderWithApolloClient(<BlockRenderer {...block} />)
    expect(getByText('Click to continue')).toBeInTheDocument()
  })

  it('should render Card', () => {
    const block: TreeBlock = {
      __typename: 'CardBlock',
      id: 'step',
      parentBlockId: null,
      backgroundColor: null,
      coverBlockId: null,
      themeMode: null,
      themeName: null,
      children: [
        {
          __typename: 'RadioQuestionBlock',
          id: 'question',
          label: 'radio question',
          parentBlockId: 'step',
          description: 'description',
          children: []
        }
      ]
    }
    const { getByText } = renderWithApolloClient(<BlockRenderer {...block} />)
    expect(getByText('radio question')).toBeInTheDocument()
  })

  it('should render Image', () => {
    const block: TreeBlock = {
      __typename: 'ImageBlock',
      id: 'main',
      src: 'https://source.unsplash.com/random/1920x1080',
      alt: 'random image from unsplash',
      width: 1920,
      height: 1080,
      parentBlockId: null,
      children: []
    }
    const { getByRole } = renderWithApolloClient(<BlockRenderer {...block} />)
    expect(getByRole('img')).toHaveAttribute(
      'alt',
      'random image from unsplash'
    )
  })

  it('should render RadioOption', () => {
    const block: TreeBlock = {
      __typename: 'RadioOptionBlock',
      id: 'main',
      label: 'radio option',
      parentBlockId: null,
      action: null,
      children: []
    }
    const { getByText } = renderWithApolloClient(<BlockRenderer {...block} />)
    expect(getByText('radio option')).toBeInTheDocument()
  })

  it('should render RadioQuestion', () => {
    const block: TreeBlock = {
      __typename: 'RadioQuestionBlock',
      id: 'main',
      label: 'radio question',
      parentBlockId: null,
      description: 'description',
      children: []
    }
    const { getByText } = renderWithApolloClient(<BlockRenderer {...block} />)
    expect(getByText('radio question')).toBeInTheDocument()
  })

  it('should render Step', () => {
    const block: TreeBlock = {
      __typename: 'StepBlock',
      id: 'step',
      parentBlockId: null,
      nextBlockId: null,
      locked: false,
      children: [
        {
          __typename: 'RadioQuestionBlock',
          id: 'question',
          label: 'radio question',
          parentBlockId: 'step',
          description: 'description',
          children: []
        }
      ]
    }
    const { getByText } = renderWithApolloClient(<BlockRenderer {...block} />)
    expect(getByText('radio question')).toBeInTheDocument()
  })

  it('should render Typography', () => {
    const block: TreeBlock = {
      id: 'typographyBlockId1',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      align: null,
      color: null,
      content: 'How did we get here?',
      variant: null,
      children: []
    }
    const { getByText } = renderWithApolloClient(<BlockRenderer {...block} />)
    expect(getByText('How did we get here?')).toBeInTheDocument()
  })

  it('should render Video', () => {
    const block: TreeBlock = {
      __typename: 'VideoBlock',
      id: 'main',
      src: 'https://www.youtube.com',
      title: 'title',
      volume: 0,
      autoplay: false,
      parentBlockId: null,
      children: []
    }
    const { getByTestId } = renderWithApolloClient(<BlockRenderer {...block} />)
    expect(getByTestId('VideoComponent')).toBeInTheDocument()
  })
})
