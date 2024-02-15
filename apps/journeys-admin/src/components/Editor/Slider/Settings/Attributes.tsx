import Stack from '@mui/material/Stack'
import dynamic from 'next/dynamic'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { BlockFields_StepBlock as StepBlock } from '../../../../../__generated__/BlockFields'
import { AddBlock } from '../../AddBlock'
import { ActionDetails } from '../ActionsTable/ActionDetails'

import { CardTemplateDrawer } from './CardTemplates'
import { Drawer } from './Drawer'
import { SocialShareAppearance } from './SocialMediaAppearance'

const Footer = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Footer" */ './Properties/blocks/Footer'
    ).then((mod) => mod.Footer),
  { ssr: false }
)

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
      return (
        <Drawer
          title={
            selectedComponent != null ? t('Goal Details') : t('Information')
          }
        >
          <ActionDetails />
        </Drawer>
      )
    case ActiveJourneyEditContent.Canvas:
      switch (selectedComponent) {
        case 'AddBlock':
          return (
            <Drawer title={t('Add a block')}>
              <AddBlock />
            </Drawer>
          )
        case 'Footer':
          return (
            <Drawer title={t('Footer Properties')}>
              <Footer />
            </Drawer>
          )
        default:
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
