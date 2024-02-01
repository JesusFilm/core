/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { EmailPreferencesUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateEmailPreferences
// ====================================================

export interface UpdateEmailPreferences_updateEmailPreferences {
  __typename: "EmailPreferences";
  id: string;
  journeyNotifications: boolean;
  teamInvites: boolean;
  thirdCategory: boolean;
}

export interface UpdateEmailPreferences {
  updateEmailPreferences: UpdateEmailPreferences_updateEmailPreferences | null;
}

export interface UpdateEmailPreferencesVariables {
  input: EmailPreferencesUpdateInput;
}
