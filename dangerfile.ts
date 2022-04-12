import { danger, warn, markdown } from 'danger'
import lint from '@commitlint/lint'

export default async () => {
  // ignore dependabot
  if (danger.github.pr.user.login === 'dependabot[bot]') return

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
      `> (change count - ${changeCount}): Pull Request size seems relatively large. If Pull Request contains multiple changes, split each into separate PR will helps faster, easier review.`
    )
  }

  // check branch has well-formed name
  if (
    danger.github.pr.head.ref.match(
      /^[0-9]{2}-[0-9]{2}-[A-Z]{2}-(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)-[a-z0-9\-]+[a-z0-9]/g
    ) === null
  ) {
    fail('Your branch does not match the naming convention.')
    markdown(
      `> (branch name - ${danger.github.pr.head.ref}): see the Branch naming conventions here https://github.com/JesusFilm/core/wiki/Repository-Best-Practice#naming-your-branch`
    )
  }

  // check PR has well-formed title
  // Rules copied from @commitlint/config-conventional
  const commitlintReport = await lint(danger.github.pr.title, {
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100],
    'header-max-length': [2, 'always', 100],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case']
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test'
      ]
    ]
  })
  if (!commitlintReport.valid) {
    fail('Please ensure your PR title matches commitlint convention.')
    let errors = ''
    commitlintReport.errors.forEach((error) => {
      errors = `${errors}# ${error.message}\n`
    })
    markdown(`> (pr title - ${danger.github.pr.title}): \n${errors}`)
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

  // pull reviews for PR from GitHub API
  const reviews = await danger.github.api.pulls.listReviews({
    ...danger.github.thisPR,
    pull_number: danger.github.thisPR.number
  })

  // check PR has requested reviewers or completed reviews
  if (
    currentPR.data.requested_reviewers.length === 0 &&
    reviews.data.length === 0
  ) {
    fail('Please request a reviewer for this PR.')
  }
}
