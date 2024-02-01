/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetEmailPreference
// ====================================================

export interface GetEmailPreference_emailPreference {
  __typename: "EmailPreferences";
  teamInvites: boolean;
  thirdCategory: boolean;
  journeyNotifications: boolean;
}

export interface GetEmailPreference {
  emailPreference: GetEmailPreference_emailPreference | null;
}

export interface GetEmailPreferenceVariables {
  emailPreferenceId: string;
  idType: string;
}
