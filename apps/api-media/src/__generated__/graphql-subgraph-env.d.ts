/* eslint-disable */
/* prettier-ignore */

export type introspection_types = {
    'BibleBook': { kind: 'OBJECT'; name: 'BibleBook'; fields: { 'alternateName': { name: 'alternateName'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'isNewTestament': { name: 'isNewTestament'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'name': { name: 'name'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'BibleBookName'; ofType: null; }; }; }; } }; 'order': { name: 'order'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; 'osisId': { name: 'osisId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'paratextAbbreviation': { name: 'paratextAbbreviation'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'BibleBookName': { kind: 'OBJECT'; name: 'BibleBookName'; fields: { 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; 'primary': { name: 'primary'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'value': { name: 'value'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'BibleCitation': { kind: 'OBJECT'; name: 'BibleCitation'; fields: { 'bibleBook': { name: 'bibleBook'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'BibleBook'; ofType: null; }; } }; 'chapterEnd': { name: 'chapterEnd'; type: { kind: 'SCALAR'; name: 'Int'; ofType: null; } }; 'chapterStart': { name: 'chapterStart'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'osisId': { name: 'osisId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'verseEnd': { name: 'verseEnd'; type: { kind: 'SCALAR'; name: 'Int'; ofType: null; } }; 'verseStart': { name: 'verseStart'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; 'video': { name: 'video'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Video'; ofType: null; }; } }; }; };
    'Boolean': unknown;
    'CloudflareImage': { kind: 'OBJECT'; name: 'CloudflareImage'; fields: { 'aspectRatio': { name: 'aspectRatio'; type: { kind: 'ENUM'; name: 'ImageAspectRatio'; ofType: null; } }; 'createdAt': { name: 'createdAt'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Date'; ofType: null; }; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'mobileCinematicHigh': { name: 'mobileCinematicHigh'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'mobileCinematicLow': { name: 'mobileCinematicLow'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'mobileCinematicVeryLow': { name: 'mobileCinematicVeryLow'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'thumbnail': { name: 'thumbnail'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'uploadUrl': { name: 'uploadUrl'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'url': { name: 'url'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'userId': { name: 'userId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'videoStill': { name: 'videoStill'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; }; };
    'CloudflareVideo': { kind: 'OBJECT'; name: 'CloudflareVideo'; fields: { 'createdAt': { name: 'createdAt'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Date'; ofType: null; }; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'readyToStream': { name: 'readyToStream'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'uploadUrl': { name: 'uploadUrl'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'userId': { name: 'userId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; }; };
    'Date': unknown;
    'Float': unknown;
    'ID': unknown;
    'IdType': { name: 'IdType'; enumValues: 'databaseId' | 'slug'; };
    'ImageAspectRatio': { name: 'ImageAspectRatio'; enumValues: 'hd' | 'banner'; };
    'ImageInput': { kind: 'INPUT_OBJECT'; name: 'ImageInput'; isOneOf: false; inputFields: [{ name: 'aspectRatio'; type: { kind: 'ENUM'; name: 'ImageAspectRatio'; ofType: null; }; defaultValue: null }, { name: 'videoId'; type: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; defaultValue: null }]; };
    'Int': unknown;
    'Keyword': { kind: 'OBJECT'; name: 'Keyword'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; 'value': { name: 'value'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'Language': { kind: 'OBJECT'; name: 'Language'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; }; };
    'LanguageWithSlug': { kind: 'OBJECT'; name: 'LanguageWithSlug'; fields: { 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; 'slug': { name: 'slug'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'MediaRole': { name: 'MediaRole'; enumValues: 'publisher'; };
    'Mutation': { kind: 'OBJECT'; name: 'Mutation'; fields: { 'cloudflareUploadComplete': { name: 'cloudflareUploadComplete'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'createCloudflareImageFromPrompt': { name: 'createCloudflareImageFromPrompt'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CloudflareImage'; ofType: null; }; } }; 'createCloudflareUploadByFile': { name: 'createCloudflareUploadByFile'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CloudflareImage'; ofType: null; }; } }; 'createCloudflareUploadByUrl': { name: 'createCloudflareUploadByUrl'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CloudflareImage'; ofType: null; }; } }; 'createCloudflareVideoUploadByFile': { name: 'createCloudflareVideoUploadByFile'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CloudflareVideo'; ofType: null; }; } }; 'createCloudflareVideoUploadByUrl': { name: 'createCloudflareVideoUploadByUrl'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CloudflareVideo'; ofType: null; }; } }; 'createImageBySegmindPrompt': { name: 'createImageBySegmindPrompt'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CloudflareImage'; ofType: null; }; } }; 'deleteCloudflareImage': { name: 'deleteCloudflareImage'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'deleteCloudflareVideo': { name: 'deleteCloudflareVideo'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'triggerUnsplashDownload': { name: 'triggerUnsplashDownload'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; }; };
    'Query': { kind: 'OBJECT'; name: 'Query'; fields: { 'adminVideo': { name: 'adminVideo'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Video'; ofType: null; }; } }; 'adminVideos': { name: 'adminVideos'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Video'; ofType: null; }; }; }; } }; 'adminVideosCount': { name: 'adminVideosCount'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; 'bibleBooks': { name: 'bibleBooks'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'BibleBook'; ofType: null; }; }; }; } }; 'bibleCitations': { name: 'bibleCitations'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'BibleCitation'; ofType: null; }; }; }; } }; 'getMyCloudflareImage': { name: 'getMyCloudflareImage'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CloudflareImage'; ofType: null; }; } }; 'getMyCloudflareImages': { name: 'getMyCloudflareImages'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CloudflareImage'; ofType: null; }; }; }; } }; 'getMyCloudflareVideo': { name: 'getMyCloudflareVideo'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CloudflareVideo'; ofType: null; }; } }; 'getMyCloudflareVideos': { name: 'getMyCloudflareVideos'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CloudflareVideo'; ofType: null; }; }; }; } }; 'keywords': { name: 'keywords'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Keyword'; ofType: null; }; }; }; } }; 'listUnsplashCollectionPhotos': { name: 'listUnsplashCollectionPhotos'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'UnsplashPhoto'; ofType: null; }; }; }; } }; 'searchUnsplashPhotos': { name: 'searchUnsplashPhotos'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'UnsplashQueryResponse'; ofType: null; }; } }; 'tags': { name: 'tags'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Tag'; ofType: null; }; }; }; } }; 'video': { name: 'video'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Video'; ofType: null; }; } }; 'videoVariants': { name: 'videoVariants'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'VideoVariant'; ofType: null; }; }; }; } }; 'videos': { name: 'videos'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Video'; ofType: null; }; }; }; } }; 'videosCount': { name: 'videosCount'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; }; };
    'SegmindModel': { name: 'SegmindModel'; enumValues: 'sdxl1__0_txt2img' | 'kandinsky2__2_txt2img' | 'sd1__5_paragon' | 'tinysd1__5_txt2img'; };
    'Service': { name: 'Service'; enumValues: 'apiJourneys' | 'apiLanguages' | 'apiMedia' | 'apiTags' | 'apiUsers' | 'apiVideos'; };
    'String': unknown;
    'Tag': { kind: 'OBJECT'; name: 'Tag'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'name': { name: 'name'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'TagName'; ofType: null; }; }; }; } }; 'parentId': { name: 'parentId'; type: { kind: 'SCALAR'; name: 'ID'; ofType: null; } }; 'service': { name: 'service'; type: { kind: 'ENUM'; name: 'Service'; ofType: null; } }; }; };
    'TagName': { kind: 'OBJECT'; name: 'TagName'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; 'primary': { name: 'primary'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'value': { name: 'value'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'UnsplashColor': { name: 'UnsplashColor'; enumValues: 'black_and_white' | 'black' | 'white' | 'yellow' | 'orange' | 'red' | 'purple' | 'magenta' | 'green' | 'teal' | 'blue'; };
    'UnsplashContentFilter': { name: 'UnsplashContentFilter'; enumValues: 'low' | 'high'; };
    'UnsplashOrderBy': { name: 'UnsplashOrderBy'; enumValues: 'latest' | 'relevant' | 'editorial'; };
    'UnsplashPhoto': { kind: 'OBJECT'; name: 'UnsplashPhoto'; fields: { 'alt_description': { name: 'alt_description'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'blur_hash': { name: 'blur_hash'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'color': { name: 'color'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'created_at': { name: 'created_at'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'description': { name: 'description'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'height': { name: 'height'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'likes': { name: 'likes'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; 'links': { name: 'links'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'UnsplashPhotoLinks'; ofType: null; }; } }; 'promoted_at': { name: 'promoted_at'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'updated_at': { name: 'updated_at'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'urls': { name: 'urls'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'UnsplashPhotoUrls'; ofType: null; }; } }; 'user': { name: 'user'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'UnsplashUser'; ofType: null; }; } }; 'width': { name: 'width'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; }; };
    'UnsplashPhotoLinks': { kind: 'OBJECT'; name: 'UnsplashPhotoLinks'; fields: { 'download': { name: 'download'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'download_location': { name: 'download_location'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'html': { name: 'html'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'self': { name: 'self'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'UnsplashPhotoOrientation': { name: 'UnsplashPhotoOrientation'; enumValues: 'landscape' | 'portrait' | 'squarish'; };
    'UnsplashPhotoUrls': { kind: 'OBJECT'; name: 'UnsplashPhotoUrls'; fields: { 'full': { name: 'full'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'raw': { name: 'raw'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'regular': { name: 'regular'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'small': { name: 'small'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'thumb': { name: 'thumb'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'UnsplashQueryResponse': { kind: 'OBJECT'; name: 'UnsplashQueryResponse'; fields: { 'results': { name: 'results'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'UnsplashPhoto'; ofType: null; }; }; }; } }; 'total': { name: 'total'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; 'total_pages': { name: 'total_pages'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; }; };
    'UnsplashUser': { kind: 'OBJECT'; name: 'UnsplashUser'; fields: { 'bio': { name: 'bio'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'first_name': { name: 'first_name'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'instagram_username': { name: 'instagram_username'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'last_name': { name: 'last_name'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'links': { name: 'links'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'UnsplashUserLinks'; ofType: null; }; } }; 'location': { name: 'location'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'name': { name: 'name'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'portfolio_url': { name: 'portfolio_url'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'profile_image': { name: 'profile_image'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'UnsplashUserImage'; ofType: null; }; } }; 'total_collections': { name: 'total_collections'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; 'total_likes': { name: 'total_likes'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; 'total_photos': { name: 'total_photos'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; 'twitter_username': { name: 'twitter_username'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'updated_at': { name: 'updated_at'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'username': { name: 'username'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'UnsplashUserImage': { kind: 'OBJECT'; name: 'UnsplashUserImage'; fields: { 'large': { name: 'large'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'medium': { name: 'medium'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'small': { name: 'small'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'UnsplashUserLinks': { kind: 'OBJECT'; name: 'UnsplashUserLinks'; fields: { 'followers': { name: 'followers'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'following': { name: 'following'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'html': { name: 'html'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'likes': { name: 'likes'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'photos': { name: 'photos'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'portfolio': { name: 'portfolio'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'self': { name: 'self'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'User': { kind: 'OBJECT'; name: 'User'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'mediaUserRoles': { name: 'mediaUserRoles'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'ENUM'; name: 'MediaRole'; ofType: null; }; }; }; } }; }; };
    'Video': { kind: 'OBJECT'; name: 'Video'; fields: { 'bibleCitations': { name: 'bibleCitations'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'BibleCitation'; ofType: null; }; }; }; } }; 'children': { name: 'children'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Video'; ofType: null; }; }; }; } }; 'childrenCount': { name: 'childrenCount'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; 'description': { name: 'description'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'VideoDescription'; ofType: null; }; }; }; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'image': { name: 'image'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'imageAlt': { name: 'imageAlt'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'VideoImageAlt'; ofType: null; }; }; }; } }; 'images': { name: 'images'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'CloudflareImage'; ofType: null; }; }; }; } }; 'keywords': { name: 'keywords'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Keyword'; ofType: null; }; }; }; } }; 'label': { name: 'label'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'ENUM'; name: 'VideoLabel'; ofType: null; }; } }; 'mobileCinematicHigh': { name: 'mobileCinematicHigh'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'mobileCinematicLow': { name: 'mobileCinematicLow'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'mobileCinematicVeryLow': { name: 'mobileCinematicVeryLow'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'noIndex': { name: 'noIndex'; type: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; } }; 'primaryLanguageId': { name: 'primaryLanguageId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'published': { name: 'published'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'slug': { name: 'slug'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'snippet': { name: 'snippet'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'VideoSnippet'; ofType: null; }; }; }; } }; 'studyQuestions': { name: 'studyQuestions'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'VideoStudyQuestion'; ofType: null; }; }; }; } }; 'subtitles': { name: 'subtitles'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'VideoSubtitle'; ofType: null; }; }; }; } }; 'thumbnail': { name: 'thumbnail'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'title': { name: 'title'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'VideoTitle'; ofType: null; }; }; }; } }; 'variant': { name: 'variant'; type: { kind: 'OBJECT'; name: 'VideoVariant'; ofType: null; } }; 'variantLanguages': { name: 'variantLanguages'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; }; }; } }; 'variantLanguagesCount': { name: 'variantLanguagesCount'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; 'variantLanguagesWithSlug': { name: 'variantLanguagesWithSlug'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'LanguageWithSlug'; ofType: null; }; }; }; } }; 'variants': { name: 'variants'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'VideoVariant'; ofType: null; }; }; }; } }; 'videoStill': { name: 'videoStill'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; }; };
    'VideoDescription': { kind: 'OBJECT'; name: 'VideoDescription'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; 'primary': { name: 'primary'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'value': { name: 'value'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'VideoImageAlt': { kind: 'OBJECT'; name: 'VideoImageAlt'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; 'primary': { name: 'primary'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'value': { name: 'value'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'VideoLabel': { name: 'VideoLabel'; enumValues: 'collection' | 'episode' | 'featureFilm' | 'segment' | 'series' | 'shortFilm' | 'trailer' | 'behindTheScenes'; };
    'VideoSnippet': { kind: 'OBJECT'; name: 'VideoSnippet'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; 'primary': { name: 'primary'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'value': { name: 'value'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'VideoStudyQuestion': { kind: 'OBJECT'; name: 'VideoStudyQuestion'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; 'primary': { name: 'primary'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'value': { name: 'value'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'VideoSubtitle': { kind: 'OBJECT'; name: 'VideoSubtitle'; fields: { 'edition': { name: 'edition'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; 'languageId': { name: 'languageId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'primary': { name: 'primary'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'srtSrc': { name: 'srtSrc'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'value': { name: 'value'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'vttSrc': { name: 'vttSrc'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; }; };
    'VideoTitle': { kind: 'OBJECT'; name: 'VideoTitle'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; 'primary': { name: 'primary'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; 'value': { name: 'value'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'VideoVariant': { kind: 'OBJECT'; name: 'VideoVariant'; fields: { 'dash': { name: 'dash'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'downloads': { name: 'downloads'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'VideoVariantDownload'; ofType: null; }; }; }; } }; 'duration': { name: 'duration'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; 'hls': { name: 'hls'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'language': { name: 'language'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Language'; ofType: null; }; } }; 'seriesLanguageCount': { name: 'seriesLanguageCount'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; 'share': { name: 'share'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; } }; 'slug': { name: 'slug'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'subtitle': { name: 'subtitle'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'VideoSubtitle'; ofType: null; }; }; }; } }; 'subtitleCount': { name: 'subtitleCount'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; }; };
    'VideoVariantDownload': { kind: 'OBJECT'; name: 'VideoVariantDownload'; fields: { 'height': { name: 'height'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'quality': { name: 'quality'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'ENUM'; name: 'VideoVariantDownloadQuality'; ofType: null; }; } }; 'size': { name: 'size'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Float'; ofType: null; }; } }; 'url': { name: 'url'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'width': { name: 'width'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Int'; ofType: null; }; } }; }; };
    'VideoVariantDownloadQuality': { name: 'VideoVariantDownloadQuality'; enumValues: 'low' | 'high'; };
    'VideosFilter': { kind: 'INPUT_OBJECT'; name: 'VideosFilter'; isOneOf: false; inputFields: [{ name: 'availableVariantLanguageIds'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; }; }; defaultValue: null }, { name: 'title'; type: { kind: 'SCALAR'; name: 'String'; ofType: null; }; defaultValue: null }, { name: 'labels'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'ENUM'; name: 'VideoLabel'; ofType: null; }; }; }; defaultValue: null }, { name: 'ids'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; }; }; defaultValue: null }, { name: 'subtitleLanguageIds'; type: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; }; }; defaultValue: null }]; };
};

/** An IntrospectionQuery representation of your schema.
 *
 * @remarks
 * This is an introspection of your schema saved as a file by GraphQLSP.
 * It will automatically be used by `gql.tada` to infer the types of your GraphQL documents.
 * If you need to reuse this data or update your `scalars`, update `tadaOutputLocation` to
 * instead save to a .ts instead of a .d.ts file.
 */
export type introspection = {
  name: 'subgraph';
  query: 'Query';
  mutation: 'Mutation';
  subscription: never;
  types: introspection_types;
};

import * as gqlTada from 'gql.tada';
