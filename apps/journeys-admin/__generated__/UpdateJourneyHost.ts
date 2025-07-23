/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateJourneyHost
// ====================================================

export interface UpdateJourneyHost_journeyUpdate_host {
  __typename: "Host";
  id: string | null;
}

export interface UpdateJourneyHost_journeyUpdate {
  __typename: "Journey";
  id: string;
  host: UpdateJourneyHost_journeyUpdate_host | null;
}

export interface UpdateJourneyHost {
  journeyUpdate: UpdateJourneyHost_journeyUpdate;
}

export interface UpdateJourneyHostVariables {
  id: string;
  input: JourneyUpdateInput;
}
