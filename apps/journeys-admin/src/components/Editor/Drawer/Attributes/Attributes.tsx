import Stack from '@mui/material/Stack'
import dynamic from 'next/dynamic'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { Drawer } from '..'
import { BlockFields_StepBlock as StepBlock } from '../../../../../__generated__/BlockFields'
import { AddBlock } from '../../AddBlock'
import { CardTemplateDrawer } from '../../CardTemplateDrawer'
import { SocialShareAppearance } from '../SocialShareAppearance'

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

interface AttributesProps {
  selectedBlock?: TreeBlock
  selectedStep?: TreeBlock<StepBlock>
  showDrawer?: boolean
}

function AttributesContent({
  selectedBlock,
  selectedStep,
  showDrawer
}: AttributesProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
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
      if (card?.children.length > 0) {
        title = t('Card Properties')
        component = (
          <>
            <Step {...selectedBlock} />
            {card != null && (
              <AttributesContent
                selectedBlock={card}
                selectedStep={selectedStep}
              />
            )}
          </>
        )
      } else {
        title = t('Card Templates')
        component = <CardTemplateDrawer />
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
  return showDrawer === true ? (
    <Drawer title={title}>
      <Stack>{component}</Stack>
    </Drawer>
  ) : (
    <Stack>{component}</Stack>
  )
}

export function Attributes(): ReactElement {
  const {
    state: {
      selectedComponent,
      selectedBlock,
      selectedStep,
      journeyEditContentComponent
    }
  } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')

  switch (journeyEditContentComponent) {
    case ActiveJourneyEditContent.SocialPreview:
      return (
        <Drawer title={t('Social Share Preview')}>
          <SocialShareAppearance />
        </Drawer>
      )
    case ActiveJourneyEditContent.Action:
      return <Drawer title={t('Information')} />
    case ActiveJourneyEditContent.Canvas:
      if (selectedComponent === 'Fab') {
        return (
          <Drawer title="Add new blocks">
            <AddBlock />
          </Drawer>
        )
      }
      if (selectedComponent === 'Footer') {
        return (
          <Drawer title={t('Footer Properties')}>
            <Footer />
          </Drawer>
        )
      } else {
        return (
          <AttributesContent
            selectedBlock={selectedBlock}
            selectedStep={selectedStep}
            showDrawer
          />
        )
      }
  }
}
