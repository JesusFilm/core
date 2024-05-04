import { LIST_UNSPLASH_COLLECTION_PHOTOS } from './UnsplashGallery'

export const listUnsplashCollectionMock = {
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
          width: 6240,
          height: 4160,
          urls: {
            small:
              'https://images.unsplash.com/photo-1618777618311-92f986a6519d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MDYwNDN8MHwxfGNvbGxlY3Rpb258MXw0OTI0NTU2fHx8fHwyfHwxNjc2MzI1NjQ0&ixlib=rb-4.0.3&q=80&w=400',
            regular:
              'https://images.unsplash.com/photo-1618777618311-92f986a6519d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MDYwNDN8MHwxfGNvbGxlY3Rpb258MXw0OTI0NTU2fHx8fHwyfHwxNjc2MzI1NjQ0&ixlib=rb-4.0.3&q=80&w=1080'
          },
          user: {
            first_name: 'Levi Meir',
            username: 'levimeirclancy'
          }
        },
        {
          id: 'UlipBbZpweg',
          width: 6000,
          height: 4000,
          urls: {
            small:
              'https://images.unsplash.com/photo-1552410260-0fd9b577afa6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MDYwNDN8MHwxfGNvbGxlY3Rpb258Mnw0OTI0NTU2fHx8fHwyfHwxNjc2MzI1NjQ0&ixlib=rb-4.0.3&q=80&w=400',
            regular:
              'https://images.unsplash.com/photo-1552410260-0fd9b577afa6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MDYwNDN8MHwxfGNvbGxlY3Rpb258Mnw0OTI0NTU2fHx8fHwyfHwxNjc2MzI1NjQ0&ixlib=rb-4.0.3&q=80&w=1080'
          },
          user: {
            first_name: 'Mika',
            username: 'mikabr'
          }
        },
        {
          id: 'G2djeMdYSOM',
          width: 4032,
          height: 3024,
          urls: {
            small:
              'https://images.unsplash.com/photo-1517618488600-584b07386bc1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MDYwNDN8MHwxfGNvbGxlY3Rpb258M3w0OTI0NTU2fHx8fHwyfHwxNjc2MzI1NjQ0&ixlib=rb-4.0.3&q=80&w=400',
            regular:
              'https://images.unsplash.com/photo-1517618488600-584b07386bc1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MDYwNDN8MHwxfGNvbGxlY3Rpb258M3w0OTI0NTU2fHx8fHwyfHwxNjc2MzI1NjQ0&ixlib=rb-4.0.3&q=80&w=1080'
          },
          user: {
            first_name: 'Antonello',
            username: 'antonellofalcone'
          }
        },
        {
          id: 'CUWC-6MRcNg',
          width: 3096,
          height: 4242,
          urls: {
            small:
              'https://images.unsplash.com/photo-1543051932-6ef9fecfbc80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MDYwNDN8MHwxfGNvbGxlY3Rpb258NHw0OTI0NTU2fHx8fHwyfHwxNjc2MzI1NjQ0&ixlib=rb-4.0.3&q=80&w=400',
            regular:
              'https://images.unsplash.com/photo-1543051932-6ef9fecfbc80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MDYwNDN8MHwxfGNvbGxlY3Rpb258NHw0OTI0NTU2fHx8fHwyfHwxNjc2MzI1NjQ0&ixlib=rb-4.0.3&q=80&w=1080'
          },
          user: {
            first_name: 'Tomasz',
            username: 'tomasz_filipek'
          }
        },
        {
          id: 'jmqJzVFcPPM',
          width: 4701,
          height: 7045,
          urls: {
            small:
              'https://images.unsplash.com/photo-1594842083328-b4c397934f0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MDYwNDN8MHwxfGNvbGxlY3Rpb258NXw0OTI0NTU2fHx8fHwyfHwxNjc2MzI1NjQ0&ixlib=rb-4.0.3&q=80&w=400',
            regular:
              'https://images.unsplash.com/photo-1594842083328-b4c397934f0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MDYwNDN8MHwxfGNvbGxlY3Rpb258NXw0OTI0NTU2fHx8fHwyfHwxNjc2MzI1NjQ0&ixlib=rb-4.0.3&q=80&w=1080'
          },
          user: {
            first_name: 'Daniel',
            username: 'danielsessler'
          }
        }
      ]
    }
  }
}
