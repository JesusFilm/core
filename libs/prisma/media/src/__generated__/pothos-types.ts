/* eslint-disable */
import type { Prisma, CloudflareImage, MuxVideo, MuxSubtitleTrack, CloudflareR2, Video, VideoTitle, VideoVariantDownload, VideoVariant, VideoEdition, VideoSubtitle, VideoSnippet, VideoDescription, VideoImageAlt, VideoStudyQuestion, ImportTimes, BibleCitation, BibleBook, BibleBookName, Keyword, TagName, Tag, Tagging, Taxonomy, TaxonomyName, UserMediaRole, UserMediaProfile, ShortLinkDomain, ShortLink, ShortLinkBlocklistDomain, VideoOrigin, Playlist, PlaylistItem, ArclightApiKey } from "./client/client.js";
import type { PothosPrismaDatamodel } from "@pothos/plugin-prisma";
export default interface PrismaTypes {
    CloudflareImage: {
        Name: "CloudflareImage";
        Shape: CloudflareImage;
        Include: Prisma.CloudflareImageInclude;
        Select: Prisma.CloudflareImageSelect;
        OrderBy: Prisma.CloudflareImageOrderByWithRelationInput;
        WhereUnique: Prisma.CloudflareImageWhereUniqueInput;
        Where: Prisma.CloudflareImageWhereInput;
        Create: {};
        Update: {};
        RelationName: "video";
        ListRelations: never;
        Relations: {
            video: {
                Shape: Video | null;
                Name: "Video";
                Nullable: true;
            };
        };
    };
    MuxVideo: {
        Name: "MuxVideo";
        Shape: MuxVideo;
        Include: Prisma.MuxVideoInclude;
        Select: Prisma.MuxVideoSelect;
        OrderBy: Prisma.MuxVideoOrderByWithRelationInput;
        WhereUnique: Prisma.MuxVideoWhereUniqueInput;
        Where: Prisma.MuxVideoWhereInput;
        Create: {};
        Update: {};
        RelationName: "videoVariants" | "subtitles";
        ListRelations: "videoVariants" | "subtitles";
        Relations: {
            videoVariants: {
                Shape: VideoVariant[];
                Name: "VideoVariant";
                Nullable: false;
            };
            subtitles: {
                Shape: MuxSubtitleTrack[];
                Name: "MuxSubtitleTrack";
                Nullable: false;
            };
        };
    };
    MuxSubtitleTrack: {
        Name: "MuxSubtitleTrack";
        Shape: MuxSubtitleTrack;
        Include: Prisma.MuxSubtitleTrackInclude;
        Select: Prisma.MuxSubtitleTrackSelect;
        OrderBy: Prisma.MuxSubtitleTrackOrderByWithRelationInput;
        WhereUnique: Prisma.MuxSubtitleTrackWhereUniqueInput;
        Where: Prisma.MuxSubtitleTrackWhereInput;
        Create: {};
        Update: {};
        RelationName: "muxVideo";
        ListRelations: never;
        Relations: {
            muxVideo: {
                Shape: MuxVideo;
                Name: "MuxVideo";
                Nullable: false;
            };
        };
    };
    CloudflareR2: {
        Name: "CloudflareR2";
        Shape: CloudflareR2;
        Include: Prisma.CloudflareR2Include;
        Select: Prisma.CloudflareR2Select;
        OrderBy: Prisma.CloudflareR2OrderByWithRelationInput;
        WhereUnique: Prisma.CloudflareR2WhereUniqueInput;
        Where: Prisma.CloudflareR2WhereInput;
        Create: {};
        Update: {};
        RelationName: "video" | "videoVariant" | "videoVariantDownloads" | "videoSubtitleSrt" | "videoSubtitleVtt";
        ListRelations: "videoVariantDownloads";
        Relations: {
            video: {
                Shape: Video | null;
                Name: "Video";
                Nullable: true;
            };
            videoVariant: {
                Shape: VideoVariant | null;
                Name: "VideoVariant";
                Nullable: true;
            };
            videoVariantDownloads: {
                Shape: VideoVariantDownload[];
                Name: "VideoVariantDownload";
                Nullable: false;
            };
            videoSubtitleSrt: {
                Shape: VideoSubtitle | null;
                Name: "VideoSubtitle";
                Nullable: true;
            };
            videoSubtitleVtt: {
                Shape: VideoSubtitle | null;
                Name: "VideoSubtitle";
                Nullable: true;
            };
        };
    };
    Video: {
        Name: "Video";
        Shape: Video;
        Include: Prisma.VideoInclude;
        Select: Prisma.VideoSelect;
        OrderBy: Prisma.VideoOrderByWithRelationInput;
        WhereUnique: Prisma.VideoWhereUniqueInput;
        Where: Prisma.VideoWhereInput;
        Create: {};
        Update: {};
        RelationName: "title" | "snippet" | "description" | "studyQuestions" | "imageAlt" | "subtitles" | "children" | "parents" | "variants" | "bibleCitation" | "keywords" | "images" | "cloudflareAssets" | "videoEditions" | "origin" | "userMediaProfiles";
        ListRelations: "title" | "snippet" | "description" | "studyQuestions" | "imageAlt" | "subtitles" | "children" | "parents" | "variants" | "bibleCitation" | "keywords" | "images" | "cloudflareAssets" | "videoEditions" | "userMediaProfiles";
        Relations: {
            title: {
                Shape: VideoTitle[];
                Name: "VideoTitle";
                Nullable: false;
            };
            snippet: {
                Shape: VideoSnippet[];
                Name: "VideoSnippet";
                Nullable: false;
            };
            description: {
                Shape: VideoDescription[];
                Name: "VideoDescription";
                Nullable: false;
            };
            studyQuestions: {
                Shape: VideoStudyQuestion[];
                Name: "VideoStudyQuestion";
                Nullable: false;
            };
            imageAlt: {
                Shape: VideoImageAlt[];
                Name: "VideoImageAlt";
                Nullable: false;
            };
            subtitles: {
                Shape: VideoSubtitle[];
                Name: "VideoSubtitle";
                Nullable: false;
            };
            children: {
                Shape: Video[];
                Name: "Video";
                Nullable: false;
            };
            parents: {
                Shape: Video[];
                Name: "Video";
                Nullable: false;
            };
            variants: {
                Shape: VideoVariant[];
                Name: "VideoVariant";
                Nullable: false;
            };
            bibleCitation: {
                Shape: BibleCitation[];
                Name: "BibleCitation";
                Nullable: false;
            };
            keywords: {
                Shape: Keyword[];
                Name: "Keyword";
                Nullable: false;
            };
            images: {
                Shape: CloudflareImage[];
                Name: "CloudflareImage";
                Nullable: false;
            };
            cloudflareAssets: {
                Shape: CloudflareR2[];
                Name: "CloudflareR2";
                Nullable: false;
            };
            videoEditions: {
                Shape: VideoEdition[];
                Name: "VideoEdition";
                Nullable: false;
            };
            origin: {
                Shape: VideoOrigin | null;
                Name: "VideoOrigin";
                Nullable: true;
            };
            userMediaProfiles: {
                Shape: UserMediaProfile[];
                Name: "UserMediaProfile";
                Nullable: false;
            };
        };
    };
    VideoTitle: {
        Name: "VideoTitle";
        Shape: VideoTitle;
        Include: Prisma.VideoTitleInclude;
        Select: Prisma.VideoTitleSelect;
        OrderBy: Prisma.VideoTitleOrderByWithRelationInput;
        WhereUnique: Prisma.VideoTitleWhereUniqueInput;
        Where: Prisma.VideoTitleWhereInput;
        Create: {};
        Update: {};
        RelationName: "video";
        ListRelations: never;
        Relations: {
            video: {
                Shape: Video;
                Name: "Video";
                Nullable: false;
            };
        };
    };
    VideoVariantDownload: {
        Name: "VideoVariantDownload";
        Shape: VideoVariantDownload;
        Include: Prisma.VideoVariantDownloadInclude;
        Select: Prisma.VideoVariantDownloadSelect;
        OrderBy: Prisma.VideoVariantDownloadOrderByWithRelationInput;
        WhereUnique: Prisma.VideoVariantDownloadWhereUniqueInput;
        Where: Prisma.VideoVariantDownloadWhereInput;
        Create: {};
        Update: {};
        RelationName: "asset" | "videoVariant";
        ListRelations: never;
        Relations: {
            asset: {
                Shape: CloudflareR2 | null;
                Name: "CloudflareR2";
                Nullable: true;
            };
            videoVariant: {
                Shape: VideoVariant | null;
                Name: "VideoVariant";
                Nullable: true;
            };
        };
    };
    VideoVariant: {
        Name: "VideoVariant";
        Shape: VideoVariant;
        Include: Prisma.VideoVariantInclude;
        Select: Prisma.VideoVariantSelect;
        OrderBy: Prisma.VideoVariantOrderByWithRelationInput;
        WhereUnique: Prisma.VideoVariantWhereUniqueInput;
        Where: Prisma.VideoVariantWhereInput;
        Create: {};
        Update: {};
        RelationName: "downloads" | "videoEdition" | "video" | "asset" | "muxVideo" | "playlistItems";
        ListRelations: "downloads" | "playlistItems";
        Relations: {
            downloads: {
                Shape: VideoVariantDownload[];
                Name: "VideoVariantDownload";
                Nullable: false;
            };
            videoEdition: {
                Shape: VideoEdition;
                Name: "VideoEdition";
                Nullable: false;
            };
            video: {
                Shape: Video | null;
                Name: "Video";
                Nullable: true;
            };
            asset: {
                Shape: CloudflareR2 | null;
                Name: "CloudflareR2";
                Nullable: true;
            };
            muxVideo: {
                Shape: MuxVideo | null;
                Name: "MuxVideo";
                Nullable: true;
            };
            playlistItems: {
                Shape: PlaylistItem[];
                Name: "PlaylistItem";
                Nullable: false;
            };
        };
    };
    VideoEdition: {
        Name: "VideoEdition";
        Shape: VideoEdition;
        Include: Prisma.VideoEditionInclude;
        Select: Prisma.VideoEditionSelect;
        OrderBy: Prisma.VideoEditionOrderByWithRelationInput;
        WhereUnique: Prisma.VideoEditionWhereUniqueInput;
        Where: Prisma.VideoEditionWhereInput;
        Create: {};
        Update: {};
        RelationName: "video" | "videoVariants" | "videoSubtitles";
        ListRelations: "videoVariants" | "videoSubtitles";
        Relations: {
            video: {
                Shape: Video;
                Name: "Video";
                Nullable: false;
            };
            videoVariants: {
                Shape: VideoVariant[];
                Name: "VideoVariant";
                Nullable: false;
            };
            videoSubtitles: {
                Shape: VideoSubtitle[];
                Name: "VideoSubtitle";
                Nullable: false;
            };
        };
    };
    VideoSubtitle: {
        Name: "VideoSubtitle";
        Shape: VideoSubtitle;
        Include: Prisma.VideoSubtitleInclude;
        Select: Prisma.VideoSubtitleSelect;
        OrderBy: Prisma.VideoSubtitleOrderByWithRelationInput;
        WhereUnique: Prisma.VideoSubtitleWhereUniqueInput;
        Where: Prisma.VideoSubtitleWhereInput;
        Create: {};
        Update: {};
        RelationName: "srtAsset" | "vttAsset" | "video" | "videoEdition";
        ListRelations: never;
        Relations: {
            srtAsset: {
                Shape: CloudflareR2 | null;
                Name: "CloudflareR2";
                Nullable: true;
            };
            vttAsset: {
                Shape: CloudflareR2 | null;
                Name: "CloudflareR2";
                Nullable: true;
            };
            video: {
                Shape: Video;
                Name: "Video";
                Nullable: false;
            };
            videoEdition: {
                Shape: VideoEdition;
                Name: "VideoEdition";
                Nullable: false;
            };
        };
    };
    VideoSnippet: {
        Name: "VideoSnippet";
        Shape: VideoSnippet;
        Include: Prisma.VideoSnippetInclude;
        Select: Prisma.VideoSnippetSelect;
        OrderBy: Prisma.VideoSnippetOrderByWithRelationInput;
        WhereUnique: Prisma.VideoSnippetWhereUniqueInput;
        Where: Prisma.VideoSnippetWhereInput;
        Create: {};
        Update: {};
        RelationName: "video";
        ListRelations: never;
        Relations: {
            video: {
                Shape: Video;
                Name: "Video";
                Nullable: false;
            };
        };
    };
    VideoDescription: {
        Name: "VideoDescription";
        Shape: VideoDescription;
        Include: Prisma.VideoDescriptionInclude;
        Select: Prisma.VideoDescriptionSelect;
        OrderBy: Prisma.VideoDescriptionOrderByWithRelationInput;
        WhereUnique: Prisma.VideoDescriptionWhereUniqueInput;
        Where: Prisma.VideoDescriptionWhereInput;
        Create: {};
        Update: {};
        RelationName: "video";
        ListRelations: never;
        Relations: {
            video: {
                Shape: Video;
                Name: "Video";
                Nullable: false;
            };
        };
    };
    VideoImageAlt: {
        Name: "VideoImageAlt";
        Shape: VideoImageAlt;
        Include: Prisma.VideoImageAltInclude;
        Select: Prisma.VideoImageAltSelect;
        OrderBy: Prisma.VideoImageAltOrderByWithRelationInput;
        WhereUnique: Prisma.VideoImageAltWhereUniqueInput;
        Where: Prisma.VideoImageAltWhereInput;
        Create: {};
        Update: {};
        RelationName: "video";
        ListRelations: never;
        Relations: {
            video: {
                Shape: Video;
                Name: "Video";
                Nullable: false;
            };
        };
    };
    VideoStudyQuestion: {
        Name: "VideoStudyQuestion";
        Shape: VideoStudyQuestion;
        Include: Prisma.VideoStudyQuestionInclude;
        Select: Prisma.VideoStudyQuestionSelect;
        OrderBy: Prisma.VideoStudyQuestionOrderByWithRelationInput;
        WhereUnique: Prisma.VideoStudyQuestionWhereUniqueInput;
        Where: Prisma.VideoStudyQuestionWhereInput;
        Create: {};
        Update: {};
        RelationName: "video";
        ListRelations: never;
        Relations: {
            video: {
                Shape: Video;
                Name: "Video";
                Nullable: false;
            };
        };
    };
    ImportTimes: {
        Name: "ImportTimes";
        Shape: ImportTimes;
        Include: never;
        Select: Prisma.ImportTimesSelect;
        OrderBy: Prisma.ImportTimesOrderByWithRelationInput;
        WhereUnique: Prisma.ImportTimesWhereUniqueInput;
        Where: Prisma.ImportTimesWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    BibleCitation: {
        Name: "BibleCitation";
        Shape: BibleCitation;
        Include: Prisma.BibleCitationInclude;
        Select: Prisma.BibleCitationSelect;
        OrderBy: Prisma.BibleCitationOrderByWithRelationInput;
        WhereUnique: Prisma.BibleCitationWhereUniqueInput;
        Where: Prisma.BibleCitationWhereInput;
        Create: {};
        Update: {};
        RelationName: "video" | "bibleBook";
        ListRelations: never;
        Relations: {
            video: {
                Shape: Video;
                Name: "Video";
                Nullable: false;
            };
            bibleBook: {
                Shape: BibleBook;
                Name: "BibleBook";
                Nullable: false;
            };
        };
    };
    BibleBook: {
        Name: "BibleBook";
        Shape: BibleBook;
        Include: Prisma.BibleBookInclude;
        Select: Prisma.BibleBookSelect;
        OrderBy: Prisma.BibleBookOrderByWithRelationInput;
        WhereUnique: Prisma.BibleBookWhereUniqueInput;
        Where: Prisma.BibleBookWhereInput;
        Create: {};
        Update: {};
        RelationName: "name" | "bibleCitation";
        ListRelations: "name" | "bibleCitation";
        Relations: {
            name: {
                Shape: BibleBookName[];
                Name: "BibleBookName";
                Nullable: false;
            };
            bibleCitation: {
                Shape: BibleCitation[];
                Name: "BibleCitation";
                Nullable: false;
            };
        };
    };
    BibleBookName: {
        Name: "BibleBookName";
        Shape: BibleBookName;
        Include: Prisma.BibleBookNameInclude;
        Select: Prisma.BibleBookNameSelect;
        OrderBy: Prisma.BibleBookNameOrderByWithRelationInput;
        WhereUnique: Prisma.BibleBookNameWhereUniqueInput;
        Where: Prisma.BibleBookNameWhereInput;
        Create: {};
        Update: {};
        RelationName: "bibleBook";
        ListRelations: never;
        Relations: {
            bibleBook: {
                Shape: BibleBook;
                Name: "BibleBook";
                Nullable: false;
            };
        };
    };
    Keyword: {
        Name: "Keyword";
        Shape: Keyword;
        Include: Prisma.KeywordInclude;
        Select: Prisma.KeywordSelect;
        OrderBy: Prisma.KeywordOrderByWithRelationInput;
        WhereUnique: Prisma.KeywordWhereUniqueInput;
        Where: Prisma.KeywordWhereInput;
        Create: {};
        Update: {};
        RelationName: "videos";
        ListRelations: "videos";
        Relations: {
            videos: {
                Shape: Video[];
                Name: "Video";
                Nullable: false;
            };
        };
    };
    TagName: {
        Name: "TagName";
        Shape: TagName;
        Include: Prisma.TagNameInclude;
        Select: Prisma.TagNameSelect;
        OrderBy: Prisma.TagNameOrderByWithRelationInput;
        WhereUnique: Prisma.TagNameWhereUniqueInput;
        Where: Prisma.TagNameWhereInput;
        Create: {};
        Update: {};
        RelationName: "tag";
        ListRelations: never;
        Relations: {
            tag: {
                Shape: Tag;
                Name: "Tag";
                Nullable: false;
            };
        };
    };
    Tag: {
        Name: "Tag";
        Shape: Tag;
        Include: Prisma.TagInclude;
        Select: Prisma.TagSelect;
        OrderBy: Prisma.TagOrderByWithRelationInput;
        WhereUnique: Prisma.TagWhereUniqueInput;
        Where: Prisma.TagWhereInput;
        Create: {};
        Update: {};
        RelationName: "Tagging" | "parent" | "children" | "tagName";
        ListRelations: "Tagging" | "children" | "tagName";
        Relations: {
            Tagging: {
                Shape: Tagging[];
                Name: "Tagging";
                Nullable: false;
            };
            parent: {
                Shape: Tag | null;
                Name: "Tag";
                Nullable: true;
            };
            children: {
                Shape: Tag[];
                Name: "Tag";
                Nullable: false;
            };
            tagName: {
                Shape: TagName[];
                Name: "TagName";
                Nullable: false;
            };
        };
    };
    Tagging: {
        Name: "Tagging";
        Shape: Tagging;
        Include: Prisma.TaggingInclude;
        Select: Prisma.TaggingSelect;
        OrderBy: Prisma.TaggingOrderByWithRelationInput;
        WhereUnique: Prisma.TaggingWhereUniqueInput;
        Where: Prisma.TaggingWhereInput;
        Create: {};
        Update: {};
        RelationName: "tag";
        ListRelations: never;
        Relations: {
            tag: {
                Shape: Tag;
                Name: "Tag";
                Nullable: false;
            };
        };
    };
    Taxonomy: {
        Name: "Taxonomy";
        Shape: Taxonomy;
        Include: Prisma.TaxonomyInclude;
        Select: Prisma.TaxonomySelect;
        OrderBy: Prisma.TaxonomyOrderByWithRelationInput;
        WhereUnique: Prisma.TaxonomyWhereUniqueInput;
        Where: Prisma.TaxonomyWhereInput;
        Create: {};
        Update: {};
        RelationName: "name";
        ListRelations: "name";
        Relations: {
            name: {
                Shape: TaxonomyName[];
                Name: "TaxonomyName";
                Nullable: false;
            };
        };
    };
    TaxonomyName: {
        Name: "TaxonomyName";
        Shape: TaxonomyName;
        Include: Prisma.TaxonomyNameInclude;
        Select: Prisma.TaxonomyNameSelect;
        OrderBy: Prisma.TaxonomyNameOrderByWithRelationInput;
        WhereUnique: Prisma.TaxonomyNameWhereUniqueInput;
        Where: Prisma.TaxonomyNameWhereInput;
        Create: {};
        Update: {};
        RelationName: "taxonomy";
        ListRelations: never;
        Relations: {
            taxonomy: {
                Shape: Taxonomy;
                Name: "Taxonomy";
                Nullable: false;
            };
        };
    };
    UserMediaRole: {
        Name: "UserMediaRole";
        Shape: UserMediaRole;
        Include: never;
        Select: Prisma.UserMediaRoleSelect;
        OrderBy: Prisma.UserMediaRoleOrderByWithRelationInput;
        WhereUnique: Prisma.UserMediaRoleWhereUniqueInput;
        Where: Prisma.UserMediaRoleWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    UserMediaProfile: {
        Name: "UserMediaProfile";
        Shape: UserMediaProfile;
        Include: Prisma.UserMediaProfileInclude;
        Select: Prisma.UserMediaProfileSelect;
        OrderBy: Prisma.UserMediaProfileOrderByWithRelationInput;
        WhereUnique: Prisma.UserMediaProfileWhereUniqueInput;
        Where: Prisma.UserMediaProfileWhereInput;
        Create: {};
        Update: {};
        RelationName: "userInterests";
        ListRelations: "userInterests";
        Relations: {
            userInterests: {
                Shape: Video[];
                Name: "Video";
                Nullable: false;
            };
        };
    };
    ShortLinkDomain: {
        Name: "ShortLinkDomain";
        Shape: ShortLinkDomain;
        Include: Prisma.ShortLinkDomainInclude;
        Select: Prisma.ShortLinkDomainSelect;
        OrderBy: Prisma.ShortLinkDomainOrderByWithRelationInput;
        WhereUnique: Prisma.ShortLinkDomainWhereUniqueInput;
        Where: Prisma.ShortLinkDomainWhereInput;
        Create: {};
        Update: {};
        RelationName: "shortLinks";
        ListRelations: "shortLinks";
        Relations: {
            shortLinks: {
                Shape: ShortLink[];
                Name: "ShortLink";
                Nullable: false;
            };
        };
    };
    ShortLink: {
        Name: "ShortLink";
        Shape: ShortLink;
        Include: Prisma.ShortLinkInclude;
        Select: Prisma.ShortLinkSelect;
        OrderBy: Prisma.ShortLinkOrderByWithRelationInput;
        WhereUnique: Prisma.ShortLinkWhereUniqueInput;
        Where: Prisma.ShortLinkWhereInput;
        Create: {};
        Update: {};
        RelationName: "domain";
        ListRelations: never;
        Relations: {
            domain: {
                Shape: ShortLinkDomain;
                Name: "ShortLinkDomain";
                Nullable: false;
            };
        };
    };
    ShortLinkBlocklistDomain: {
        Name: "ShortLinkBlocklistDomain";
        Shape: ShortLinkBlocklistDomain;
        Include: never;
        Select: Prisma.ShortLinkBlocklistDomainSelect;
        OrderBy: Prisma.ShortLinkBlocklistDomainOrderByWithRelationInput;
        WhereUnique: Prisma.ShortLinkBlocklistDomainWhereUniqueInput;
        Where: Prisma.ShortLinkBlocklistDomainWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    VideoOrigin: {
        Name: "VideoOrigin";
        Shape: VideoOrigin;
        Include: Prisma.VideoOriginInclude;
        Select: Prisma.VideoOriginSelect;
        OrderBy: Prisma.VideoOriginOrderByWithRelationInput;
        WhereUnique: Prisma.VideoOriginWhereUniqueInput;
        Where: Prisma.VideoOriginWhereInput;
        Create: {};
        Update: {};
        RelationName: "videos";
        ListRelations: "videos";
        Relations: {
            videos: {
                Shape: Video[];
                Name: "Video";
                Nullable: false;
            };
        };
    };
    Playlist: {
        Name: "Playlist";
        Shape: Playlist;
        Include: Prisma.PlaylistInclude;
        Select: Prisma.PlaylistSelect;
        OrderBy: Prisma.PlaylistOrderByWithRelationInput;
        WhereUnique: Prisma.PlaylistWhereUniqueInput;
        Where: Prisma.PlaylistWhereInput;
        Create: {};
        Update: {};
        RelationName: "items";
        ListRelations: "items";
        Relations: {
            items: {
                Shape: PlaylistItem[];
                Name: "PlaylistItem";
                Nullable: false;
            };
        };
    };
    PlaylistItem: {
        Name: "PlaylistItem";
        Shape: PlaylistItem;
        Include: Prisma.PlaylistItemInclude;
        Select: Prisma.PlaylistItemSelect;
        OrderBy: Prisma.PlaylistItemOrderByWithRelationInput;
        WhereUnique: Prisma.PlaylistItemWhereUniqueInput;
        Where: Prisma.PlaylistItemWhereInput;
        Create: {};
        Update: {};
        RelationName: "videoVariant" | "playlist";
        ListRelations: never;
        Relations: {
            videoVariant: {
                Shape: VideoVariant;
                Name: "VideoVariant";
                Nullable: false;
            };
            playlist: {
                Shape: Playlist;
                Name: "Playlist";
                Nullable: false;
            };
        };
    };
    ArclightApiKey: {
        Name: "ArclightApiKey";
        Shape: ArclightApiKey;
        Include: never;
        Select: Prisma.ArclightApiKeySelect;
        OrderBy: Prisma.ArclightApiKeyOrderByWithRelationInput;
        WhereUnique: Prisma.ArclightApiKeyWhereUniqueInput;
        Where: Prisma.ArclightApiKeyWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
}
export function getDatamodel(): PothosPrismaDatamodel { return JSON.parse("{\"datamodel\":{\"models\":{\"CloudflareImage\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"uploadUrl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"uploaded\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"ImageAspectRatio\",\"kind\":\"enum\",\"name\":\"aspectRatio\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"videoId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Video\",\"kind\":\"object\",\"name\":\"video\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CloudflareImageToVideo\",\"relationFromFields\":[\"videoId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"blurhash\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"blurhashAttemptedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isAi\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"MuxVideo\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"playbackId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"uploadUrl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"uploadId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"assetId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"duration\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"downloadable\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"readyToStream\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"VideoVariant\",\"kind\":\"object\",\"name\":\"videoVariants\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"MuxVideoToVideoVariant\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"MuxSubtitleTrack\",\"kind\":\"object\",\"name\":\"subtitles\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"MuxSubtitleTrackToMuxVideo\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"MuxSubtitleTrack\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"trackId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"MuxSubtitleTrackSource\",\"kind\":\"enum\",\"name\":\"source\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"MuxSubtitleTrackStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"bcp47\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"muxVideoId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"MuxVideo\",\"kind\":\"object\",\"name\":\"muxVideo\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"MuxSubtitleTrackToMuxVideo\",\"relationFromFields\":[\"muxVideoId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"CloudflareR2\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"fileName\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"originalFilename\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"uploadUrl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"publicUrl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"videoId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"contentType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"contentLength\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Video\",\"kind\":\"object\",\"name\":\"video\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CloudflareR2ToVideo\",\"relationFromFields\":[\"videoId\"],\"isUpdatedAt\":false},{\"type\":\"VideoVariant\",\"kind\":\"object\",\"name\":\"videoVariant\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CloudflareR2ToVideoVariant\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"VideoVariantDownload\",\"kind\":\"object\",\"name\":\"videoVariantDownloads\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CloudflareR2ToVideoVariantDownload\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"VideoSubtitle\",\"kind\":\"object\",\"name\":\"videoSubtitleSrt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SrtAsset\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"VideoSubtitle\",\"kind\":\"object\",\"name\":\"videoSubtitleVtt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VttAsset\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Video\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"VideoLabel\",\"kind\":\"enum\",\"name\":\"label\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"primaryLanguageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"published\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"VideoTitle\",\"kind\":\"object\",\"name\":\"title\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoToVideoTitle\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"VideoSnippet\",\"kind\":\"object\",\"name\":\"snippet\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoToVideoSnippet\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"VideoDescription\",\"kind\":\"object\",\"name\":\"description\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoToVideoDescription\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"VideoStudyQuestion\",\"kind\":\"object\",\"name\":\"studyQuestions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoToVideoStudyQuestion\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"VideoImageAlt\",\"kind\":\"object\",\"name\":\"imageAlt\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoToVideoImageAlt\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"slug\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"noIndex\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"childIds\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"locked\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"VideoSubtitle\",\"kind\":\"object\",\"name\":\"subtitles\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoToVideoSubtitle\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Video\",\"kind\":\"object\",\"name\":\"children\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ParentChild\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Video\",\"kind\":\"object\",\"name\":\"parents\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ParentChild\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"VideoVariant\",\"kind\":\"object\",\"name\":\"variants\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoToVideoVariant\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"BibleCitation\",\"kind\":\"object\",\"name\":\"bibleCitation\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BibleCitationToVideo\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Keyword\",\"kind\":\"object\",\"name\":\"keywords\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoToKeyword\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"CloudflareImage\",\"kind\":\"object\",\"name\":\"images\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CloudflareImageToVideo\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"CloudflareR2\",\"kind\":\"object\",\"name\":\"cloudflareAssets\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CloudflareR2ToVideo\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"VideoEdition\",\"kind\":\"object\",\"name\":\"videoEditions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoToVideoEdition\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"availableLanguages\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"VideoOrigin\",\"kind\":\"object\",\"name\":\"origin\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoToVideoOrigin\",\"relationFromFields\":[\"originId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"originId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Platform\",\"kind\":\"enum\",\"name\":\"restrictDownloadPlatforms\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Platform\",\"kind\":\"enum\",\"name\":\"restrictViewPlatforms\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"publishedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"UserMediaProfile\",\"kind\":\"object\",\"name\":\"userMediaProfiles\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UserMediaProfileToVideo\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"VideoTitle\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"value\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"primary\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"crowdInId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"videoId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Video\",\"kind\":\"object\",\"name\":\"video\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoToVideoTitle\",\"relationFromFields\":[\"videoId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"videoId\",\"languageId\"]}]},\"VideoVariantDownload\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"VideoVariantDownloadQuality\",\"kind\":\"enum\",\"name\":\"quality\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Float\",\"kind\":\"scalar\",\"name\":\"size\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"height\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"width\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"bitrate\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"version\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"url\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"assetId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"CloudflareR2\",\"kind\":\"object\",\"name\":\"asset\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CloudflareR2ToVideoVariantDownload\",\"relationFromFields\":[\"assetId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"videoVariantId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"VideoVariant\",\"kind\":\"object\",\"name\":\"videoVariant\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoVariantToVideoVariantDownload\",\"relationFromFields\":[\"videoVariantId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"quality\",\"videoVariantId\"]}]},\"VideoVariant\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"hls\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"dash\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"share\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"downloadable\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"VideoVariantDownload\",\"kind\":\"object\",\"name\":\"downloads\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoVariantToVideoVariantDownload\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"duration\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"lengthInMilliseconds\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"masterUrl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"masterWidth\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"masterHeight\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"published\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"version\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"edition\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"VideoEdition\",\"kind\":\"object\",\"name\":\"videoEdition\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoEditionToVideoVariant\",\"relationFromFields\":[\"edition\",\"videoId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"slug\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Video\",\"kind\":\"object\",\"name\":\"video\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoToVideoVariant\",\"relationFromFields\":[\"videoId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"videoId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"assetId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"CloudflareR2\",\"kind\":\"object\",\"name\":\"asset\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CloudflareR2ToVideoVariant\",\"relationFromFields\":[\"assetId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"muxVideoId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"MuxVideo\",\"kind\":\"object\",\"name\":\"muxVideo\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"MuxVideoToVideoVariant\",\"relationFromFields\":[\"muxVideoId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"brightcoveId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"PlaylistItem\",\"kind\":\"object\",\"name\":\"playlistItems\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PlaylistItemToVideoVariant\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"languageId\",\"videoId\"]}]},\"VideoEdition\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"videoId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Video\",\"kind\":\"object\",\"name\":\"video\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoToVideoEdition\",\"relationFromFields\":[\"videoId\"],\"isUpdatedAt\":false},{\"type\":\"VideoVariant\",\"kind\":\"object\",\"name\":\"videoVariants\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoEditionToVideoVariant\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"VideoSubtitle\",\"kind\":\"object\",\"name\":\"videoSubtitles\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoEditionToVideoSubtitle\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"name\",\"videoId\"]}]},\"VideoSubtitle\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"videoId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"edition\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"vttAssetId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"vttSrc\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"vttVersion\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"srtAssetId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"srtSrc\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"srtVersion\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"primary\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"CloudflareR2\",\"kind\":\"object\",\"name\":\"srtAsset\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SrtAsset\",\"relationFromFields\":[\"srtAssetId\"],\"isUpdatedAt\":false},{\"type\":\"CloudflareR2\",\"kind\":\"object\",\"name\":\"vttAsset\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VttAsset\",\"relationFromFields\":[\"vttAssetId\"],\"isUpdatedAt\":false},{\"type\":\"Video\",\"kind\":\"object\",\"name\":\"video\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoToVideoSubtitle\",\"relationFromFields\":[\"videoId\"],\"isUpdatedAt\":false},{\"type\":\"VideoEdition\",\"kind\":\"object\",\"name\":\"videoEdition\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoEditionToVideoSubtitle\",\"relationFromFields\":[\"edition\",\"videoId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"videoId\",\"edition\",\"languageId\"]}]},\"VideoSnippet\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"value\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"primary\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"videoId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Video\",\"kind\":\"object\",\"name\":\"video\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoToVideoSnippet\",\"relationFromFields\":[\"videoId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"videoId\",\"languageId\"]}]},\"VideoDescription\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"value\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"primary\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"videoId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"crowdInId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Video\",\"kind\":\"object\",\"name\":\"video\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoToVideoDescription\",\"relationFromFields\":[\"videoId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"videoId\",\"languageId\"]}]},\"VideoImageAlt\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"value\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"primary\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"videoId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Video\",\"kind\":\"object\",\"name\":\"video\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoToVideoImageAlt\",\"relationFromFields\":[\"videoId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"videoId\",\"languageId\"]}]},\"VideoStudyQuestion\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"value\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"order\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"primary\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"crowdInId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"videoId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Video\",\"kind\":\"object\",\"name\":\"video\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoToVideoStudyQuestion\",\"relationFromFields\":[\"videoId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"videoId\",\"languageId\",\"order\"]}]},\"ImportTimes\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"modelName\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastImport\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"BibleCitation\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"bibleBookId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"osisId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"chapterStart\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"chapterEnd\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"verseStart\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"verseEnd\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"videoId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"order\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Video\",\"kind\":\"object\",\"name\":\"video\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BibleCitationToVideo\",\"relationFromFields\":[\"videoId\"],\"isUpdatedAt\":false},{\"type\":\"BibleBook\",\"kind\":\"object\",\"name\":\"bibleBook\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BibleBookToBibleCitation\",\"relationFromFields\":[\"bibleBookId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"videoId\",\"bibleBookId\",\"chapterStart\",\"chapterEnd\",\"verseStart\",\"verseEnd\"]}]},\"BibleBook\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"osisId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BibleBookName\",\"kind\":\"object\",\"name\":\"name\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BibleBookToBibleBookName\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"alternateName\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"paratextAbbreviation\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isNewTestament\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"order\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BibleCitation\",\"kind\":\"object\",\"name\":\"bibleCitation\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BibleBookToBibleCitation\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"BibleBookName\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"value\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"primary\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"bibleBookId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"BibleBook\",\"kind\":\"object\",\"name\":\"bibleBook\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BibleBookToBibleBookName\",\"relationFromFields\":[\"bibleBookId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"bibleBookId\",\"languageId\"]}]},\"Keyword\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"value\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Video\",\"kind\":\"object\",\"name\":\"videos\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoToKeyword\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"value\",\"languageId\"]}]},\"TagName\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"value\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"primary\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"tagId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Tag\",\"kind\":\"object\",\"name\":\"tag\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TagToTagName\",\"relationFromFields\":[\"tagId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"tagId\",\"languageId\"]}]},\"Tag\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Tagging\",\"kind\":\"object\",\"name\":\"Tagging\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TagToTagging\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Tag\",\"kind\":\"object\",\"name\":\"parent\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ParentChildren\",\"relationFromFields\":[\"parentId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"parentId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Tag\",\"kind\":\"object\",\"name\":\"children\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ParentChildren\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Service\",\"kind\":\"enum\",\"name\":\"service\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"TagName\",\"kind\":\"object\",\"name\":\"tagName\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TagToTagName\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Tagging\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Tag\",\"kind\":\"object\",\"name\":\"tag\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TagToTagging\",\"relationFromFields\":[\"tagId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"tagId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"taggableType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"taggableId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"context\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"taggableId\",\"taggableType\",\"tagId\",\"context\"]}]},\"Taxonomy\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"category\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"term\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"TaxonomyName\",\"kind\":\"object\",\"name\":\"name\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TaxonomyToTaxonomyName\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"TaxonomyName\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"term\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"label\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageCode\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Taxonomy\",\"kind\":\"object\",\"name\":\"taxonomy\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TaxonomyToTaxonomyName\",\"relationFromFields\":[\"term\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"term\",\"languageId\"]}]},\"UserMediaRole\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"MediaRole\",\"kind\":\"enum\",\"name\":\"roles\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"UserMediaProfile\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Video\",\"kind\":\"object\",\"name\":\"userInterests\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"UserMediaProfileToVideo\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageInterestIds\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"countryInterestIds\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"ShortLinkDomain\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"hostname\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"apexName\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Service\",\"kind\":\"enum\",\"name\":\"services\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ShortLink\",\"kind\":\"object\",\"name\":\"shortLinks\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ShortLinkToShortLinkDomain\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"ShortLink\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"pathname\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"to\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"domainId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Service\",\"kind\":\"enum\",\"name\":\"service\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"brightcoveId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"VideoRedirectType\",\"kind\":\"enum\",\"name\":\"redirectType\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"bitrate\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"ShortLinkDomain\",\"kind\":\"object\",\"name\":\"domain\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ShortLinkToShortLinkDomain\",\"relationFromFields\":[\"domainId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"pathname\",\"domainId\"]}]},\"ShortLinkBlocklistDomain\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"hostname\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"VideoOrigin\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"description\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Video\",\"kind\":\"object\",\"name\":\"videos\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"VideoToVideoOrigin\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Playlist\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"note\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"noteUpdatedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"noteSharedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"sharedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"ownerId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"slug\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"PlaylistItem\",\"kind\":\"object\",\"name\":\"items\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PlaylistToPlaylistItem\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"PlaylistItem\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"order\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"videoVariantId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"playlistId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"VideoVariant\",\"kind\":\"object\",\"name\":\"videoVariant\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PlaylistItemToVideoVariant\",\"relationFromFields\":[\"videoVariantId\"],\"isUpdatedAt\":false},{\"type\":\"Playlist\",\"kind\":\"object\",\"name\":\"playlist\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PlaylistToPlaylistItem\",\"relationFromFields\":[\"playlistId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"playlistId\",\"order\"]}]},\"ArclightApiKey\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"key\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"desc\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DefaultPlatform\",\"kind\":\"enum\",\"name\":\"defaultPlatform\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]}}}}"); }