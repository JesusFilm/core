
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum BatchStatus {
    pending = "pending",
    processing = "processing",
    completed = "completed",
    failed = "failed"
}

export enum BatchTaskStatus {
    pending = "pending",
    processing = "processing",
    completed = "completed",
    failed = "failed"
}

export enum ChannelStatus {
    created = "created",
    deleted = "deleted",
    published = "published"
}

export enum NexusStatus {
    deleted = "deleted",
    published = "published"
}

export enum PrivacyStatus {
    "public" = "public",
    unlisted = "unlisted",
    "private" = "private"
}

export enum ResourceStatus {
    created = "created",
    deleted = "deleted",
    published = "published",
    processing = "processing",
    error = "error",
    uploaded = "uploaded"
}

export class BatchFilter {
    ids?: Nullable<string[]>;
    name?: Nullable<string>;
    status?: Nullable<BatchStatus>;
    limit?: Nullable<number>;
}

export class ChannelCreateInput {
    name: string;
    platform: string;
}

export class ChannelUpdateInput {
    name?: Nullable<string>;
    platform?: Nullable<string>;
}

export class ChannelFilter {
    ids?: Nullable<string[]>;
    name?: Nullable<string>;
    limit?: Nullable<number>;
    connected?: Nullable<boolean>;
    status?: Nullable<ChannelStatus>;
}

export class ConnectYoutubeChannelInput {
    channelId: string;
    accessToken: string;
}

export class NexusCreateInput {
    name: string;
    description?: Nullable<string>;
}

export class NexusUpdateInput {
    name?: Nullable<string>;
    description?: Nullable<string>;
}

export class NexusFilter {
    ids?: Nullable<string[]>;
    name?: Nullable<string>;
    description?: Nullable<string>;
    createdAt?: Nullable<DateTime>;
    limit?: Nullable<number>;
    orderByRecent?: Nullable<boolean>;
}

export class ResourceCreateInput {
    name: string;
}

export class ResourceUpdateInput {
    name?: Nullable<string>;
}

export class ResourceFromGoogleDriveInput {
    fileIds: string[];
    authCode: string;
}

export class ResourceFilter {
    ids?: Nullable<string[]>;
    name?: Nullable<string>;
    status?: Nullable<ResourceStatus>;
    limit?: Nullable<number>;
}

export class ResourceFromTemplateInput {
    accessToken: string;
    spreadsheetId: string;
    drivefolderId: string;
}

export class BatchJobBatch {
    id: string;
    batchName: string;
}

export class BatchJobResource {
    resource: string;
    channel: string;
}

export class BatchJobInput {
    batch: BatchJobBatch;
    resources: Nullable<BatchJobResource>[];
}

export class ResourceFromArrayInput {
    accessToken: string;
    spreadsheetData: SpreadsheetRowInput[];
}

export class SpreadsheetRowInput {
    channel?: Nullable<string>;
    filename?: Nullable<string>;
    title?: Nullable<string>;
    description?: Nullable<string>;
    customThumbnail?: Nullable<string>;
    keywords?: Nullable<string>;
    category?: Nullable<string>;
    privacy?: Nullable<string>;
    spokenLanguage?: Nullable<string>;
    videoId?: Nullable<string>;
    captionFile?: Nullable<string>;
    audioTrackFile?: Nullable<string>;
    language?: Nullable<string>;
    captionLanguage?: Nullable<string>;
    notifySubscribers?: Nullable<string>;
    playlistId?: Nullable<string>;
    isMadeForKids?: Nullable<string>;
    mediaComponentId?: Nullable<string>;
    textLanguage?: Nullable<string>;
}

export class Batch {
    __typename?: 'Batch';
    id: string;
    name: string;
    status?: Nullable<BatchStatus>;
    totalTasks?: Nullable<number>;
    completedTasks?: Nullable<number>;
    failedTasks?: Nullable<number>;
    progress?: Nullable<number>;
    batchTasks?: Nullable<Nullable<BatchTask>[]>;
    createdAt: DateTime;
    updatedAt?: Nullable<DateTime>;
}

