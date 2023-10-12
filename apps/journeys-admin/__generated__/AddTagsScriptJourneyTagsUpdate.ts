/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AddTagsScriptJourneyTagsUpdate
// ====================================================

export interface AddTagsScriptJourneyTagsUpdate_journeyUpdate_tags {
  __typename: "Tag";
  id: string;
}

export interface AddTagsScriptJourneyTagsUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  tags: AddTagsScriptJourneyTagsUpdate_journeyUpdate_tags[];
}

export interface AddTagsScriptJourneyTagsUpdate {
  journeyUpdate: AddTagsScriptJourneyTagsUpdate_journeyUpdate;
}

export interface AddTagsScriptJourneyTagsUpdateVariables {
  journeyId: string;
  input: JourneyUpdateInput;
}
