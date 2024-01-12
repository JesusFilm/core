import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import MuiTypography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import type { TreeBlock } from '@core/journeys/ui/block'

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
            <Divider orientation="vertical" variant="middle" flexItem />
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

interface AttributesProps {
  selected: TreeBlock | string
  step: TreeBlock
}

export function Attributes({ selected, step }: AttributesProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  // Map typename to labels when we have translation keys
  const blockLabel =
    typeof selected === 'string'
      ? t(selected)
      : selected.__typename === 'StepBlock'
      ? t('Card')
      : selected.__typename === 'SignUpBlock'
      ? t('Subscribe')
      : selected.__typename === 'TextResponseBlock'
      ? t('Feedback')
      : selected.__typename === 'RadioQuestionBlock'
      ? t('Poll')
      : selected.__typename === 'RadioOptionBlock'
      ? t('Poll Option')
      : selected.__typename.replace('Block', '')
  return (
    <>
      <Stack
        direction="row"
        spacing={4}
        sx={{
          overflowX: 'auto',
          py: 5,
          px: 6
        }}
      >
        <AttributesContent selected={selected} step={step} />
      </Stack>
      <Box
        sx={{
          py: 4.25,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`
        }}
      >
        <MuiTypography align="center">
          {t('Editing {{block}} Properties', { block: blockLabel })}
        </MuiTypography>
      </Box>
    </>
  )
}
