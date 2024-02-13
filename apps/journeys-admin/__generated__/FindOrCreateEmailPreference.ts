/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: FindOrCreateEmailPreference
// ====================================================

export interface FindOrCreateEmailPreference_findOrCreateEmailPreference {
  __typename: "EmailPreference";
  email: string;
  unsubscribeAll: boolean;
  teamInvite: boolean;
  teamRemoved: boolean;
  teamInviteAccepted: boolean;
  journeyEditInvite: boolean;
  journeyRequestApproved: boolean;
  journeyAccessRequest: boolean;
}

export interface FindOrCreateEmailPreference {
  findOrCreateEmailPreference: FindOrCreateEmailPreference_findOrCreateEmailPreference | null;
}

export interface FindOrCreateEmailPreferenceVariables {
  email: string;
}
