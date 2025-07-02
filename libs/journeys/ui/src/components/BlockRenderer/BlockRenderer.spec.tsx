import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { v4 as uuidv4 } from 'uuid'

import { VideoBlockSource } from '../../../__generated__/globalTypes'
import { TreeBlock, blockHistoryVar, treeBlocksVar } from '../../libs/block'
import { RadioOptionFields } from '../RadioOption/__generated__/RadioOptionFields'
import { RadioQuestionFields } from '../RadioQuestion/__generated__/RadioQuestionFields'
import { STEP_VIEW_EVENT_CREATE } from '../Step/Step'

import { BlockRenderer } from './BlockRenderer'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

jest.mock('next-firebase-auth', () => ({
  __esModule: true,
  useUser: jest.fn(() => ({ id: 'userId', name: 'userName' }))
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('BlockRenderer', () => {
  const stepViewEventResult = jest.fn(() => ({
    data: {
      stepViewEventCreate: {
        id: 'uuid',
        __typename: 'StepViewEvent'
      }
    }
  }))

  const mocks = [
    {
      request: {
        query: STEP_VIEW_EVENT_CREATE,
        variables: {
          input: {
            id: 'uuid',
            blockId: 'step',
            value: 'Step {{number}}'
          }
        }
      },
      result: stepViewEventResult
    }
  ]

  it('should render Button', async () => {
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
      submitEnabled: null,
      action: null,
      children: []
    }
    const { getByText } = render(
      <MockedProvider>
        <BlockRenderer block={block} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByText('Click to continue')).toBeInTheDocument()
    )
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
      submitEnabled: null,
      action: null,
      children: []
    }
    const { getByTestId, getByText } = render(
      <MockedProvider>
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
      </MockedProvider>
    )
    expect(
      getByTestId('general-wrapper').children[0].getAttribute('data-testid')
    ).toBe('button-wrapper')
    expect(getByTestId('button-wrapper')).toContainElement(
      getByText('Click to continue')
    )
  })

  it('should render Card', async () => {
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
      backdropBlur: null,
      children: [
        {
          id: 'typographyBlockId1',
          __typename: 'TypographyBlock',
          parentBlockId: null,
          parentOrder: 0,
          align: null,
          color: null,
          content: 'How did we get here?',
          variant: null,
          children: []
        ,
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
}
      ]
    }
    const { getByText } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BlockRenderer block={block} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByText('How did we get here?')).toBeInTheDocument()
    )
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
      backdropBlur: null,
      children: [
        {
          id: 'typographyBlockId1',
          __typename: 'TypographyBlock',
          parentBlockId: null,
          parentOrder: 0,
          align: null,
          color: null,
          content: 'How did we get here?',
          variant: null,
          children: []
        ,
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
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
    ).toBe('card-wrapper')
    expect(getByTestId('card-wrapper')).toContainElement(
      getByText('How did we get here?')
    )
  })

  it('should render Image', async () => {
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
      scale: null,
      focalLeft: 50,
      focalTop: 50,
      children: []
    }
    const { getByRole } = render(<BlockRenderer block={block} />)
    await waitFor(() =>
      expect(getByRole('img')).toHaveAttribute(
        'alt',
        'random image from unsplash'
      )
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
      scale: null,
      focalLeft: 50,
      focalTop: 50,
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
    ).toBe('image-wrapper')
    expect(getByTestId('image-wrapper')).toContainElement(
      getByRole('img', { name: 'random image from unsplash' })
    )
  })

  it('should render RadioOption', async () => {
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
    await waitFor(() => expect(getByText('radio option')).toBeInTheDocument())
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
    ).toBe('radio-option-wrapper')
    expect(getByTestId('radio-option-wrapper')).toContainElement(
      getByText('radio option')
    )
  })

  it('should render RadioQuestion', async () => {
    const option: TreeBlock<RadioOptionFields> = {
      __typename: 'RadioOptionBlock',
      id: 'main',
      parentBlockId: null,
      parentOrder: 0,
      label: 'radio option 1',
      action: null,
      children: []
    }

    const block: TreeBlock<RadioQuestionFields> = {
      __typename: 'RadioQuestionBlock',
      id: 'main',
      parentBlockId: null,
      parentOrder: 0,
      children: [option, { ...option, label: 'radio option 2' }]
    }
    const { getByText } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BlockRenderer block={block} />
      </MockedProvider>
    )
    await waitFor(() => expect(getByText('radio option 1')).toBeInTheDocument())
    expect(getByText('radio option 2')).toBeInTheDocument()
  })

  it('should render RadioQuestion with general wrapper and specific wrapper', () => {
    const block: TreeBlock = {
      __typename: 'RadioQuestionBlock',
      id: 'main',
      parentBlockId: null,
      parentOrder: 0,
      children: []
    }
    const { getByTestId, getByRole } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BlockRenderer
          block={{ ...block }}
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
    ).toBe('radio-question-wrapper')

    const buttonGroup = getByRole('group')
    expect(buttonGroup).toHaveClass(
      'MuiButtonGroup-contained MuiButtonGroup-vertical'
    )
    expect(getByTestId('radio-question-wrapper')).toContainElement(buttonGroup)
  })

  it('should render SignUp', async () => {
    const block: TreeBlock = {
      __typename: 'SignUpBlock',
      id: 'signUp',
      parentBlockId: null,
      parentOrder: 0,
      submitLabel: null,
      submitIconId: null,
      action: null,
      children: []
    }
    const { getByLabelText } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <SnackbarProvider>
          <BlockRenderer block={block} />
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(getByLabelText('Name')).toBeInTheDocument())
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
      action: null,
      children: []
    }
    const { getByTestId, getByLabelText } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <SnackbarProvider>
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
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(
      getByTestId('general-wrapper').children[0].getAttribute('data-testid')
    ).toBe('sign-up-wrapper')
    expect(getByTestId('sign-up-wrapper')).toContainElement(
      getByLabelText('Name')
    )
    expect(getByTestId('sign-up-wrapper')).toContainElement(
      getByLabelText('Email')
    )
  })

  it('should render Step', async () => {
    mockUuidv4.mockReturnValueOnce('uuid')
    const block: TreeBlock = {
      __typename: 'StepBlock',
      id: 'step',
      parentBlockId: null,
      nextBlockId: null,
      parentOrder: 0,
      locked: false,
      slug: null,
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
          submitEnabled: null,
          action: null,
          children: []
        }
      ]
    }
    treeBlocksVar([block])
    blockHistoryVar([block])
    const { getByText } = render(
      <MockedProvider mocks={mocks}>
        <BlockRenderer block={block} />
      </MockedProvider>
    )
    await waitFor(() => expect(stepViewEventResult).toHaveBeenCalled())
    expect(getByText('Click to continue')).toBeInTheDocument()
  })

  it('should render Step with general wrapper and specific wrapper', async () => {
    mockUuidv4.mockReturnValueOnce('uuid')
    const block: TreeBlock = {
      __typename: 'StepBlock',
      id: 'step',
      parentBlockId: null,
      nextBlockId: null,
      parentOrder: 0,
      locked: false,
      slug: null,
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
          submitEnabled: null,
          action: null,
          children: []
        }
      ]
    }
    treeBlocksVar([block])
    blockHistoryVar([block])
    const { getByTestId, getByText } = render(
      <MockedProvider mocks={mocks}>
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
    ).toBe('step-wrapper')
    await waitFor(() => expect(stepViewEventResult).toHaveBeenCalled())
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
    ,
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
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
    ,
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
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
    ).toBe('typography-wrapper')
    expect(getByTestId('typography-wrapper')).toHaveTextContent(
      'How did we get here?'
    )
  })

  it('should render Video', async () => {
    const block: TreeBlock = {
      __typename: 'VideoBlock',
      id: 'main',
      videoId: '2_0-FallingPlates',
      videoVariantLanguageId: '529',
      source: VideoBlockSource.internal,
      title: null,
      description: null,
      duration: null,
      image: null,
      objectFit: null,
      mediaVideo: {
        __typename: 'Video',
        id: '2_0-FallingPlates',
        title: [
          {
            __typename: 'VideoTitle',
            value: 'FallingPlates'
          }
        ],
        images: [
          {
            __typename: 'CloudflareImage',
            mobileCinematicHigh:
              'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
          }
        ],
        variant: {
          __typename: 'VideoVariant',
          id: '2_0-FallingPlates-529',
          hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
        },
        variantLanguages: []
      },
      autoplay: false,
      muted: false,
      endAt: null,
      startAt: null,
      parentBlockId: 'step',
      posterBlockId: null,
      parentOrder: 0,
      fullsize: null,
      action: null,
      children: []
    }
    const { getByTestId } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <BlockRenderer block={block} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByTestId('JourneysVideo-main')).toBeInTheDocument()
    )
  })

  it('should render Video with general wrapper and specific wrapper', () => {
    const block: TreeBlock = {
      __typename: 'VideoBlock',
      id: 'main',
      videoId: '2_0-FallingPlates',
      videoVariantLanguageId: '529',
      source: VideoBlockSource.internal,
      title: null,
      description: null,
      duration: null,
      image: null,
      objectFit: null,
      mediaVideo: {
        __typename: 'Video',
        id: '2_0-FallingPlates',
        title: [
          {
            __typename: 'VideoTitle',
            value: 'FallingPlates'
          }
        ],
        images: [
          {
            __typename: 'CloudflareImage',
            mobileCinematicHigh:
              'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
          }
        ],
        variant: {
          __typename: 'VideoVariant',
          id: '2_0-FallingPlates-529',
          hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
        },
        variantLanguages: []
      },
      autoplay: false,
      muted: false,
      endAt: null,
      startAt: null,
      parentBlockId: null,
      posterBlockId: null,
      fullsize: null,
      action: null,
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
    ).toBe('video-wrapper')
    expect(getByTestId('video-wrapper')).toContainElement(
      getByTestId('JourneysVideo-main')
    )
  })
})
