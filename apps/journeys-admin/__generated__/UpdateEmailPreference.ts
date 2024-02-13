/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { EmailPreferenceUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateEmailPreference
// ====================================================

export interface UpdateEmailPreference_updateEmailPreference {
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

export interface UpdateEmailPreference {
  updateEmailPreference: UpdateEmailPreference_updateEmailPreference | null;
}

export interface UpdateEmailPreferenceVariables {
  input: EmailPreferenceUpdateInput;
}
