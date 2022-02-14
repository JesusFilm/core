import { danger, warn, markdown } from 'danger'

export default async () => {
  // check lockfile updated when package changes
  const packageChanged = danger.git.modified_files.includes('package.json')
  const lockfileChanged =
    danger.git.modified_files.includes('package-lock.json')
  if (packageChanged && !lockfileChanged) {
    const message =
      'Changes were made to package.json, but not to package-lock.json'
    const idea = 'Perhaps you need to run `npm install`?'
    warn(`${message} - <i>${idea}</i>`)
  }

  // check max changes fall below threshold
  const CHANGE_THRESHOLD = 600
  const changeCount = danger.github.pr.additions + danger.github.pr.deletions
  if (changeCount > CHANGE_THRESHOLD) {
    warn(`:exclamation: Big PR (${changeCount} changes)`)
    markdown(
      `> (${changeCount}): Pull Request size seems relatively large. If Pull Request contains multiple changes, split each into separate PR will helps faster, easier review.`
    )
  }

  // check PR has well formed title
  if (
    danger.github.pr.title.match(
      /^(fix|chore|docs|feature|fix|security|testing): .+/g
    ) === null
  ) {
    fail(
      'Please ensure your PR title matches convention. See https://github.com/JesusFilm/core/wiki/Repository-Best-Practice#naming-your-pr for more details.'
    )
  }

  // check PR has description
  if (danger.github.pr.body.length < 10) {
    fail('This pull request needs a description.')
  }

  // check PR has basecamp link
  if (!danger.github.pr.body.includes('https://3.basecamp.com/')) {
    warn(
      'Is this PR related to a Basecamp issue? If so link it via the PR description.'
    )
  }

  // check PR has assignee
  if (danger.github.pr.assignee === null) {
    fail('Please assign someone to merge this PR.')
  }

  // check PR has type label
  if (
    !danger.github.issue.labels.some((label) => label.name.includes('type:'))
  ) {
    fail('Please add type label to this PR.')
  }

  // check PR has priority label
  if (
    !danger.github.issue.labels.some((label) =>
      label.name.includes('priority:')
    )
  ) {
    fail('Please add priority label to this PR.')
  }

  // check PR has effort label
  if (
    !danger.github.issue.labels.some((label) => label.name.includes('effort:'))
  ) {
    fail('Please add effort label to this PR.')
  }

  // pull PR data from GitHub API
  const currentPR = await danger.github.api.pulls.get({
    ...danger.github.thisPR,
    pull_number: danger.github.thisPR.number
  })

  // check PR has milestone
  if (currentPR.data.milestone === null) {
    fail('Please add milestone to this PR.')
  }

  // check PR has reviewers
  if (currentPR.data.requested_reviewers == null) {
    fail('Please request reviewers for this PR.')
  }
}
