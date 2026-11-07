# Watch monitoring ownership

`watch.check.ts` owns the existing `watch.monitor.ts` browser check in the
Jesus Film Project Checkly account. Its logical ID intentionally retains
`apps/watch-e2e/src/monitoring/watch.monitor.ts` even though its script moved to
`apps/resources-e2e`. Changing that ID creates a different monitor and loses the
association with check `380dc7b3-67c7-488d-a28f-e7d78e63b099`.

Checkly loads explicit constructs before the `**/*.monitor.ts` discovery pattern
and skips a script already used as an entrypoint. Keep this behavior covered by:

```sh
node --test tools/checkly/watch-routing.test.cjs
```

Watch subscribes to the existing email, Slack, SMS, and Watch Alerts channels.
The Journeys, Journeys Admin, and Watch Redirections subscriptions are explicitly
inactive for this check. Channel references do not modify the shared destinations
or other checks. IDs are account-specific; they are not webhook credentials.

The Playwright script matches the version inspected in the Checkly editor on
2026-10-20. Its navigation timeout investigation remains separate from routing:
[FGE-293](https://linear.app/jesus-film-project/issue/FGE-293).

Before deploying, review `pnpm exec checkly deploy --preview` in the authenticated
Jesus Film Project account. Verify Watch updates under its existing logical ID,
the intended subscriptions are active, and no duplicate Watch check is created.
Review any unrelated project changes separately. The PR does not deploy itself.

After deployment, verify the next Watch failure and recovery arrive through
Watch Monitor without duplicate Journeys or Watch Redirections alerts. Confirm
the genuine Journeys and redirection checks retain their own routing.
