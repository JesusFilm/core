/* eslint-disable */
import type { Prisma, CloudflareImage, CloudflareVideo, MuxVideo, Video, VideoTitle, VideoVariantDownload, VideoVariant, VideoSubtitle, VideoSnippet, VideoDescription, VideoImageAlt, VideoStudyQuestion, ImportTimes, BibleCitation, BibleBook, BibleBookName, Keyword, TagName, Tag, Tagging, UserMediaRole } from ".prisma/api-media-client";
export default interface PrismaTypes {
    CloudflareImage: {
        Name: "CloudflareImage";
        Shape: CloudflareImage;
        Include: Prisma.CloudflareImageInclude;
        Select: Prisma.CloudflareImageSelect;
        OrderBy: Prisma.CloudflareImageOrderByWithRelationAndSearchRelevanceInput;
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
    CloudflareVideo: {
        Name: "CloudflareVideo";
        Shape: CloudflareVideo;
        Include: never;
        Select: Prisma.CloudflareVideoSelect;
        OrderBy: Prisma.CloudflareVideoOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.CloudflareVideoWhereUniqueInput;
        Where: Prisma.CloudflareVideoWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    MuxVideo: {
        Name: "MuxVideo";
        Shape: MuxVideo;
        Include: never;
        Select: Prisma.MuxVideoSelect;
        OrderBy: Prisma.MuxVideoOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.MuxVideoWhereUniqueInput;
        Where: Prisma.MuxVideoWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    Video: {
        Name: "Video";
        Shape: Video;
        Include: Prisma.VideoInclude;
        Select: Prisma.VideoSelect;
        OrderBy: Prisma.VideoOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.VideoWhereUniqueInput;
        Where: Prisma.VideoWhereInput;
        Create: {};
        Update: {};
        RelationName: "title" | "snippet" | "description" | "studyQuestions" | "imageAlt" | "subtitles" | "children" | "parent" | "variants" | "bibleCitation" | "keywords" | "images";
        ListRelations: "title" | "snippet" | "description" | "studyQuestions" | "imageAlt" | "subtitles" | "children" | "parent" | "variants" | "bibleCitation" | "keywords" | "images";
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
            parent: {
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
        };
    };
    VideoTitle: {
        Name: "VideoTitle";
        Shape: VideoTitle;
        Include: Prisma.VideoTitleInclude;
        Select: Prisma.VideoTitleSelect;
        OrderBy: Prisma.VideoTitleOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.VideoTitleWhereUniqueInput;
        Where: Prisma.VideoTitleWhereInput;
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
    VideoVariantDownload: {
        Name: "VideoVariantDownload";
        Shape: VideoVariantDownload;
        Include: Prisma.VideoVariantDownloadInclude;
        Select: Prisma.VideoVariantDownloadSelect;
        OrderBy: Prisma.VideoVariantDownloadOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.VideoVariantDownloadWhereUniqueInput;
        Where: Prisma.VideoVariantDownloadWhereInput;
        Create: {};
        Update: {};
        RelationName: "videoVariant";
        ListRelations: never;
        Relations: {
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
        OrderBy: Prisma.VideoVariantOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.VideoVariantWhereUniqueInput;
        Where: Prisma.VideoVariantWhereInput;
        Create: {};
        Update: {};
        RelationName: "downloads" | "video";
        ListRelations: "downloads";
        Relations: {
            downloads: {
                Shape: VideoVariantDownload[];
                Name: "VideoVariantDownload";
                Nullable: false;
            };
            video: {
                Shape: Video | null;
                Name: "Video";
                Nullable: true;
            };
        };
    };
    VideoSubtitle: {
        Name: "VideoSubtitle";
        Shape: VideoSubtitle;
        Include: Prisma.VideoSubtitleInclude;
        Select: Prisma.VideoSubtitleSelect;
        OrderBy: Prisma.VideoSubtitleOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.VideoSubtitleWhereUniqueInput;
        Where: Prisma.VideoSubtitleWhereInput;
        Create: {};
        Update: {};
        RelationName: "Video";
        ListRelations: never;
        Relations: {
            Video: {
                Shape: Video;
                Name: "Video";
                Nullable: false;
            };
        };
    };
    VideoSnippet: {
        Name: "VideoSnippet";
        Shape: VideoSnippet;
        Include: Prisma.VideoSnippetInclude;
        Select: Prisma.VideoSnippetSelect;
        OrderBy: Prisma.VideoSnippetOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.VideoSnippetWhereUniqueInput;
        Where: Prisma.VideoSnippetWhereInput;
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
    VideoDescription: {
        Name: "VideoDescription";
        Shape: VideoDescription;
        Include: Prisma.VideoDescriptionInclude;
        Select: Prisma.VideoDescriptionSelect;
        OrderBy: Prisma.VideoDescriptionOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.VideoDescriptionWhereUniqueInput;
        Where: Prisma.VideoDescriptionWhereInput;
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
    VideoImageAlt: {
        Name: "VideoImageAlt";
        Shape: VideoImageAlt;
        Include: Prisma.VideoImageAltInclude;
        Select: Prisma.VideoImageAltSelect;
        OrderBy: Prisma.VideoImageAltOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.VideoImageAltWhereUniqueInput;
        Where: Prisma.VideoImageAltWhereInput;
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
    VideoStudyQuestion: {
        Name: "VideoStudyQuestion";
        Shape: VideoStudyQuestion;
        Include: Prisma.VideoStudyQuestionInclude;
        Select: Prisma.VideoStudyQuestionSelect;
        OrderBy: Prisma.VideoStudyQuestionOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.VideoStudyQuestionWhereUniqueInput;
        Where: Prisma.VideoStudyQuestionWhereInput;
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
    ImportTimes: {
        Name: "ImportTimes";
        Shape: ImportTimes;
        Include: never;
        Select: Prisma.ImportTimesSelect;
        OrderBy: Prisma.ImportTimesOrderByWithRelationAndSearchRelevanceInput;
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
        OrderBy: Prisma.BibleCitationOrderByWithRelationAndSearchRelevanceInput;
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
        OrderBy: Prisma.BibleBookOrderByWithRelationAndSearchRelevanceInput;
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
        OrderBy: Prisma.BibleBookNameOrderByWithRelationAndSearchRelevanceInput;
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
        OrderBy: Prisma.KeywordOrderByWithRelationAndSearchRelevanceInput;
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
        OrderBy: Prisma.TagNameOrderByWithRelationAndSearchRelevanceInput;
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
        OrderBy: Prisma.TagOrderByWithRelationAndSearchRelevanceInput;
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
        OrderBy: Prisma.TaggingOrderByWithRelationAndSearchRelevanceInput;
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
    UserMediaRole: {
        Name: "UserMediaRole";
        Shape: UserMediaRole;
        Include: never;
        Select: Prisma.UserMediaRoleSelect;
        OrderBy: Prisma.UserMediaRoleOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.UserMediaRoleWhereUniqueInput;
        Where: Prisma.UserMediaRoleWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
}