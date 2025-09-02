import { Basic } from 'unsplash-js/dist/methods/photos/types'

export const unsplashImageReponse: Basic = {
  id: 'gWmeNwrn04A',
  alt_description: null,
  created_at: '2018-08-28T20:37:10Z',
  color: '#f3f3f3',
  description: 'www.jonasjacobsson.co',
  height: 2667,
  likes: 35,
  blur_hash: null,
  promoted_at: null,
  links: {
    download:
      'https://unsplash.com/photos/gWmeNwrn04A/download?ixid=Mnw0MDYwNDN8MHwxfHNlYXJjaHwxfHx1bmRlZmluZWR8ZW58MHx8fHwxNjc1Mzk2NTIw',
    download_location:
      'https://api.unsplash.com/photos/gWmeNwrn04A/download?ixid=Mnw0MDYwNDN8MHwxfHNlYXJjaHwxfHx1bmRlZmluZWR8ZW58MHx8fHwxNjc1Mzk2NTIw',
    html: 'https://unsplash.com/photos/gWmeNwrn04A',
    self: 'https://api.unsplash.com/photos/gWmeNwrn04A'
  },
  updated_at: '2023-02-02T14:06:06Z',
  urls: {
    full: 'https://images.unsplash.com/photo-1535488518105-67f15b7cab27?crop=entropy&cs=tinysrgb&fm=jpg&ixid=Mnw0MDYwNDN8MHwxfHNlYXJjaHwxfHx1bmRlZmluZWR8ZW58MHx8fHwxNjc1Mzk2NTIw&ixlib=rb-4.0.3&q=80',
    raw: 'https://images.unsplash.com/photo-1535488518105-67f15b7cab27?ixid=Mnw0MDYwNDN8MHwxfHNlYXJjaHwxfHx1bmRlZmluZWR8ZW58MHx8fHwxNjc1Mzk2NTIw&ixlib=rb-4.0.3',
    regular:
      'https://images.unsplash.com/photo-1535488518105-67f15b7cab27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MDYwNDN8MHwxfHNlYXJjaHwxfHx1bmRlZmluZWR8ZW58MHx8fHwxNjc1Mzk2NTIw&ixlib=rb-4.0.3&q=80&w=1080',
    small:
      'https://images.unsplash.com/photo-1535488518105-67f15b7cab27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MDYwNDN8MHwxfHNlYXJjaHwxfHx1bmRlZmluZWR8ZW58MHx8fHwxNjc1Mzk2NTIw&ixlib=rb-4.0.3&q=80&w=400',
    thumb:
      'https://images.unsplash.com/photo-1535488518105-67f15b7cab27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MDYwNDN8MHwxfHNlYXJjaHwxfHx1bmRlZmluZWR8ZW58MHx8fHwxNjc1Mzk2NTIw&ixlib=rb-4.0.3&q=80&w=200'
  },
  user: {
    bio: 'Jonas Jacobsson is an award-winning freelance photographer based in Gothenburg, Sweden. With inspiration and creativity at heart, he has a knack for capturing clean, wide open spaces as well as memorable moments. \r\n\r\nAvailable for hire.\r\n\r\n',
    id: 'QUz7WzMt1B8',
    first_name: 'Jonas',
    instagram_username: 'jonas_jacobsson_',
    last_name: 'Jacobsson',
    links: {
      followers: 'https://api.unsplash.com/users/jonasjacobsson/followers',
      following: 'https://api.unsplash.com/users/jonasjacobsson/following',
      html: 'https://unsplash.com/@jonasjacobsson',
      likes: 'https://api.unsplash.com/users/jonasjacobsson/likes',
      photos: 'https://api.unsplash.com/users/jonasjacobsson/photos',
      portfolio: 'https://api.unsplash.com/users/jonasjacobsson/portfolio',
      self: 'https://api.unsplash.com/users/jonasjacobsson'
    },
    location: 'Gothenburg, Sweden',
    name: 'Jonas Jacobsson',
    portfolio_url: 'http://www.jonasjacobsson.co',
    profile_image: {
      large:
        'https://images.unsplash.com/profile-1610352564965-4598ace37f72image?ixlib=rb-4.0.3&crop=faces&fit=crop&w=128&h=128',
      medium:
        'https://images.unsplash.com/profile-1610352564965-4598ace37f72image?ixlib=rb-4.0.3&crop=faces&fit=crop&w=64&h=64',
      small:
        'https://images.unsplash.com/profile-1610352564965-4598ace37f72image?ixlib=rb-4.0.3&crop=faces&fit=crop&w=32&h=32'
    },
    total_collections: 14,
    total_likes: 2,
    total_photos: 120,
    twitter_username: null,
    updated_at: '2023-01-31T19:17:58Z',
    username: 'jonasjacobsson'
  },
  width: 4000
}

export const unsplashListResponse = {
  total: 10,
  total_pages: 10,
  results: [
    unsplashImageReponse,
    unsplashImageReponse,
    unsplashImageReponse,
    unsplashImageReponse,
    unsplashImageReponse,
    unsplashImageReponse,
    unsplashImageReponse,
    unsplashImageReponse,
    unsplashImageReponse,
    unsplashImageReponse
  ]
}
