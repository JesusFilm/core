import * as Types from '../../../../__generated__/types';

export type VideoTriggerFieldsFragment = { __typename?: 'VideoTriggerBlock', id: string, parentBlockId?: string | null, triggerStart: number, triggerAction: { __typename?: 'EmailAction', email: string, parentBlockId: string, gtmEventName?: string | null } | { __typename?: 'LinkAction', url: string, parentBlockId: string, gtmEventName?: string | null } | { __typename?: 'NavigateToBlockAction', blockId: string, parentBlockId: string, gtmEventName?: string | null } };
