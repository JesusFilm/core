import Stack from '@mui/material/Stack'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { TreeBlock } from '@core/journeys/ui/block/TreeBlock'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields as StepBlock } from '../../../../../../../__generated__/BlockFields'
import { Drawer } from '../../Drawer'
import { CardTemplates } from '../../Drawer/CardTemplates/CardTemplates'

const Card = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Card" */ './blocks/Card'
    ).then((mod) => mod.Card),
  { ssr: false }
)

const Typography = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Typography" */ './blocks/Typography'
    ).then((mod) => mod.Typography),
  { ssr: false }
)

const Video = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Video" */ './blocks/Video'
    ).then((mod) => mod.Video),
  { ssr: false }
)

const Image = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Image" */ './blocks/Image'
    ).then((mod) => mod.Image),
  { ssr: false }
)
const Button = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Button" */ './blocks/Button'
    ).then((mod) => mod.Button),
  { ssr: false }
)

const TextResponse = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/TextResponse" */ './blocks/TextResponse'
    ).then((mod) => mod.TextResponse),
  { ssr: false }
)

const RadioQuestion = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/RadioOption" */ './blocks/RadioQuestion'
    ).then((mod) => mod.RadioQuestion),
  { ssr: false }
)

const RadioOption = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/RadioOption" */ './blocks/RadioOption'
    ).then((mod) => mod.RadioOption),
  { ssr: false }
)

const SignUp = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/SignUp" */ './blocks/SignUp'
    ).then((mod) => mod.SignUp),
  { ssr: false }
)

const Form = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Form" */ './blocks/Form'
    ).then((mod) => mod.Form),
  { ssr: false }
)

interface PropertiesProps {
  block?: TreeBlock
  step?: TreeBlock<StepBlock>
}

export function Properties({ block, step }: PropertiesProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { state, dispatch } = useEditor()
  const [showCardTemplates, setShowCardTemplates] = useState(true)
  const selectedBlock = block ?? state.selectedBlock
  const selectedStep = step ?? state.selectedStep

  let component
  let title: string | undefined
  switch (selectedBlock?.__typename) {
    case 'CardBlock':
      component = <Card {...selectedBlock} />
      break
    case 'FormBlock':
      title = t('Form Properties')
      component = <Form {...selectedBlock} />
      break
    case 'StepBlock': {
      const card = selectedBlock.children[0]
      if (card?.children.length > 0 || !showCardTemplates) {
        title = t('Card Properties')
        component = card != null && (
          <Properties block={card} step={selectedStep} />
        )
      } else {
        title = t('Card Templates')
        component = <CardTemplates />
      }
      break
    }
    case 'VideoBlock':
      title = t('Video Properties')
      component = <Video {...selectedBlock} />
      break
    case 'ImageBlock':
      title = t('Image Properties')
      component = <Image {...selectedBlock} alt={selectedBlock.alt} />
      break
    case 'TypographyBlock':
      title = t('Typography Properties')
      component = <Typography {...selectedBlock} />
      break
    case 'ButtonBlock':
      title = t('Button Properties')
      component = <Button {...selectedBlock} />
      break
    case 'RadioQuestionBlock':
      title = t('Poll Block Selected')
      component = <RadioQuestion {...selectedBlock} />
      break
    case 'RadioOptionBlock':
      title = t('Poll Option Properties')
      component = <RadioOption {...selectedBlock} />
      break
    case 'SignUpBlock':
      title = t('Subscribe Properties')
      component = <SignUp {...selectedBlock} />
      break
    case 'TextResponseBlock':
      title = t('Feedback Properties')
      component = <TextResponse {...selectedBlock} />
      break
    default:
      component = <></>
      break
  }

  function onClose(): void {
    const isCardTemplates = title === 'Card Templates'
    setShowCardTemplates(!isCardTemplates)

    if (!isCardTemplates)
      dispatch({
        type: 'SetActiveSlideAction',
        activeSlide: ActiveSlide.JourneyFlow
      })
  }

  return block == null && step == null ? (
    <Drawer title={title} onClose={onClose}>
      <Stack>{component}</Stack>
    </Drawer>
  ) : (
    <Stack>{component}</Stack>
  )
}
