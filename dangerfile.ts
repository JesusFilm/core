import { danger, warn, markdown } from 'danger'

const packageChanged = danger.git.modified_files.includes('package.json')
const lockfileChanged = danger.git.modified_files.includes('package-lock.json')

if (packageChanged && !lockfileChanged) {
  const message =
    'Changes were made to package.json, but not to package-lock.json'
  const idea = 'Perhaps you need to run `npm install`?'
  warn(`${message} - <i>${idea}</i>`)
}

const CHANGE_THRESHOLD = 600
const changeCount = danger.github.pr.additions + danger.github.pr.deletions
if (changeCount > CHANGE_THRESHOLD) {
  warn(`:exclamation: Big PR (${changeCount} changes)`)
  markdown(
    `> (${changeCount}): Pull Request size seems relatively large. If Pull Request contains multiple changes, split each into separate PR will helps faster, easier review.`
  )
}
