import { TFunction } from 'i18next'
import { ReactElement } from 'react'

import File5Icon from '@core/shared/ui/icons/File5'
import Layers4Icon from '@core/shared/ui/icons/Layers4'
import Plus2Icon from '@core/shared/ui/icons/Plus2'
import TranslateIcon from '@core/shared/ui/icons/Translate'

import { CampaignPanel } from '../CampaignEditorProvider'

export interface PanelEntry {
  panel: CampaignPanel
  /** The panel's name, on its rail toggle and as the docked panel's label. */
  label: (t: TFunction) => string
  /** The hotkey that opens it, shown in the toggle's tooltip. */
  shortcut?: string
  icon: ReactElement
}

/** The rail panels in rail order; one is always open, docked beside the rail. */
export const PANELS: readonly PanelEntry[] = [
  {
    panel: 'add',
    label: (t) => t('Add'),
    shortcut: 'A',
    icon: <Plus2Icon />
  },
  {
    panel: 'pages',
    label: (t) => t('Pages'),
    shortcut: 'P',
    icon: <File5Icon />
  },
  {
    panel: 'navigator',
    label: (t) => t('Navigator'),
    shortcut: 'Z',
    icon: <Layers4Icon />
  },
  {
    panel: 'localize',
    label: (t) => t('Localize'),
    icon: <TranslateIcon />
  }
]
