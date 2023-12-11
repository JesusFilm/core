
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum ChannelStatus {
    deleted = "deleted",
    published = "published"
}

export enum NexusStatus {
    deleted = "deleted",
    published = "published"
}

export enum ResourceStatus {
    deleted = "deleted",
    published = "published"
}

export class ChannelCreateInput {
    nexusId: string;
    name: string;
    platform: string;
}

export class ChannelUpdateInput {
    name?: Nullable<string>;
    nexusId?: Nullable<string>;
    platform?: Nullable<string>;
}

export class ChannelFilter {
    ids?: Nullable<string[]>;
    name?: Nullable<string>;
    nexusId?: Nullable<string>;
    limit?: Nullable<number>;
    connected?: Nullable<boolean>;
}

export class ConnectYoutubeChannelInput {
    channelId: string;
    authCode: string;
    redirectUri: string;
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
    nexusId: string;
    name: string;
    refLink?: Nullable<string>;
    videoId?: Nullable<string>;
}

export class ResourceUpdateInput {
    name?: Nullable<string>;
}

export class ResourceFromGoogleDriveInput {
    fileIds: string[];
    authCode: string;
    nexusId: string;
}

export class ResourceFilter {
    ids?: Nullable<string[]>;
    name?: Nullable<string>;
    nexusId?: Nullable<string>;
    status?: Nullable<ResourceStatus>;
    limit?: Nullable<number>;
}

export class Channel {
    __typename?: 'Channel';
    id: string;
    nexusId: string;
    name: string;
    platform?: Nullable<string>;
    connected?: Nullable<boolean>;
    youtube?: Nullable<ChannelYoutube>;
    status: ChannelStatus;
}

export class ChannelYoutube {
    __typename?: 'ChannelYoutube';
    id: string;
    channelId?: Nullable<string>;
    channel?: Nullable<Channel>;
    title?: Nullable<string>;
    description?: Nullable<string>;
    youtubeId?: Nullable<string>;
    imageUrl?: Nullable<string>;
    refreshToken?: Nullable<string>;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract channels(where?: Nullable<ChannelFilter>): Nullable<Channel[]> | Promise<Nullable<Channel[]>>;

    abstract channel(id: string): Channel | Promise<Channel>;

    abstract nexuses(where?: Nullable<NexusFilter>): Nexus[] | Promise<Nexus[]>;

    abstract nexus(id: string): Nexus | Promise<Nexus>;

    abstract resources(where?: Nullable<ResourceFilter>): Nullable<Resource[]> | Promise<Nullable<Resource[]>>;

    abstract resource(id: string): Resource | Promise<Resource>;
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
    nexusId: string;
    nexus: Nexus;
    name: string;
    googleDrive?: Nullable<GoogleDriveResource>;
    createdAt: DateTime;
    status: ResourceStatus;
}

export class GoogleDriveResource {
    __typename?: 'GoogleDriveResource';
    id: string;
    resourceId: string;
    resource: Resource;
    title: string;
    driveId: string;
    mimeType: string;
    refreshToken: string;
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

    abstract connectYoutubeChannel(input: ConnectYoutubeChannelInput): Channel | Promise<Channel>;

    abstract nexusCreate(input: NexusCreateInput): Nexus | Promise<Nexus>;

    abstract nexusUpdate(id: string, input: NexusUpdateInput): Nexus | Promise<Nexus>;

    abstract nexusDelete(id: string): boolean | Promise<boolean>;

    abstract resourceCreate(input: ResourceCreateInput): Resource | Promise<Resource>;

    abstract resourceUpdate(id: string, input: ResourceUpdateInput): Resource | Promise<Resource>;

    abstract resourceDelete(id: string): Resource | Promise<Resource>;

    abstract resourceFromGoogleDrive(input: ResourceFromGoogleDriveInput): Nullable<Resource[]> | Promise<Nullable<Resource[]>>;
}

export class Language {
    id: string;
}

export type DateTime = String;
type Nullable<T> = T | null;
