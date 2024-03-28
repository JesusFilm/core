/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BatchFilter, BatchStatus, BatchTaskType, TaskStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: Batches
// ====================================================

export interface Batches_batches_tasks {
  __typename: "BatchTask";
  type: BatchTaskType;
  status: TaskStatus;
  progress: number | null;
  metadata: any | null;
  error: string | null;
}

export interface Batches_batches {
  __typename: "Batch";
  id: string;
  name: string;
  status: BatchStatus;
  progress: number | null;
  createdAt: any;
  tasks: Batches_batches_tasks[];
}

export interface Batches {
  batches: Batches_batches[] | null;
}

export interface BatchesVariables {
  where?: BatchFilter | null;
}
