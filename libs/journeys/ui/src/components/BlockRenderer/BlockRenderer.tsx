import dynamic from 'next/dynamic'
import { ReactElement } from 'react'

import type { TreeBlock } from '../../libs/block'
import {
  BlockFields as Block,
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_FormBlock as FormBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_RadioQuestionBlock as RadioQuestionBlock,
  BlockFields_SignUpBlock as SignUpBlock,
  BlockFields_StepBlock as StepBlock,
  BlockFields_TextResponseBlock as TextResponseBlock,
  BlockFields_TypographyBlock as TypographyBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../libs/block/__generated__/BlockFields'
import { Video } from '../Video'

export interface WrapperProps<T = Block> {
  block: TreeBlock<T>
  children: ReactElement
}

type WrapperFn<T = Block> = (props: WrapperProps<T>) => ReactElement

export interface WrappersProps {
  Wrapper?: WrapperFn
  ButtonWrapper?: WrapperFn<ButtonBlock>
  CardWrapper?: WrapperFn<CardBlock>
  FormWrapper?: WrapperFn<FormBlock>
  ImageWrapper?: WrapperFn<ImageBlock>
  RadioOptionWrapper?: WrapperFn<RadioOptionBlock>
  RadioQuestionWrapper?: WrapperFn<RadioQuestionBlock>
  SignUpWrapper?: WrapperFn<SignUpBlock>
  StepWrapper?: WrapperFn<StepBlock>
  TextResponseWrapper?: WrapperFn<TextResponseBlock>
  TypographyWrapper?: WrapperFn<TypographyBlock>
  VideoWrapper?: WrapperFn<VideoBlock>
}

const DynamicButton = dynamic<TreeBlock<ButtonBlock>>(
  async () =>
    await import(
      /* webpackChunkName: "Button" */
      '../Button'
    ).then((mod) => mod.Button)
)

const DynamicCard = dynamic<
  TreeBlock<CardBlock> & { wrappers?: WrappersProps; activeStep: boolean }
>(
  async () =>
    // eslint-disable-next-line import/no-cycle
    await import(
      /* webpackChunkName: "Card" */
      '../Card'
    ).then((mod) => mod.Card)
)

const DynamicForm = dynamic<TreeBlock<FormBlock>>(
  async () =>
    await import(
      /* webpackChunkName: "Form" */
      '../Form'
    ).then((mod) => mod.Form)
)

const DynamicImage = dynamic<TreeBlock<ImageBlock>>(
  async () =>
    await import(
      /* webpackChunkName: "Image" */
      '../Image'
    ).then((mod) => mod.Image)
)

const DynamicRadioOption = dynamic<TreeBlock<RadioOptionBlock>>(
  async () =>
    await import(
      /* webpackChunkName: "RadioOption" */
      '../RadioOption'
    ).then((mod) => mod.RadioOption)
)

const DynamicRadioQuestion = dynamic<
  TreeBlock<RadioQuestionBlock> & { wrappers?: WrappersProps }
>(
  async () =>
    await import(
      /* webpackChunkName: "RadioQuestion" */
      '../RadioQuestion'
    ).then((mod) => mod.RadioQuestion)
)

const DynamicSignUp = dynamic<TreeBlock<SignUpBlock>>(
  async () =>
    await import(
      /* webpackChunkName: "SignUp" */
      '../SignUp'
    ).then((mod) => mod.SignUp)
)

const DynamicStep = dynamic<
  TreeBlock<StepBlock> & { wrappers?: WrappersProps }
>(
  async () =>
    await import(
      /* webpackChunkName: "Step" */
      '../Step'
    ).then((mod) => mod.Step)
)
const DynamicTextResponse = dynamic<TreeBlock<TextResponseBlock>>(
  async () =>
    await import(
      /* webpackChunkName: "TextResponse" */
      '../TextResponse'
    ).then((mod) => mod.TextResponse)
)

const DynamicTypography = dynamic<TreeBlock<TypographyBlock>>(
  async () =>
    await import(
      /* webpackChunkName: "Typography" */
      '../Typography'
    ).then((mod) => mod.Typography)
)

interface BlockRenderProps {
  block?: TreeBlock
  wrappers?: WrappersProps
  activeStep?: boolean
}

const DefaultWrapper: WrapperFn = ({ children }) => children

export function BlockRenderer({
  block,
  wrappers,
  activeStep = false
}: BlockRenderProps): ReactElement {
  const Wrapper = wrappers?.Wrapper ?? DefaultWrapper
  const ButtonWrapper = wrappers?.ButtonWrapper ?? DefaultWrapper
  const CardWrapper = wrappers?.CardWrapper ?? DefaultWrapper
  const FormWrapper = wrappers?.FormWrapper ?? DefaultWrapper
  const ImageWrapper = wrappers?.ImageWrapper ?? DefaultWrapper
  const RadioOptionWrapper = wrappers?.RadioOptionWrapper ?? DefaultWrapper
  const RadioQuestionWrapper = wrappers?.RadioQuestionWrapper ?? DefaultWrapper
  const SignUpWrapper = wrappers?.SignUpWrapper ?? DefaultWrapper
  const StepWrapper = wrappers?.StepWrapper ?? DefaultWrapper
  const TextResponseWrapper = wrappers?.TextResponseWrapper ?? DefaultWrapper
  const TypographyWrapper = wrappers?.TypographyWrapper ?? DefaultWrapper
  const VideoWrapper = wrappers?.VideoWrapper ?? DefaultWrapper

  if (block == null || block?.parentOrder === null) {
    return <></>
  }

  switch (block.__typename) {
    case 'ButtonBlock':
      return (
        <Wrapper block={block}>
          <ButtonWrapper block={block}>
            <DynamicButton {...block} />
          </ButtonWrapper>
        </Wrapper>
      )
    case 'CardBlock':
      return (
        <Wrapper block={block}>
          <CardWrapper block={block}>
            <DynamicCard
              {...block}
              wrappers={wrappers}
              activeStep={activeStep}
            />
          </CardWrapper>
        </Wrapper>
      )
    case 'FormBlock':
      return (
        <Wrapper block={block}>
          <FormWrapper block={block}>
            <DynamicForm {...block} />
          </FormWrapper>
        </Wrapper>
      )
    case 'ImageBlock':
      return (
        <Wrapper block={block}>
          <ImageWrapper block={block}>
            <DynamicImage {...block} alt={block.alt} />
          </ImageWrapper>
        </Wrapper>
      )
    case 'RadioOptionBlock':
      return (
        <Wrapper block={block}>
          <RadioOptionWrapper block={block}>
            <DynamicRadioOption {...block} />
          </RadioOptionWrapper>
        </Wrapper>
      )
    case 'RadioQuestionBlock':
      return (
        <Wrapper block={block}>
          <RadioQuestionWrapper block={block}>
            <DynamicRadioQuestion {...block} wrappers={wrappers} />
          </RadioQuestionWrapper>
        </Wrapper>
      )
    case 'SignUpBlock':
      return (
        <Wrapper block={block}>
          <SignUpWrapper block={block}>
            <DynamicSignUp {...block} />
          </SignUpWrapper>
        </Wrapper>
      )
    case 'StepBlock':
      return (
        <Wrapper block={block}>
          <StepWrapper block={block}>
            <DynamicStep {...block} wrappers={wrappers} />
          </StepWrapper>
        </Wrapper>
      )
    case 'TextResponseBlock':
      return (
        <Wrapper block={block}>
          <TextResponseWrapper block={block}>
            <DynamicTextResponse {...block} />
          </TextResponseWrapper>
        </Wrapper>
      )
    case 'TypographyBlock':
      return (
        <Wrapper block={block}>
          <TypographyWrapper block={block}>
            <DynamicTypography {...block} />
          </TypographyWrapper>
        </Wrapper>
      )
    case 'VideoBlock':
      return (
        <Wrapper block={block}>
          <VideoWrapper block={block}>
            <Video {...block} activeStep={activeStep} />
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
