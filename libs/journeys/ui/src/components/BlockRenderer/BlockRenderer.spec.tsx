import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { TreeBlock } from '../..'
import { BlockRenderer } from '.'

describe('BlockRenderer', () => {
  it('should render Button', () => {
    const block: TreeBlock = {
      __typename: 'ButtonBlock',
      id: 'button',
      journeyId: 'journey1.id',
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
    const { getByText } = render(<BlockRenderer {...block} />)
    expect(getByText('Click to continue')).toBeInTheDocument()
  })

  it('should render Card', () => {
    const block: TreeBlock = {
      __typename: 'CardBlock',
      id: 'step',
      journeyId: 'journey1.id',
      parentBlockId: null,
      backgroundColor: null,
      coverBlockId: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: [
        {
          __typename: 'RadioQuestionBlock',
          id: 'question',
          journeyId: 'journey1.id',
          label: 'radio question',
          parentBlockId: 'step',
          description: 'description',
          children: []
        }
      ]
    }
    const { getByText } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BlockRenderer {...block} />
      </MockedProvider>
    )
    expect(getByText('radio question')).toBeInTheDocument()
  })

  it('should render Image', () => {
    const block: TreeBlock = {
      __typename: 'ImageBlock',
      id: 'main',
      journeyId: 'journey1.id',
      src: 'https://source.unsplash.com/random/1920x1080',
      alt: 'random image from unsplash',
      width: 1920,
      height: 1080,
      parentBlockId: null,
      blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
      children: []
    }
    const { getByRole } = render(<BlockRenderer {...block} />)
    expect(getByRole('img')).toHaveAttribute(
      'alt',
      'random image from unsplash'
    )
  })

  it('should render RadioOption', () => {
    const block: TreeBlock = {
      __typename: 'RadioOptionBlock',
      id: 'main',
      journeyId: 'journey1.id',
      label: 'radio option',
      parentBlockId: null,
      action: null,
      children: []
    }
    const { getByText } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BlockRenderer {...block} />
      </MockedProvider>
    )
    expect(getByText('radio option')).toBeInTheDocument()
  })

  it('should render RadioQuestion', () => {
    const block: TreeBlock = {
      __typename: 'RadioQuestionBlock',
      id: 'main',
      journeyId: 'journey1.id',
      label: 'radio question',
      parentBlockId: null,
      description: 'description',
      children: []
    }
    const { getByText } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BlockRenderer {...block} />
      </MockedProvider>
    )
    expect(getByText('radio question')).toBeInTheDocument()
  })

  it('should render SignUp', () => {
    const block: TreeBlock = {
      __typename: 'SignUpBlock',
      id: 'signUp',
      journeyId: 'journey1.id',
      parentBlockId: null,
      submitLabel: null,
      submitIcon: null,
      action: {
        __typename: 'NavigateAction',
        gtmEventName: 'gtmEventName'
      },
      children: []
    }
    const { getByLabelText } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BlockRenderer {...block} />
      </MockedProvider>
    )
    expect(getByLabelText('Name')).toBeInTheDocument()
    expect(getByLabelText('Email')).toBeInTheDocument()
  })

  it('should render Step', () => {
    const block: TreeBlock = {
      __typename: 'StepBlock',
      id: 'step',
      journeyId: 'journey1.id',
      parentBlockId: null,
      nextBlockId: null,
      locked: false,
      children: [
        {
          __typename: 'ButtonBlock',
          id: 'button',
          journeyId: 'journey1.id',
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
      ]
    }
    const { getByText } = render(<BlockRenderer {...block} />)
    expect(getByText('Click to continue')).toBeInTheDocument()
  })

  it('should render Typography', () => {
    const block: TreeBlock = {
      id: 'typographyBlockId1',
      __typename: 'TypographyBlock',
      journeyId: 'journey1.id',
      parentBlockId: null,
      align: null,
      color: null,
      content: 'How did we get here?',
      variant: null,
      children: []
    }
    const { getByText } = render(<BlockRenderer {...block} />)
    expect(getByText('How did we get here?')).toBeInTheDocument()
  })

  it('should render Video', () => {
    const block: TreeBlock = {
      __typename: 'VideoBlock',
      id: 'main',
      journeyId: 'journey1.id',
      videoContent: {
        __typename: 'VideoArclight',
        src: 'https://arc.gt/hls/2_0-FallingPlates/529'
      },
      title: 'title',
      autoplay: false,
      muted: false,
      endAt: null,
      startAt: null,
      parentBlockId: null,
      posterBlockId: null,
      children: []
    }
    const { getByTestId } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BlockRenderer {...block} />
      </MockedProvider>
    )
    expect(getByTestId('VideoComponent')).toBeInTheDocument()
  })
})