export class BatchTask {
    __typename?: 'BatchTask';
    id: string;
    batchId: string;
    type?: Nullable<string>;
    task?: Nullable<Object>;
    progress?: Nullable<number>;
    error?: Nullable<string>;
    status?: Nullable<BatchTaskStatus>;
    createdAt: DateTime;
    updatedAt?: Nullable<DateTime>;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract batches(where?: Nullable<BatchFilter>): Nullable<Nullable<Batch>[]> | Promise<Nullable<Nullable<Batch>[]>>;

    abstract batch(id: string): Batch | Promise<Batch>;

    abstract channels(where?: Nullable<ChannelFilter>): Nullable<Channel[]> | Promise<Nullable<Channel[]>>;

    abstract channel(id: string): Channel | Promise<Channel>;

    abstract nexuses(where?: Nullable<NexusFilter>): Nexus[] | Promise<Nexus[]>;

    abstract nexus(id: string): Nexus | Promise<Nexus>;

    abstract resources(where?: Nullable<ResourceFilter>): Nullable<Resource[]> | Promise<Nullable<Resource[]>>;

    abstract resource(id: string): Resource | Promise<Resource>;
}

export class Channel {
    __typename?: 'Channel';
    id: string;
    name: string;
    platform?: Nullable<string>;
    connected?: Nullable<boolean>;
    title?: Nullable<string>;
    description?: Nullable<string>;
    youtubeId?: Nullable<string>;
    imageUrl?: Nullable<string>;
    createdAt: DateTime;
}

export class Nexus {
    __typename?: 'Nexus';
    id: string;
    name: string;
    description?: Nullable<string>;
    createdAt: DateTime;
    deletedAt?: Nullable<DateTime>;
    status: NexusStatus;
}

export class Resource {
    __typename?: 'Resource';
    id: string;
    name: string;
    category?: Nullable<string>;
    spokenLanguage?: Nullable<string>;
    customThumbnail?: Nullable<string>;
    playlistId?: Nullable<string>;
    isMadeForKids?: Nullable<boolean>;
    mediaComponentId?: Nullable<string>;
    notifySubscribers?: Nullable<boolean>;
    status?: Nullable<ResourceStatus>;
    privacy?: Nullable<PrivacyStatus>;
    resourceLocalizations?: Nullable<Nullable<ResourceLocalization>[]>;
    createdAt: DateTime;
    updatedAt?: Nullable<DateTime>;
    deletedAt?: Nullable<DateTime>;
}

export class ResourceLocalization {
    __typename?: 'ResourceLocalization';
    id: string;
    resourceId?: Nullable<string>;
    title?: Nullable<string>;
    description?: Nullable<string>;
    keywords?: Nullable<string>;
    language?: Nullable<string>;
}

export class Translation {
    __typename?: 'Translation';
    value: string;
    language: Language;
    primary: boolean;
}

export abstract class IMutation {
    abstract channelCreate(input: ChannelCreateInput): Channel | Promise<Channel>;

    abstract channelUpdate(id: string, input: ChannelUpdateInput): Channel | Promise<Channel>;

    abstract channelDelete(id: string): Channel | Promise<Channel>;

    abstract channelConnect(input: ConnectYoutubeChannelInput): Channel | Promise<Channel>;

    abstract nexusCreate(input: NexusCreateInput): Nexus | Promise<Nexus>;

    abstract nexusUpdate(id: string, input: NexusUpdateInput): Nexus | Promise<Nexus>;

    abstract nexusDelete(id: string): boolean | Promise<boolean>;

    abstract resourceCreate(input: ResourceCreateInput): Resource | Promise<Resource>;

    abstract resourceUpdate(id: string, input: ResourceUpdateInput): Resource | Promise<Resource>;

    abstract resourceDelete(id: string): Resource | Promise<Resource>;

    abstract resourceFromTemplate(input: ResourceFromTemplateInput): Nullable<Nullable<Resource>[]> | Promise<Nullable<Nullable<Resource>[]>>;

    abstract uploadToYoutube(channelId: string, resourceId: string): Nullable<boolean> | Promise<Nullable<boolean>>;

    abstract resourceFromArray(input: ResourceFromArrayInput): Nullable<Nullable<Resource>[]> | Promise<Nullable<Nullable<Resource>[]>>;
}

export class Language {
    id: string;
}

export type DateTime = String;
export type Object = any;
export type Upload = any;
type Nullable<T> = T | null;
