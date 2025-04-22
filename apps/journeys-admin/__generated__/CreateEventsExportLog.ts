/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyEventsExportLogInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CreateEventsExportLog
// ====================================================

export interface CreateEventsExportLog_createJourneyEventsExportLog {
  __typename: "JourneyEventsExportLog";
  id: string;
}

export interface CreateEventsExportLog {
  createJourneyEventsExportLog: CreateEventsExportLog_createJourneyEventsExportLog;
}

export interface CreateEventsExportLogVariables {
  input: JourneyEventsExportLogInput;
}
