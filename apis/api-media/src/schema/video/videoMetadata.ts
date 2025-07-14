import { builder } from '../builder'

// Define the SocialMedia type for the nested JSON object
const SocialMedia = builder.inputType('SocialMedia', {
  fields: (t) => ({
    youtube: t.string({ required: false }),
    tiktok: t.string({ required: false }),
    facebook: t.string({ required: false }),
    instagram: t.string({ required: false }),
    other: t.string({ required: false })
  })
})

const VideoMetadata = builder.prismaObject('VideoMetadata', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    altTitle: t.exposeString('altTitle', { nullable: true }),
    resourceLocation: t.exposeString('resourceLocation', { nullable: true }),
    createdByJFP: t.exposeBoolean('createdByJFP', { nullable: true }),
    ownedByJFP: t.exposeBoolean('ownedByJFP', { nullable: true }),
    filmmaker: t.exposeString('filmmaker', { nullable: true }),
    licensedDate: t.expose('licensedDate', { type: 'Date', nullable: true }),
    filmmakerContact: t.exposeString('filmmakerContact', { nullable: true }),
    contractLink: t.exposeString('contractLink', { nullable: true }),
    expires: t.exposeBoolean('expires', { nullable: true }),
    expirationDate: t.expose('expirationDate', {
      type: 'Date',
      nullable: true
    }),
    isMusicLicensed: t.exposeBoolean('isMusicLicensed', { nullable: true }),
    musicName: t.exposeString('musicName', { nullable: true }),
    musicVendor: t.exposeString('musicVendor', { nullable: true }),
    hasAwards: t.exposeBoolean('hasAwards', { nullable: true }),
    awards: t.exposeString('awards', { nullable: true }),
    hasTvBroadcastRights: t.exposeBoolean('hasTvBroadcastRights', {
      nullable: true
    }),
    hasMusicBroadcastRights: t.exposeBoolean('hasMusicBroadcastRights', {
      nullable: true
    }),
    needsSubtitles: t.exposeBoolean('needsSubtitles', { nullable: true }),
    needsDubbing: t.exposeBoolean('needsDubbing', { nullable: true }),
    canAiDub: t.exposeBoolean('canAiDub', { nullable: true }),
    canPartnersHost: t.exposeBoolean('canPartnersHost', { nullable: true }),
    canMinistriesHost: t.exposeBoolean('canMinistriesHost', { nullable: true }),
    socialMedia: t.expose('socialMedia', { type: 'JSON', nullable: true }),
    video: t.relation('video', { nullable: false })
  })
})

// Input type for creating/updating video metadata
const VideoMetadataInput = builder.inputType('VideoMetadataInput', {
  fields: (t) => ({
    altTitle: t.string({ required: false }),
    resourceLocation: t.string({ required: false }),
    createdByJFP: t.boolean({ required: false }),
    ownedByJFP: t.boolean({ required: false }),
    filmmaker: t.string({ required: false }),
    licensedDate: t.field({ type: 'Date', required: false }),
    filmmakerContact: t.string({ required: false }),
    contractLink: t.string({ required: false }),
    expires: t.boolean({ required: false }),
    expirationDate: t.field({ type: 'Date', required: false }),
    isMusicLicensed: t.boolean({ required: false }),
    musicName: t.string({ required: false }),
    musicVendor: t.string({ required: false }),
    hasAwards: t.boolean({ required: false }),
    awards: t.string({ required: false }),
    hasTvBroadcastRights: t.boolean({ required: false }),
    hasMusicBroadcastRights: t.boolean({ required: false }),
    needsSubtitles: t.boolean({ required: false }),
    needsDubbing: t.boolean({ required: false }),
    canAiDub: t.boolean({ required: false }),
    canPartnersHost: t.boolean({ required: false }),
    canMinistriesHost: t.boolean({ required: false }),
    socialMedia: t.field({ type: SocialMedia, required: false })
  })
})

export { VideoMetadata, VideoMetadataInput, SocialMedia }
