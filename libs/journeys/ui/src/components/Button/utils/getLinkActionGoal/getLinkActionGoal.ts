import { chatPlatforms } from '../findChatPlatform'

const biblePlatforms = [
  'bible.com',
  'wordproject.org',
  'biblegateway.com',
  'worldbibles.org',
  'biblestudytools.com',
  'biblehub.com',
  'biblia.com',
  'blueletterbible.org',
  'bible-ru.org',
  'bibleonline.ru',
  'bible.by',
  'bible-facts.org',
  'copticchurch.net',
  'ebible.org',
  'arabicbible.com'
]

export enum GoalType {
  'Chat',
  'Bible',
  'Website'
}

export function getLinkActionGoal(url: string): GoalType {
  if (chatPlatforms.find((platform) => platform.url.includes(url)) != null) {
    return GoalType.Chat
  } else if (
    biblePlatforms.find((platform) => platform.includes(url)) != null
  ) {
    return GoalType.Bible
  } else {
    return GoalType.Website
  }
}
