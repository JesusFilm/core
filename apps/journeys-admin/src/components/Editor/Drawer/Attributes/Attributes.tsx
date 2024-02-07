import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import MuiTypography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { CardTemplateDrawer } from '../../CardTemplateDrawer'
import { useTranslation } from 'react-i18next'
import { Drawer } from '../../Drawer'

const Footer = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Footer" */ './blocks/Footer'
    ).then((mod) => mod.Footer),
  { ssr: false }
)

const Card = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Card" */ './blocks/Card'
    ).then((mod) => mod.Card),
  { ssr: false }
)

const Step = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Step" */ './blocks/Step'
    ).then((mod) => mod.Step),
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

function AttributesContent({ selected, step }: AttributesProps): ReactElement {
  if (typeof selected === 'string') {
    switch (selected) {
      case 'Footer': {
        return <Footer />
      }
      default:
        return <></>
    }
  } else {
    switch (selected.__typename) {
      case 'CardBlock':
        return <Card {...selected} />
      case 'FormBlock':
        return <Form {...selected} />
      case 'StepBlock': {
        const block = selected.children.find(
          (block) =>
            block.__typename === 'CardBlock' ||
            block.__typename === 'VideoBlock'
        )
        return (
          <>
            <Step {...selected} />
            {block != null && (
              <AttributesContent selected={block} step={step} />
            )}
          </>
        )
      }
      case 'VideoBlock':
        return <Video {...selected} />
      case 'ImageBlock':
        return <Image {...selected} alt={selected.alt} />
      case 'TypographyBlock':
        return <Typography {...selected} />
      case 'ButtonBlock':
        return <Button {...selected} />
      case 'RadioOptionBlock':
        return <RadioOption {...selected} />
      case 'SignUpBlock':
        return <SignUp {...selected} />
      case 'TextResponseBlock':
        return <TextResponse {...selected} />
      default:
        return <></>
    }
  }
}

export function Attributes(): ReactElement {
  const {
    state: {
      drawerTitle: title,
      drawerChildren: children,
      selectedComponent,
      selectedBlock,
      selectedStep,
      journeyEditContentComponent
    },
    dispatch
  } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')
  const selected = selectedComponent ?? selectedBlock ?? 'none'
  let blockTitle: string | undefined
  switch (selectedBlock?.__typename) {
    case 'ButtonBlock':
      blockTitle = t('Button Properties')
      break
    case 'FormBlock':
      blockTitle = t('Form Properties')
      break
    case 'ImageBlock':
      blockTitle = t('Image Properties')
      break
    case 'RadioQuestionBlock':
      blockTitle = t('Poll Properties')
      break
    case 'RadioOptionBlock':
      blockTitle = t('Poll Option Properties')
      break
    case 'SignUpBlock':
      blockTitle = t('Subscribe Properties')
      break
    case 'StepBlock':
      if (selectedBlock.children[0]?.children.length > 0) {
        blockTitle = t('Card Properties')
      } else {
        blockTitle = t('Card Templates')
      }
      break
    case 'TextResponseBlock':
      blockTitle = t('Feedback Properties')
      break
    case 'TypographyBlock':
      blockTitle = t('Typography Properties')
      break
    case 'VideoBlock':
      blockTitle = t('Video Properties')
      break
    default:
      blockTitle = title
  }
  switch (selectedComponent) {
    case 'Footer':
      blockTitle = t('Footer Properties')
      break
  }
  switch (journeyEditContentComponent) {
    case ActiveJourneyEditContent.SocialPreview:
      blockTitle = t('Social Share Preview')
      break
    case ActiveJourneyEditContent.Action:
      blockTitle = t('Information')
      break
    case ActiveJourneyEditContent.JourneyFlow:
      blockTitle = t('Properties')
      break
  }

  return (
    <Drawer title={blockTitle}>
      {selected !== 'none' &&
      selectedStep !== undefined &&
      selectedStep.children[0]?.children.length > 0 ? (
        <Stack sx={{ overflow: 'auto' }}>
          <AttributesContent selected={selected} step={selectedStep} />
        </Stack>
      ) : (
        <CardTemplateDrawer />
      )}
    </Drawer>
  )
}
