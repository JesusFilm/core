/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: JourneysEmailPreference
// ====================================================

export interface JourneysEmailPreference_journeysEmailPreference {
  __typename: "JourneysEmailPreference";
  email: string;
  unsubscribeAll: boolean;
  accountNotifications: boolean;
}

export interface JourneysEmailPreference {
  journeysEmailPreference: JourneysEmailPreference_journeysEmailPreference | null;
}

export interface JourneysEmailPreferenceVariables {
  email: string;
}
