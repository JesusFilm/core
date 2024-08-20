import { MockedResponse } from '@apollo/client/testing'

import {
  ListUnsplashCollectionPhotos,
  ListUnsplashCollectionPhotosVariables
} from '../../../../../../../../__generated__/ListUnsplashCollectionPhotos'
import {
  TriggerUnsplashDownload,
  TriggerUnsplashDownloadVariables
} from '../../../../../../../../__generated__/TriggerUnsplashDownload'

import { LIST_UNSPLASH_COLLECTION_PHOTOS } from './UnsplashGallery'
import { TRIGGER_UNSPLASH_DOWNLOAD } from './UnsplashList/UnsplashList'

export const listUnsplashCollectionPhotosMock: MockedResponse<
  ListUnsplashCollectionPhotos,
  ListUnsplashCollectionPhotosVariables
> = {
  request: {
    query: LIST_UNSPLASH_COLLECTION_PHOTOS,
    variables: {
      collectionId: '4924556',
      page: 1,
      perPage: 20
    }
  },
  result: {
    data: {
      listUnsplashCollectionPhotos: [
        {
          id: 'dLAN46E5wVw',
          alt_description: 'white dome building during daytime',
          blur_hash: 'LEA,%vRjE1ay.AV@WAj@tnoef5ju',
          width: 6240,
          height: 4160,
          urls: {
            raw: 'https://images.unsplash.com/photo-1618777618311-92f986a6519d?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MXw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA&ixlib=rb-4.0.3',
            regular:
              'https://images.unsplash.com/photo-1618777618311-92f986a6519d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MXw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA&ixlib=rb-4.0.3&q=80&w=1080',
            __typename: 'UnsplashPhotoUrls'
          },
          links: {
            download_location:
              'https://api.unsplash.com/photos/dLAN46E5wVw/download?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MXw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA',
            __typename: 'UnsplashPhotoLinks'
          },
          user: {
            first_name: 'Levi Meir',
            last_name: 'Clancy',
            username: 'levimeirclancy',
            __typename: 'UnsplashUser'
          },
          __typename: 'UnsplashPhoto'
        },
        {
          id: 'UlipBbZpweg',
          alt_description: 'brown lion',
          blur_hash: 'LHFr#AxW9a%L0KM{IVRkoMD%D%R*',
          width: 6000,
          height: 4000,
          urls: {
            raw: 'https://images.unsplash.com/photo-1552410260-0fd9b577afa6?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258Mnw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA&ixlib=rb-4.0.3',
            regular:
              'https://images.unsplash.com/photo-1552410260-0fd9b577afa6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258Mnw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA&ixlib=rb-4.0.3&q=80&w=1080',
            __typename: 'UnsplashPhotoUrls'
          },
          links: {
            download_location:
              'https://api.unsplash.com/photos/UlipBbZpweg/download?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258Mnw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA',
            __typename: 'UnsplashPhotoLinks'
          },
          user: {
            first_name: 'Mika',
            last_name: 'Brandt',
            username: 'mikabr',
            __typename: 'UnsplashUser'
          },
          __typename: 'UnsplashPhoto'
        },
        {
          id: 'G2djeMdYSOM',
          alt_description: 'person standing near herd of lambs',
          blur_hash: 'L}Jkr[ayWCfk_NfQayfRt7fkj[fQ',
          width: 4032,
          height: 3024,
          urls: {
            raw: 'https://images.unsplash.com/photo-1517618488600-584b07386bc1?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258M3w0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA&ixlib=rb-4.0.3',
            regular:
              'https://images.unsplash.com/photo-1517618488600-584b07386bc1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258M3w0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA&ixlib=rb-4.0.3&q=80&w=1080',
            __typename: 'UnsplashPhotoUrls'
          },
          links: {
            download_location:
              'https://api.unsplash.com/photos/G2djeMdYSOM/download?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258M3w0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA',
            __typename: 'UnsplashPhotoLinks'
          },
          user: {
            first_name: 'Antonello',
            last_name: 'Falcone - The Wiseman',
            username: 'antonellofalcone',
            __typename: 'UnsplashUser'
          },
          __typename: 'UnsplashPhoto'
        },
        {
          id: 'CUWC-6MRcNg',
          alt_description: 'green grass field and trees',
          blur_hash: 'LxIEnfxtbJoe?dt7WYs.OabFRkoe',
          width: 3096,
          height: 4242,
          urls: {
            raw: 'https://images.unsplash.com/photo-1543051932-6ef9fecfbc80?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258NHw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA&ixlib=rb-4.0.3',
            regular:
              'https://images.unsplash.com/photo-1543051932-6ef9fecfbc80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258NHw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA&ixlib=rb-4.0.3&q=80&w=1080',
            __typename: 'UnsplashPhotoUrls'
          },
          links: {
            download_location:
              'https://api.unsplash.com/photos/CUWC-6MRcNg/download?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258NHw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA',
            __typename: 'UnsplashPhotoLinks'
          },
          user: {
            first_name: 'Tomasz',
            last_name: 'Filipek',
            username: 'tomasz_filipek',
            __typename: 'UnsplashUser'
          },
          __typename: 'UnsplashPhoto'
        },
        {
          id: 'jmqJzVFcPPM',
          alt_description: 'green tree near lake during daytime',
          blur_hash: 'LWEMg.M{S6WV.TjFt8ay0gs-t6of',
          width: 4701,
          height: 7045,
          urls: {
            raw: 'https://images.unsplash.com/photo-1594842083328-b4c397934f0e?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258NXw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA&ixlib=rb-4.0.3',
            regular:
              'https://images.unsplash.com/photo-1594842083328-b4c397934f0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258NXw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA&ixlib=rb-4.0.3&q=80&w=1080',
            __typename: 'UnsplashPhotoUrls'
          },
          links: {
            download_location:
              'https://api.unsplash.com/photos/jmqJzVFcPPM/download?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258NXw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA',
            __typename: 'UnsplashPhotoLinks'
          },
          user: {
            first_name: 'Daniel',
            last_name: 'Seßler',
            username: 'danielsessler',
            __typename: 'UnsplashUser'
          },
          __typename: 'UnsplashPhoto'
        },
        {
          id: 'SjIJLwysERU',
          alt_description: 'white bird in mid air',
          blur_hash: 'L4QA5J?H-=%M0LR-ozoJ-:I.ITV@',
          width: 6000,
          height: 4000,
          urls: {
            raw: 'https://images.unsplash.com/photo-1578675884045-596994ae6629?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258Nnw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA&ixlib=rb-4.0.3',
            regular:
              'https://images.unsplash.com/photo-1578675884045-596994ae6629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258Nnw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA&ixlib=rb-4.0.3&q=80&w=1080',
            __typename: 'UnsplashPhotoUrls'
          },
          links: {
            download_location:
              'https://api.unsplash.com/photos/SjIJLwysERU/download?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258Nnw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA',
            __typename: 'UnsplashPhotoLinks'
          },
          user: {
            first_name: 'Malcolm',
            last_name: 'Lightbody',
            username: 'mlightbody',
            __typename: 'UnsplashUser'
          },
          __typename: 'UnsplashPhoto'
        },
        {
          id: 'VkZuNpXxdIg',
          alt_description: 'boulder beside on valley and bushes',
          blur_hash: 'LaKA.,RP00t7_3jbIAj[_3Ios8t8',
          width: 5184,
          height: 3456,
          urls: {
            raw: 'https://images.unsplash.com/photo-1464979834326-b695d5e187e6?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258N3w0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA&ixlib=rb-4.0.3',
            regular:
              'https://images.unsplash.com/photo-1464979834326-b695d5e187e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258N3w0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA&ixlib=rb-4.0.3&q=80&w=1080',
            __typename: 'UnsplashPhotoUrls'
          },
          links: {
            download_location:
              'https://api.unsplash.com/photos/VkZuNpXxdIg/download?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258N3w0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA',
            __typename: 'UnsplashPhotoLinks'
          },
          user: {
            first_name: 'Robert',
            last_name: 'Bye',
            username: 'robertbye',
            __typename: 'UnsplashUser'
          },
          __typename: 'UnsplashPhoto'
        },
        {
          id: 'yCxh8_J2sWo',
          alt_description: 'brown concrete tunnel during daytime',
          blur_hash: 'LXD[zyRkDixZNGj@ofaz0Lof-;R+',
          width: 4000,
          height: 6000,
          urls: {
            raw: 'https://images.unsplash.com/photo-1579727633636-491dcae7cfd5?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258OHw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA&ixlib=rb-4.0.3',
            regular:
              'https://images.unsplash.com/photo-1579727633636-491dcae7cfd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258OHw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA&ixlib=rb-4.0.3&q=80&w=1080',
            __typename: 'UnsplashPhotoUrls'
          },
          links: {
            download_location:
              'https://api.unsplash.com/photos/yCxh8_J2sWo/download?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258OHw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA',
            __typename: 'UnsplashPhotoLinks'
          },
          user: {
            first_name: 'FRANCESCO',
            last_name: 'TOMMASINI',
            username: 'tomma5588',
            __typename: 'UnsplashUser'
          },
          __typename: 'UnsplashPhoto'
        },
        {
          id: 'ci1F55HaVWQ',
          alt_description: 'brown rock formation during daytime',
          blur_hash: 'LvKvEGxY0gNbwIoeX8jZRkj[t6jZ',
          width: 3024,
          height: 4032,
          urls: {
            raw: 'https://images.unsplash.com/photo-1586486942853-511cfe2c6313?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258OXw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA&ixlib=rb-4.0.3',
            regular:
              'https://images.unsplash.com/photo-1586486942853-511cfe2c6313?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258OXw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA&ixlib=rb-4.0.3&q=80&w=1080',
            __typename: 'UnsplashPhotoUrls'
          },
          links: {
            download_location:
              'https://api.unsplash.com/photos/ci1F55HaVWQ/download?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258OXw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA',
            __typename: 'UnsplashPhotoLinks'
          },
          user: {
            first_name: 'Pisit',
            last_name: 'Heng',
            username: 'pisitheng',
            __typename: 'UnsplashUser'
          },
          __typename: 'UnsplashPhoto'
        },
        {
          id: 'VFyfkKu_CsI',
          alt_description: 'a brown vase sitting on top of a shelf',
          blur_hash: 'L45OB9NG0y-AEMo~%1IoAFxZ-6I;',
          width: 3958,
          height: 4947,
          urls: {
            raw: 'https://images.unsplash.com/photo-1644176041496-393d63975fba?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTB8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3',
            regular:
              'https://images.unsplash.com/photo-1644176041496-393d63975fba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTB8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3&q=80&w=1080',
            __typename: 'UnsplashPhotoUrls'
          },
          links: {
            download_location:
              'https://api.unsplash.com/photos/VFyfkKu_CsI/download?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTB8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw',
            __typename: 'UnsplashPhotoLinks'
          },
          user: {
            first_name: 'Levi Meir',
            last_name: 'Clancy',
            username: 'levimeirclancy',
            __typename: 'UnsplashUser'
          },
          __typename: 'UnsplashPhoto'
        },
        {
          id: 'r9wi17AFTpE',
          alt_description: 'gray concrete tunnel during daytime',
          blur_hash: 'L9ByHcNdE2s:0LWCofax0#oJ-oWB',
          width: 3000,
          height: 4500,
          urls: {
            raw: 'https://images.unsplash.com/photo-1591814416053-53edf5ac5cf5?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTF8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3',
            regular:
              'https://images.unsplash.com/photo-1591814416053-53edf5ac5cf5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTF8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3&q=80&w=1080',
            __typename: 'UnsplashPhotoUrls'
          },
          links: {
            download_location:
              'https://api.unsplash.com/photos/r9wi17AFTpE/download?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTF8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw',
            __typename: 'UnsplashPhotoLinks'
          },
          user: {
            first_name: 'Mick',
            last_name: 'Haupt',
            username: 'rocinante_11',
            __typename: 'UnsplashUser'
          },
          __typename: 'UnsplashPhoto'
        },
        {
          id: 'ZBjulMxk0gE',
          alt_description: 'brown brick building during daytime',
          blur_hash: 'LaHLe%4mb_t5_4IAxvn~tRWBjrkC',
          width: 4928,
          height: 3264,
          urls: {
            raw: 'https://images.unsplash.com/photo-1605592233341-0e90b969d15f?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTJ8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3',
            regular:
              'https://images.unsplash.com/photo-1605592233341-0e90b969d15f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTJ8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3&q=80&w=1080',
            __typename: 'UnsplashPhotoUrls'
          },
          links: {
            download_location:
              'https://api.unsplash.com/photos/ZBjulMxk0gE/download?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTJ8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw',
            __typename: 'UnsplashPhotoLinks'
          },
          user: {
            first_name: 'Brian',
            last_name: 'Kairuz',
            username: 'briankairuz',
            __typename: 'UnsplashUser'
          },
          __typename: 'UnsplashPhoto'
        },
        {
          id: 'snDUMdYF7o8',
          alt_description: "men's white dress shirt",
          blur_hash: 'L8FYoXIUEItlO{xaIU-:%V%MR;sl',
          width: 3264,
          height: 4928,
          urls: {
            raw: 'https://images.unsplash.com/photo-1544164559-90f4302d5142?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTN8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3',
            regular:
              'https://images.unsplash.com/photo-1544164559-90f4302d5142?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTN8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3&q=80&w=1080',
            __typename: 'UnsplashPhotoUrls'
          },
          links: {
            download_location:
              'https://api.unsplash.com/photos/snDUMdYF7o8/download?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTN8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw',
            __typename: 'UnsplashPhotoLinks'
          },
          user: {
            first_name: 'Janosch Lino',
            last_name: null,
            username: 'janoschlino',
            __typename: 'UnsplashUser'
          },
          __typename: 'UnsplashPhoto'
        },
        {
          id: 'zc4P7snPpME',
          alt_description: 'shadow of camel in desert under blue sky',
          blur_hash: 'LpI}3TkDR+jZYRayjZbH9ajFj?bI',
          width: 3456,
          height: 5184,
          urls: {
            raw: 'https://images.unsplash.com/photo-1505934188420-775faed8a152?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTR8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3',
            regular:
              'https://images.unsplash.com/photo-1505934188420-775faed8a152?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTR8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3&q=80&w=1080',
            __typename: 'UnsplashPhotoUrls'
          },
          links: {
            download_location:
              'https://api.unsplash.com/photos/zc4P7snPpME/download?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTR8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw',
            __typename: 'UnsplashPhotoLinks'
          },
          user: {
            first_name: 'Dan',
            last_name: 'Calderwood',
            username: 'dancalders',
            __typename: 'UnsplashUser'
          },
          __typename: 'UnsplashPhoto'
        },
        {
          id: '0kVQh23Jspo',
          alt_description: 'brown sand with white sand',
          blur_hash: 'L8MZz5-:%gs:?wxuM{t7%M%NIUt7',
          width: 3648,
          height: 5472,
          urls: {
            raw: 'https://images.unsplash.com/photo-1617030525370-fc8f0fc559c8?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTV8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3',
            regular:
              'https://images.unsplash.com/photo-1617030525370-fc8f0fc559c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTV8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3&q=80&w=1080',
            __typename: 'UnsplashPhotoUrls'
          },
          links: {
            download_location:
              'https://api.unsplash.com/photos/0kVQh23Jspo/download?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTV8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw',
            __typename: 'UnsplashPhotoLinks'
          },
          user: {
            first_name: 'Priscilla',
            last_name: 'Du Preez 🇨🇦',
            username: 'priscilladupreez',
            __typename: 'UnsplashUser'
          },
          __typename: 'UnsplashPhoto'
        },
        {
          id: 'DNrjKP3srT4',
          alt_description: 'a man sitting at a table with his hand on his face',
          blur_hash: 'LGC$i%Hq-;I:=x-9xuM{oeRkNG%2',
          width: 5194,
          height: 3464,
          urls: {
            raw: 'https://images.unsplash.com/photo-1574957973698-418ac4c877af?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTZ8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3',
            regular:
              'https://images.unsplash.com/photo-1574957973698-418ac4c877af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTZ8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3&q=80&w=1080',
            __typename: 'UnsplashPhotoUrls'
          },
          links: {
            download_location:
              'https://api.unsplash.com/photos/DNrjKP3srT4/download?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTZ8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw',
            __typename: 'UnsplashPhotoLinks'
          },
          user: {
            first_name: 'kaleb',
            last_name: 'tapp',
            username: 'kalebtapp',
            __typename: 'UnsplashUser'
          },
          __typename: 'UnsplashPhoto'
        },
        {
          id: '5FMx2K9RtC4',
          alt_description: 'gray concrete wall',
          blur_hash: 'LOHVPCo0N[Rky?oKx]WEJAs:S5R+',
          width: 2690,
          height: 4032,
          urls: {
            raw: 'https://images.unsplash.com/photo-1562155392-856ac272b5cd?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTd8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3',
            regular:
              'https://images.unsplash.com/photo-1562155392-856ac272b5cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTd8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3&q=80&w=1080',
            __typename: 'UnsplashPhotoUrls'
          },
          links: {
            download_location:
              'https://api.unsplash.com/photos/5FMx2K9RtC4/download?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTd8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw',
            __typename: 'UnsplashPhotoLinks'
          },
          user: {
            first_name: 'Jon',
            last_name: 'Tyson',
            username: 'jontyson',
            __typename: 'UnsplashUser'
          },
          __typename: 'UnsplashPhoto'
        },
        {
          id: '5CsiB93tQZI',
          alt_description:
            'man in white shirt and blue denim jeans holding brown wooden stick',
          blur_hash: 'LHM*w1vx5Y.9.A~WIoD%:}xts+Vr',
          width: 4000,
          height: 6000,
          urls: {
            raw: 'https://images.unsplash.com/photo-1588943458226-b4807676801a?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTh8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3',
            regular:
              'https://images.unsplash.com/photo-1588943458226-b4807676801a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTh8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3&q=80&w=1080',
            __typename: 'UnsplashPhotoUrls'
          },
          links: {
            download_location:
              'https://api.unsplash.com/photos/5CsiB93tQZI/download?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTh8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw',
            __typename: 'UnsplashPhotoLinks'
          },
          user: {
            first_name: 'Lina',
            last_name: 'Volkmann',
            username: 'linavolkmann',
            __typename: 'UnsplashUser'
          },
          __typename: 'UnsplashPhoto'
        },
        {
          id: 'Hz9SnD3SFfw',
          alt_description:
            'photo of white wooden chapel surrounded by trees during daytime',
          blur_hash: 'LwIF6+ofIAay_NayWBj[xuWBogof',
          width: 2592,
          height: 1728,
          urls: {
            raw: 'https://images.unsplash.com/photo-1467070607100-22fd5b4f38ac?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTl8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3',
            regular:
              'https://images.unsplash.com/photo-1467070607100-22fd5b4f38ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTl8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3&q=80&w=1080',
            __typename: 'UnsplashPhotoUrls'
          },
          links: {
            download_location:
              'https://api.unsplash.com/photos/Hz9SnD3SFfw/download?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MTl8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw',
            __typename: 'UnsplashPhotoLinks'
          },
          user: {
            first_name: 'Harry',
            last_name: 'Miller',
            username: 'harry_m93',
            __typename: 'UnsplashUser'
          },
          __typename: 'UnsplashPhoto'
        },
        {
          id: 'gY9za_FA59o',
          alt_description:
            'brown concrete building near body of water during daytime',
          blur_hash: 'L.I#lbRjWBf6_NR*jFazO?bFWVjZ',
          width: 3264,
          height: 4896,
          urls: {
            raw: 'https://images.unsplash.com/photo-1592989847310-2b19515028bd?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MjB8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3',
            regular:
              'https://images.unsplash.com/photo-1592989847310-2b19515028bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MjB8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw&ixlib=rb-4.0.3&q=80&w=1080',
            __typename: 'UnsplashPhotoUrls'
          },
          links: {
            download_location:
              'https://api.unsplash.com/photos/gY9za_FA59o/download?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MjB8NDkyNDU1Nnx8fHx8Mnx8MTcyMTg1Mjc3NHw',
            __typename: 'UnsplashPhotoLinks'
          },
          user: {
            first_name: 'Cristina',
            last_name: 'Gottardi',
            username: 'cristina_gottardi',
            __typename: 'UnsplashUser'
          },
          __typename: 'UnsplashPhoto'
        }
      ]
    }
  }
}

export const triggerUnsplashDownloadMock: MockedResponse<
  TriggerUnsplashDownload,
  TriggerUnsplashDownloadVariables
> = {
  request: {
    query: TRIGGER_UNSPLASH_DOWNLOAD,
    variables: {
      url: 'https://api.unsplash.com/photos/dLAN46E5wVw/download?ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258MXw0OTI0NTU2fHx8fHwyfHwxNzIxODUyNzc0fA'
    }
  },
  result: {
    data: {
      triggerUnsplashDownload: true
    }
  }
}
