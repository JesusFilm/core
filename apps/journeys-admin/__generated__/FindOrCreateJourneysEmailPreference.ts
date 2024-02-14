/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: FindOrCreateJourneysEmailPreference
// ====================================================

export interface FindOrCreateJourneysEmailPreference_findOrCreateJourneysEmailPreference {
  __typename: "JourneysEmailPreference";
  email: string;
  unsubscribeAll: boolean;
  teamInvite: boolean;
  teamRemoved: boolean;
  teamInviteAccepted: boolean;
  journeyEditInvite: boolean;
  journeyRequestApproved: boolean;
  journeyAccessRequest: boolean;
}

export interface FindOrCreateJourneysEmailPreference {
  findOrCreateJourneysEmailPreference: FindOrCreateJourneysEmailPreference_findOrCreateJourneysEmailPreference | null;
}

export interface FindOrCreateJourneysEmailPreferenceVariables {
  email: string;
}
