import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useEditor } from '@core/journeys/ui/EditorProvider'

import { Drawer } from '../Drawer'

import { AddBlock } from './AddBlock'
import { Footer } from './Footer'
import { Properties } from './Properties'

export function CanvasDetails(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedComponent }
  } = useEditor()
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
      return <Properties />
  }
}
