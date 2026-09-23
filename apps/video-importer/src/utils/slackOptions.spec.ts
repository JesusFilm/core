import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { shouldPostSlackSummary } from './slackOptions'

describe('shouldPostSlackSummary', () => {
  it('posts by default (neither flag passed)', () => {
    assert.equal(shouldPostSlackSummary({}), true)
  })

  it('does not post when --no-slack sets slack to false', () => {
    assert.equal(shouldPostSlackSummary({ slack: false }), false)
  })

  it('does not post during --dry-run even if slack is not disabled', () => {
    assert.equal(shouldPostSlackSummary({ dryRun: true }), false)
  })

  it('does not post when both --dry-run and --no-slack are passed', () => {
    assert.equal(
      shouldPostSlackSummary({ dryRun: true, slack: false }),
      false
    )
  })

  it('posts when slack is explicitly true and not a dry run', () => {
    assert.equal(shouldPostSlackSummary({ dryRun: false, slack: true }), true)
  })
})
