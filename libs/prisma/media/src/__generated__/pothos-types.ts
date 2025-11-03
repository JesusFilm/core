/* eslint-disable */
import type { Prisma, CloudflareImage, MuxVideo, CloudflareR2, Video, VideoTitle, VideoVariantDownload, VideoVariant, VideoEdition, VideoSubtitle, VideoSnippet, VideoDescription, VideoImageAlt, VideoStudyQuestion, ImportTimes, BibleCitation, BibleBook, BibleBookName, Keyword, TagName, Tag, Tagging, Taxonomy, TaxonomyName, UserMediaRole, ShortLinkDomain, ShortLink, ShortLinkBlocklistDomain, VideoOrigin, Playlist, PlaylistItem, ArclightApiKey } from ".prisma/api-media-client/index.js";
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
        RelationName: "videoVariants";
        ListRelations: "videoVariants";
        Relations: {
            videoVariants: {
                Shape: VideoVariant[];
                Name: "VideoVariant";
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
        RelationName: "title" | "snippet" | "description" | "studyQuestions" | "imageAlt" | "subtitles" | "children" | "parents" | "variants" | "bibleCitation" | "keywords" | "images" | "cloudflareAssets" | "videoEditions" | "origin";
        ListRelations: "title" | "snippet" | "description" | "studyQuestions" | "imageAlt" | "subtitles" | "children" | "parents" | "variants" | "bibleCitation" | "keywords" | "images" | "cloudflareAssets" | "videoEditions";
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