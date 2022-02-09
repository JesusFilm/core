import { ReactElement, ReactNode } from 'react'
import {
  Button,
  Card,
  Image,
  GridItem,
  GridContainer,
  RadioOption,
  RadioQuestion,
  SignUp,
  Step,
  Typography,
  Video
} from '..'
import { TreeBlock } from '../..'
import {
  BlockFields as Block,
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_GridItemBlock as GridItemBlock,
  BlockFields_GridContainerBlock as GridContainerBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_RadioQuestionBlock as RadioQuestionBlock,
  BlockFields_SignUpBlock as SignUpBlock,
  BlockFields_StepBlock as StepBlock,
  BlockFields_TypographyBlock as TypographyBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../libs/transformer/__generated__/BlockFields'

interface WrapperProps<T = Block> {
  block: TreeBlock<T>
  children: ReactNode
}

type WrapperFn<T = Block> = (props: WrapperProps<T>) => ReactElement

export interface WrappersProps {
  Wrapper?: WrapperFn
  ButtonWrapper?: WrapperFn<ButtonBlock>
  CardWrapper?: WrapperFn<CardBlock>
  GridItemWrapper?: WrapperFn<GridItemBlock>
  GridContainerWrapper?: WrapperFn<GridContainerBlock>
  ImageWrapper?: WrapperFn<ImageBlock>
  RadioOptionWrapper?: WrapperFn<RadioOptionBlock>
  RadioQuestionWrapper?: WrapperFn<RadioQuestionBlock>
  SignUpWrapper?: WrapperFn<SignUpBlock>
  StepWrapper?: WrapperFn<StepBlock>
  TypographyWrapper?: WrapperFn<TypographyBlock>
  VideoWrapper?: WrapperFn<VideoBlock>
}

interface BlockRenderProps {
  block: TreeBlock
  wrappers?: WrappersProps
}

const DefaultWrapper: WrapperFn = ({ children }) => <>{children}</>

export function BlockRenderer({
  block,
  wrappers
}: BlockRenderProps): ReactElement {
  const Wrapper = wrappers?.Wrapper ?? DefaultWrapper
  const ButtonWrapper = wrappers?.ButtonWrapper ?? DefaultWrapper
  const CardWrapper = wrappers?.CardWrapper ?? DefaultWrapper
  const GridItemWrapper = wrappers?.GridItemWrapper ?? DefaultWrapper
  const GridContainerWrapper = wrappers?.GridContainerWrapper ?? DefaultWrapper
  const ImageWrapper = wrappers?.ImageWrapper ?? DefaultWrapper
  const RadioOptionWrapper = wrappers?.RadioOptionWrapper ?? DefaultWrapper
  const RadioQuestionWrapper = wrappers?.RadioQuestionWrapper ?? DefaultWrapper
  const SignUpWrapper = wrappers?.SignUpWrapper ?? DefaultWrapper
  const StepWrapper = wrappers?.StepWrapper ?? DefaultWrapper
  const TypographyWrapper = wrappers?.TypographyWrapper ?? DefaultWrapper
  const VideoWrapper = wrappers?.VideoWrapper ?? DefaultWrapper

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
    case 'GridItemBlock':
      return (
        <Wrapper block={block}>
          <GridItemWrapper block={block}>
            <GridItem {...block} wrappers={wrappers} />
          </GridItemWrapper>
        </Wrapper>
      )
    case 'GridContainerBlock':
      return (
        <Wrapper block={block}>
          <GridContainerWrapper block={block}>
            <GridContainer {...block} wrappers={wrappers} />
          </GridContainerWrapper>
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
            <RadioQuestion {...block} />
          </RadioQuestionWrapper>
        </Wrapper>
      )
    case 'SignUpBlock':
      return (
        <Wrapper block={block}>
          <SignUpWrapper block={block}>
            <SignUp {...block} />
          </SignUpWrapper>
        </Wrapper>
      )
    case 'StepBlock':
      return (
        <Wrapper block={block}>
          <StepWrapper block={block}>
            <Step {...block} wrappers={wrappers} />
          </StepWrapper>
        </Wrapper>
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
