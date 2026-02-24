import { BaseHit, Hit } from 'instantsearch.js'

const resourceItem = {
  post_id: 5899,
  post_type: 'mission-trip',
  post_type_label: 'Mission Trips',
  post_title: 'London Bridges 1 One Week',
  post_date: 1671059126,
  post_date_formatted: '12/14/2022',
  post_excerpt: '<p>description from excerpt</p>',
  post_modified: 1717597535,
  images: {
    thumbnail: {
      url: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
      width: '150',
      height: '150'
    }
  },
  permalink: 'https://example.com/london-bridges-1-one-week/',
  content:
    'Come with us to London to reach out to some of the hardest to reach people of the world. London is a main tourist destination for many visitors from the Middle East, escaping the blazing heat of their summer.\n\n\n\nIt’s an incredibly effective, low-key way to help influential people from the Middle East hear about Christ’s love. We will be involved in distribution of Arabic copies of the JESUS film, Magdalena: Released From Shame, and the New Testament while developing friendships. Out of curiosity, many will openly receive this gift from you in London, which they are hindered from receiving in their home country. Come share the love of Christ, warm conversation, and have a great time doing it.\n\n\n\nA unique highlight of this trip is our guided tour of biblical artifacts of the British Museum. It will be very educational and eye-opening and will enrich your faith as you hear the stories and see artifacts firsthand.\n\n\n\n\nThis is a Family Friendly trip for ages 6 and up.\n\n\n\n\nApplications are now closed.',
  objectID: '5899-0'
} as unknown as Hit<BaseHit>

export const resourceItems: Array<Hit<BaseHit>> = [
  resourceItem,
  {
    ...resourceItem,
    id: 5900,
    post_title: 'London Bridges 2 Two Weeks'
  },
  {
    ...resourceItem,
    id: 5901,
    post_title: 'London Bridges 3 Three Weeks'
  },
  {
    ...resourceItem,
    id: 5902,
    post_title: 'London Bridges 4 Four Weeks'
  },
  {
    ...resourceItem,
    id: 5903,
    post_title: 'London Bridges 5 Five Weeks'
  },
  {
    ...resourceItem,
    id: 5904,
    post_title: 'London Bridges 6 Six Weeks'
  },
  {
    ...resourceItem,
    id: 5905,
    post_title: 'London Bridges 7 Seven Weeks'
  },
  {
    ...resourceItem,
    id: 5906,
    post_title: 'London Bridges 8 Eight Weeks'
  },
  {
    ...resourceItem,
    id: 5907,
    post_title: 'London Bridges 9 Nine Weeks'
  },
  {
    ...resourceItem,
    id: 5908,
    post_title: 'London Bridges 10 Ten Weeks'
  }
]
