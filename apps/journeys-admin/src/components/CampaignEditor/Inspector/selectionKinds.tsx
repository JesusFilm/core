import { ComponentType } from 'react'

import type { CampaignSelectionKind } from '../CampaignEditorProvider'
import { ThemePanel } from '../ThemePanel'

import { ColumnControls } from './ColumnControls'
import {
  CarouselCardActions,
  ColumnActions,
  ExtraActions,
  JourneyCardActions,
  RegionActions,
  SectionActions
} from './InspectorActions'
import {
  ButtonSettings,
  CampaignSettings,
  CarouselCardSettingsBody,
  ColumnSettings,
  InspectorSettingsProps,
  JourneyCardSettingsBody,
  RegionCardSettings,
  SectionSettings,
  TextSettings
} from './InspectorSettings'
import {
  ButtonStyle,
  SectionStyle,
  StyledBySection,
  TextStyle
} from './InspectorStyle'

/** What the Inspector shows for one kind of selection. */
export interface SelectionKindEntry {
  /** The Style tab's body. */
  style: ComponentType
  /** The Settings tab's body. */
  settings: ComponentType<InspectorSettingsProps>
  /** The actions row under the header; none when the kind has no actions. */
  actions?: ComponentType
}

/**
 * The Inspector's bodies for every selection kind, in one place: the
 * campaign's Theme and settings with nothing selected; a section's or chrome
 * block's Background and Colours and its editor; a column child's the same
 * under the column's type controls; a text or button Extra's controls and
 * link; and the cards and slots, styled by their section, with their own
 * settings. Moving, duplicating and deleting are the same Commands the canvas
 * runs.
 */
export const SELECTION_KINDS: Record<
  CampaignSelectionKind,
  SelectionKindEntry
> = {
  campaign: { style: ThemePanel, settings: CampaignSettings },
  section: {
    style: SectionStyle,
    settings: SectionSettings,
    actions: SectionActions
  },
  chrome: { style: SectionStyle, settings: SectionSettings },
  column: {
    style: SectionStyle,
    settings: ColumnSettings,
    actions: ColumnActions
  },
  slot: { style: StyledBySection, settings: ColumnControls },
  text: { style: TextStyle, settings: TextSettings, actions: ExtraActions },
  button: {
    style: ButtonStyle,
    settings: ButtonSettings,
    actions: ExtraActions
  },
  card: {
    style: StyledBySection,
    settings: CarouselCardSettingsBody,
    actions: CarouselCardActions
  },
  journey: {
    style: StyledBySection,
    settings: JourneyCardSettingsBody,
    actions: JourneyCardActions
  },
  region: {
    style: StyledBySection,
    settings: RegionCardSettings,
    actions: RegionActions
  }
}
