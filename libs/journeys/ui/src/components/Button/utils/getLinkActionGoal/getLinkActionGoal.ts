import { messagePlatforms } from '../findMessagePlatform'

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
  Chat = 'Chat',
  Bible = 'Bible',
  Website = 'Website',
  Email = 'Email'
}

function isMessagePlatform(url: string): boolean {
  return messagePlatforms.some((platform) => url.includes(platform.url))
}

function isBiblePlatform(url: string): boolean {
  return biblePlatforms.some((platform) => url.includes(platform))
}

export function getLinkActionGoal(url: string): GoalType {
  const emailRegex = /\S+@\S+\.\S+/

  if (emailRegex.test(url)) {
    return GoalType.Email
  } else if (isMessagePlatform(url)) {
    return GoalType.Chat
  } else if (isBiblePlatform(url)) {
    return GoalType.Bible
  } else {
    return GoalType.Website
  }
}
