
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

export enum PrivacyStatus {
    "public" = "public",
    unlisted = "unlisted",
    "private" = "private"
}

export enum SourceType {
    googleDrive = "googleDrive",
    template = "template",
    archlight = "archlight",
    other = "other"
}

export enum ResourceStatus {
    deleted = "deleted",
    published = "published",
    processing = "processing",
    error = "error",
    uploaded = "uploaded"
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
    status?: Nullable<ChannelStatus>;
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

export class AddResourceFromGoogleDriveInput {
    accessToken: string;
    fileId: string;
    nexusId: string;
}

export class ResourceFromSpreadsheetInput {
    file?: Nullable<Upload>;
    nexusId: string;
}

export class GoogleAuthInput {
    authCode: string;
    url: string;
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
    status: ResourceStatus;
    createdAt: DateTime;
    updatedAt?: Nullable<DateTime>;
    deletedAt?: Nullable<DateTime>;
    googleDriveLink: string;
    category: string;
    privacy: PrivacyStatus;
    sourceType: SourceType;
    localizations: Nullable<ResourceLocalization>[];
}

export class ResourceLocalization {
    __typename?: 'ResourceLocalization';
    id: string;
    resourceId: string;
    title: string;
    description: string;
    keywords: string;
    language: string;
}

export class GoogleAuthResponse {
    __typename?: 'GoogleAuthResponse';
    id: string;
    accessToken: string;
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

    abstract resourceFromTemplate(nexusId: string, tokenId: string, spreadsheetId: string, drivefolderId: string): Nullable<Resource[]> | Promise<Nullable<Resource[]>>;

    abstract getGoogleAccessToken(input: GoogleAuthInput): GoogleAuthResponse | Promise<GoogleAuthResponse>;

    abstract uploadToYoutube(channelId: string, resourceId: string): Nullable<boolean> | Promise<Nullable<boolean>>;
}

export class Language {
    id: string;
}

export type DateTime = String;
export type Upload = any;
type Nullable<T> = T | null;
