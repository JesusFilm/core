import * as Types from '../../../../__generated__/globalTypes';

export type VideoStartEventCreateMutationVariables = Types.Exact<{
  input: Types.VideoStartEventCreateInput;
}>;


export type VideoStartEventCreateMutation = { videoStartEventCreate: { __typename: 'VideoStartEvent', id: string } };

export type VideoPlayEventCreateMutationVariables = Types.Exact<{
  input: Types.VideoPlayEventCreateInput;
}>;


export type VideoPlayEventCreateMutation = { videoPlayEventCreate: { __typename: 'VideoPlayEvent', id: string } };

export type VideoPauseEventCreateMutationVariables = Types.Exact<{
  input: Types.VideoPauseEventCreateInput;
}>;


export type VideoPauseEventCreateMutation = { videoPauseEventCreate: { __typename: 'VideoPauseEvent', id: string } };

export type VideoCompleteEventCreateMutationVariables = Types.Exact<{
  input: Types.VideoCompleteEventCreateInput;
}>;


export type VideoCompleteEventCreateMutation = { videoCompleteEventCreate: { __typename: 'VideoCompleteEvent', id: string } };

export type VideoExpandEventCreateMutationVariables = Types.Exact<{
  input: Types.VideoExpandEventCreateInput;
}>;


export type VideoExpandEventCreateMutation = { videoExpandEventCreate: { __typename: 'VideoExpandEvent', id: string } };

export type VideoCollapseEventCreateMutationVariables = Types.Exact<{
  input: Types.VideoCollapseEventCreateInput;
}>;


export type VideoCollapseEventCreateMutation = { videoCollapseEventCreate: { __typename: 'VideoCollapseEvent', id: string } };

export type VideoProgressEventCreateMutationVariables = Types.Exact<{
  input: Types.VideoProgressEventCreateInput;
}>;


export type VideoProgressEventCreateMutation = { videoProgressEventCreate: { __typename: 'VideoProgressEvent', id: string } };
