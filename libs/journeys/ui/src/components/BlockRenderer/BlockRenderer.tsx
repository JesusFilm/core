import { ReactElement } from 'react'
import { SnackbarProvider } from 'notistack'
import dynamic from 'next/dynamic'
import { Button } from '../Button'
import { Card } from '../Card'
import { Image } from '../Image'
import { RadioOption } from '../RadioOption'
import { RadioQuestion } from '../RadioQuestion'
import { Step } from '../Step'
import { Typography } from '../Typography'
import { Video } from '../Video'
import type { TreeBlock } from '../../libs/block'
import {
  BlockFields as Block,
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_RadioQuestionBlock as RadioQuestionBlock,
  BlockFields_SignUpBlock as SignUpBlock,
  BlockFields_StepBlock as StepBlock,
  BlockFields_TextResponseBlock as TextResponseBlock,
  BlockFields_TypographyBlock as TypographyBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../libs/block/__generated__/BlockFields'

const SignUp = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "SignUp" */
      '../SignUp'
    )
)

const TextResponse = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "TextResponse" */
      '../TextResponse'
    )
)

export interface WrapperProps<T = Block> {
  block: TreeBlock<T>
  children: ReactElement
}

type WrapperFn<T = Block> = (props: WrapperProps<T>) => ReactElement

export interface WrappersProps {
  Wrapper?: WrapperFn
  ButtonWrapper?: WrapperFn<ButtonBlock>
  CardWrapper?: WrapperFn<CardBlock>
  ImageWrapper?: WrapperFn<ImageBlock>
  RadioOptionWrapper?: WrapperFn<RadioOptionBlock>
  RadioQuestionWrapper?: WrapperFn<RadioQuestionBlock>
  SignUpWrapper?: WrapperFn<SignUpBlock>
  StepWrapper?: WrapperFn<StepBlock>
  TextResponseWrapper?: WrapperFn<TextResponseBlock>
  TypographyWrapper?: WrapperFn<TypographyBlock>
  VideoWrapper?: WrapperFn<VideoBlock>
}

interface BlockRenderProps {
  block: TreeBlock
  wrappers?: WrappersProps
}

const DefaultWrapper: WrapperFn = ({ children }) => children

export function BlockRenderer({
  block,
  wrappers
}: BlockRenderProps): ReactElement {
  const Wrapper = wrappers?.Wrapper ?? DefaultWrapper
  const ButtonWrapper = wrappers?.ButtonWrapper ?? DefaultWrapper
  const CardWrapper = wrappers?.CardWrapper ?? DefaultWrapper
  const ImageWrapper = wrappers?.ImageWrapper ?? DefaultWrapper
  const RadioOptionWrapper = wrappers?.RadioOptionWrapper ?? DefaultWrapper
  const RadioQuestionWrapper = wrappers?.RadioQuestionWrapper ?? DefaultWrapper
  const SignUpWrapper = wrappers?.SignUpWrapper ?? DefaultWrapper
  const StepWrapper = wrappers?.StepWrapper ?? DefaultWrapper
  const TextResponseWrapper = wrappers?.TextResponseWrapper ?? DefaultWrapper
  const TypographyWrapper = wrappers?.TypographyWrapper ?? DefaultWrapper
  const VideoWrapper = wrappers?.VideoWrapper ?? DefaultWrapper

  if (block.parentOrder === null) {
    return <></>
  }

  switch (block.__typename) {
    case 'ButtonBlock':
      return (
        <Wrapper block={block}>
          <ButtonWrapper block={block}>
            <Button {...block} />
          </ButtonWrapper>
        </Wrapper>
      )
    case 'CardBlock':
      return (
        <Wrapper block={block}>
          <CardWrapper block={block}>
            <Card {...block} wrappers={wrappers} />
          </CardWrapper>
        </Wrapper>
      )
    case 'ImageBlock':
      return (
        <Wrapper block={block}>
          <ImageWrapper block={block}>
            <Image {...block} alt={block.alt} />
          </ImageWrapper>
        </Wrapper>
      )
    case 'RadioOptionBlock':
      return (
        <Wrapper block={block}>
          <RadioOptionWrapper block={block}>
            <RadioOption {...block} />
          </RadioOptionWrapper>
        </Wrapper>
      )
    case 'RadioQuestionBlock':
      return (
        <Wrapper block={block}>
          <RadioQuestionWrapper block={block}>
            <RadioQuestion {...block} wrappers={wrappers} />
          </RadioQuestionWrapper>
        </Wrapper>
      )
    case 'SignUpBlock':
      return (
        <SnackbarProvider>
          <Wrapper block={block}>
            <SignUpWrapper block={block}>
              <SignUp {...block} />
            </SignUpWrapper>
          </Wrapper>
        </SnackbarProvider>
      )
    case 'StepBlock':
      return (
        <Wrapper block={block}>
          <StepWrapper block={block}>
            <Step {...block} wrappers={wrappers} />
          </StepWrapper>
        </Wrapper>
      )
    case 'TextResponseBlock':
      return (
        <SnackbarProvider>
          <Wrapper block={block}>
            <TextResponseWrapper block={block}>
              <TextResponse {...block} />
            </TextResponseWrapper>
          </Wrapper>
        </SnackbarProvider>
      )
    case 'TypographyBlock':
      return (
        <Wrapper block={block}>
          <TypographyWrapper block={block}>
            <Typography {...block} />
          </TypographyWrapper>
        </Wrapper>
      )
    case 'VideoBlock':
      return (
        <Wrapper block={block}>
          <VideoWrapper block={block}>
            <Video {...block} />
          </VideoWrapper>
        </Wrapper>
      )
    default:
      return (
        <Wrapper block={block}>
          <></>
        </Wrapper>
      )
  }
}
