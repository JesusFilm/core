/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MultiselectBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: MultiselectBlockUpdate_SettingsPanel
// ====================================================

export interface MultiselectBlockUpdate_SettingsPanel_multiselectBlockUpdate {
  __typename: "MultiselectBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  min: number | null;
  max: number | null;
}

export interface MultiselectBlockUpdate_SettingsPanel {
  multiselectBlockUpdate: MultiselectBlockUpdate_SettingsPanel_multiselectBlockUpdate;
}

export interface MultiselectBlockUpdate_SettingsPanelVariables {
  id: string;
  input: MultiselectBlockUpdateInput;
}
