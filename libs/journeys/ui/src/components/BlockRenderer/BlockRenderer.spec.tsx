import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { TreeBlock } from '../..'
import { BlockRenderer } from '.'

describe('BlockRenderer', () => {
  it('should render Button', () => {
    const block: TreeBlock = {
      __typename: 'ButtonBlock',
      id: 'button',
      parentBlockId: 'question',
      parentOrder: 0,
      label: 'Click to continue',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      action: null,
      children: []
    }
    const { getByText } = render(<BlockRenderer block={block} />)
    expect(getByText('Click to continue')).toBeInTheDocument()
  })

  it('should render Button with general wrapper and specific wrapper', () => {
    const block: TreeBlock = {
      __typename: 'ButtonBlock',
      id: 'button',
      parentBlockId: 'question',
      parentOrder: 0,
      label: 'Click to continue',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      action: null,
      children: []
    }
    const { getByTestId, getByText } = render(
      <BlockRenderer
        block={block}
        wrappers={{
          Wrapper: ({ children }) => (
            <div data-testid="general-wrapper">{children}</div>
          ),
          ButtonWrapper: ({ children }) => (
            <div data-testid="button-wrapper">{children}</div>
          )
        }}
      />
    )
    expect(
      getByTestId('general-wrapper').children[0].getAttribute('data-testid')
    ).toEqual('button-wrapper')
    expect(getByTestId('button-wrapper')).toContainElement(
      getByText('Click to continue')
    )
  })

  it('should render Card', () => {
    const block: TreeBlock = {
      __typename: 'CardBlock',
      id: 'card',
      parentBlockId: null,
      backgroundColor: null,
      coverBlockId: null,
      parentOrder: 0,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: [
        {
          __typename: 'RadioQuestionBlock',
          id: 'question',
          label: 'radio question',
          parentBlockId: 'step',
          parentOrder: 0,
          description: 'description',
          children: []
        }
      ]
    }
    const { getByText } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BlockRenderer block={block} />
      </MockedProvider>
    )
    expect(getByText('radio question')).toBeInTheDocument()
  })

  it('should render Card with general wrapper and specific wrapper', () => {
    const block: TreeBlock = {
      __typename: 'CardBlock',
      id: 'card',
      parentBlockId: null,
      backgroundColor: null,
      coverBlockId: null,
      parentOrder: 0,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: [
        {
          __typename: 'RadioQuestionBlock',
          id: 'question',
          label: 'radio question',
          parentBlockId: 'step',
          parentOrder: 0,
          description: 'description',
          children: []
        }
      ]
    }
    const { getByTestId, getByText } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BlockRenderer
          block={block}
          wrappers={{
            Wrapper: ({ block, children }) => (
              <div data-testid={`general-wrapper-${block.__typename}`}>
                {children}
              </div>
            ),
            CardWrapper: ({ children }) => (
              <div data-testid="card-wrapper">{children}</div>
            )
          }}
        />
      </MockedProvider>
    )
    expect(
      getByTestId('general-wrapper-CardBlock').children[0].getAttribute(
        'data-testid'
      )
    ).toEqual('card-wrapper')
    expect(getByTestId('card-wrapper')).toContainElement(
      getByText('radio question')
    )
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
      parentOrder: 0,
      blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
      children: []
    }
    const { getByRole } = render(<BlockRenderer block={block} />)
    expect(getByRole('img')).toHaveAttribute(
      'alt',
      'random image from unsplash'
    )
  })

  it('should render Image with general wrapper and specific wrapper', () => {
    const block: TreeBlock = {
      __typename: 'ImageBlock',
      id: 'main',
      src: 'https://source.unsplash.com/random/1920x1080',
      alt: 'random image from unsplash',
      width: 1920,
      height: 1080,
      parentBlockId: null,
      parentOrder: 0,
      blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
      children: []
    }
    const { getByTestId, getByRole } = render(
      <BlockRenderer
        block={block}
        wrappers={{
          Wrapper: ({ children }) => (
            <div data-testid="general-wrapper">{children}</div>
          ),
          ImageWrapper: ({ children }) => (
            <div data-testid="image-wrapper">{children}</div>
          )
        }}
      />
    )
    expect(
      getByTestId('general-wrapper').children[0].getAttribute('data-testid')
    ).toEqual('image-wrapper')
    expect(getByTestId('image-wrapper')).toContainElement(
      getByRole('img', { name: 'random image from unsplash' })
    )
  })

  it('should render RadioOption', () => {
    const block: TreeBlock = {
      __typename: 'RadioOptionBlock',
      id: 'main',
      parentBlockId: null,
      parentOrder: 0,
      label: 'radio option',
      action: null,
      children: []
    }
    const { getByText } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BlockRenderer block={block} />
      </MockedProvider>
    )
    expect(getByText('radio option')).toBeInTheDocument()
  })

  it('should render RadioOption with general wrapper and specific wrapper', () => {
    const block: TreeBlock = {
      __typename: 'RadioOptionBlock',
      id: 'main',
      parentBlockId: null,
      parentOrder: 0,
      label: 'radio option',
      action: null,
      children: []
    }
    const { getByTestId, getByText } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BlockRenderer
          block={block}
          wrappers={{
            Wrapper: ({ children }) => (
              <div data-testid="general-wrapper">{children}</div>
            ),
            RadioOptionWrapper: ({ children }) => (
              <div data-testid="radio-option-wrapper">{children}</div>
            )
          }}
        />
      </MockedProvider>
    )
    expect(
      getByTestId('general-wrapper').children[0].getAttribute('data-testid')
    ).toEqual('radio-option-wrapper')
    expect(getByTestId('radio-option-wrapper')).toContainElement(
      getByText('radio option')
    )
  })

  it('should render RadioQuestion', () => {
    const block: TreeBlock = {
      __typename: 'RadioQuestionBlock',
      id: 'main',
      parentBlockId: null,
      parentOrder: 0,
      label: 'radio question',
      description: 'description',
      children: []
    }
    const { getByText } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BlockRenderer block={block} />
      </MockedProvider>
    )
    expect(getByText('radio question')).toBeInTheDocument()
  })

  it('should render RadioQuestion with general wrapper and specific wrapper', () => {
    const block: TreeBlock = {
      __typename: 'RadioQuestionBlock',
      id: 'main',
      parentBlockId: null,
      parentOrder: 0,
      label: 'radio question',
      description: 'description',
      children: []
    }
    const { getByTestId, getByText } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BlockRenderer
          block={block}
          wrappers={{
            Wrapper: ({ children }) => (
              <div data-testid="general-wrapper">{children}</div>
            ),
            RadioQuestionWrapper: ({ children }) => (
              <div data-testid="radio-question-wrapper">{children}</div>
            )
          }}
        />
      </MockedProvider>
    )
    expect(
      getByTestId('general-wrapper').children[0].getAttribute('data-testid')
    ).toEqual('radio-question-wrapper')
    expect(getByTestId('radio-question-wrapper')).toContainElement(
      getByText('radio question')
    )
  })

  it('should render SignUp', () => {
    const block: TreeBlock = {
      __typename: 'SignUpBlock',
      id: 'signUp',
      parentBlockId: null,
      parentOrder: 0,
      submitLabel: null,
      submitIconId: null,
      action: {
        __typename: 'NavigateAction',
        parentBlockId: 'signUp',
        gtmEventName: 'gtmEventName'
      },
      children: []
    }
    const { getByLabelText } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BlockRenderer block={block} />
      </MockedProvider>
    )
    expect(getByLabelText('Name')).toBeInTheDocument()
    expect(getByLabelText('Email')).toBeInTheDocument()
  })

  it('should render SignUp with general wrapper and specific wrapper', () => {
    const block: TreeBlock = {
      __typename: 'SignUpBlock',
      id: 'signUp',
      parentBlockId: null,
      parentOrder: 0,
      submitLabel: null,
      submitIconId: null,
      action: {
        __typename: 'NavigateAction',
        parentBlockId: 'signUp',
        gtmEventName: 'gtmEventName'
      },
      children: []
    }
    const { getByTestId, getByLabelText } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BlockRenderer
          block={block}
          wrappers={{
            Wrapper: ({ children }) => (
              <div data-testid="general-wrapper">{children}</div>
            ),
            SignUpWrapper: ({ children }) => (
              <div data-testid="sign-up-wrapper">{children}</div>
            )
          }}
        />
      </MockedProvider>
    )
    expect(
      getByTestId('general-wrapper').children[0].getAttribute('data-testid')
    ).toEqual('sign-up-wrapper')
    expect(getByTestId('sign-up-wrapper')).toContainElement(
      getByLabelText('Name')
    )
    expect(getByTestId('sign-up-wrapper')).toContainElement(
      getByLabelText('Email')
    )
  })

  it('should render Step', () => {
    const block: TreeBlock = {
      __typename: 'StepBlock',
      id: 'step',
      parentBlockId: null,
      nextBlockId: null,
      parentOrder: 0,
      locked: false,
      children: [
        {
          __typename: 'ButtonBlock',
          id: 'button',
          parentBlockId: 'question',
          parentOrder: 0,
          label: 'Click to continue',
          buttonVariant: null,
          buttonColor: null,
          size: null,
          startIconId: null,
          endIconId: null,
          action: null,
          children: []
        }
      ]
    }
    const { getByText } = render(<BlockRenderer block={block} />)
    expect(getByText('Click to continue')).toBeInTheDocument()
  })

  it('should render Step with general wrapper and specific wrapper', () => {
    const block: TreeBlock = {
      __typename: 'StepBlock',
      id: 'step',
      parentBlockId: null,
      nextBlockId: null,
      parentOrder: 0,
      locked: false,
      children: [
        {
          __typename: 'ButtonBlock',
          id: 'button',
          parentBlockId: 'question',
          parentOrder: 0,
          label: 'Click to continue',
          buttonVariant: null,
          buttonColor: null,
          size: null,
          startIconId: null,
          endIconId: null,
          action: null,
          children: []
        }
      ]
    }
    const { getByTestId, getByText } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BlockRenderer
          block={block}
          wrappers={{
            Wrapper: ({ block, children }) => (
              <div data-testid={`general-wrapper-${block.__typename}`}>
                {children}
              </div>
            ),
            StepWrapper: ({ children }) => (
              <div data-testid="step-wrapper">{children}</div>
            )
          }}
        />
      </MockedProvider>
    )
    expect(
      getByTestId('general-wrapper-StepBlock').children[0].getAttribute(
        'data-testid'
      )
    ).toEqual('step-wrapper')
    expect(getByTestId('step-wrapper')).toContainElement(
      getByText('Click to continue')
    )
  })

  it('should render Typography', () => {
    const block: TreeBlock = {
      id: 'typographyBlockId1',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      parentOrder: 0,
      align: null,
      color: null,
      content: 'How did we get here?',
      variant: null,
      children: []
    }
    const { getByText } = render(<BlockRenderer block={block} />)
    expect(getByText('How did we get here?')).toBeInTheDocument()
  })

  it('should render Typography with general wrapper and specific wrapper', () => {
    const block: TreeBlock = {
      id: 'typographyBlockId1',
      __typename: 'TypographyBlock',
      parentBlockId: null,
      parentOrder: 0,
      align: null,
      color: null,
      content: 'How did we get here?',
      variant: null,
      children: []
    }
    const { getByTestId } = render(
      <BlockRenderer
        block={block}
        wrappers={{
          Wrapper: ({ children }) => (
            <div data-testid="general-wrapper">{children}</div>
          ),
          TypographyWrapper: ({ children }) => (
            <div data-testid="typography-wrapper">{children}</div>
          )
        }}
      />
    )
    expect(
      getByTestId('general-wrapper').children[0].getAttribute('data-testid')
    ).toEqual('typography-wrapper')
    expect(getByTestId('typography-wrapper')).toHaveTextContent(
      'How did we get here?'
    )
  })

  it('should render Video', () => {
    const block: TreeBlock = {
      __typename: 'VideoBlock',
      id: 'main',
      videoId: '2_0-FallingPlates',
      videoVariantLanguageId: '529',
      video: {
        __typename: 'Video',
        id: '2_0-FallingPlates',
        variant: {
          __typename: 'VideoVariant',
          id: '2_0-FallingPlates-529',
          hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
        }
      },
      autoplay: false,
      muted: false,
      endAt: null,
      startAt: null,
      parentBlockId: null,
      posterBlockId: null,
      parentOrder: 0,
      fullsize: null,
      children: []
    }
    const { getByTestId } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BlockRenderer block={block} />
      </MockedProvider>
    )
    expect(getByTestId('video-main')).toBeInTheDocument()
  })

  it('should render Video with general wrapper and specific wrapper', () => {
    const block: TreeBlock = {
      __typename: 'VideoBlock',
      id: 'main',
      videoId: '2_0-FallingPlates',
      videoVariantLanguageId: '529',
      video: {
        __typename: 'Video',
        id: '2_0-FallingPlates',
        variant: {
          __typename: 'VideoVariant',
          id: '2_0-FallingPlates-529',
          hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
        }
      },
      autoplay: false,
      muted: false,
      endAt: null,
      startAt: null,
      parentBlockId: null,
      posterBlockId: null,
      fullsize: null,
      parentOrder: 0,
      children: []
    }
    const { getByTestId } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BlockRenderer
          block={block}
          wrappers={{
            Wrapper: ({ children }) => (
              <div data-testid="general-wrapper">{children}</div>
            ),
            VideoWrapper: ({ children }) => (
              <div data-testid="video-wrapper">{children}</div>
            )
          }}
        />
      </MockedProvider>
    )
    expect(
      getByTestId('general-wrapper').children[0].getAttribute('data-testid')
    ).toEqual('video-wrapper')
    expect(getByTestId('video-wrapper')).toContainElement(
      getByTestId('video-main')
    )
  })
})
