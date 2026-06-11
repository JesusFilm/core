# Watch Modern Datadog Verification

`apps/watch-modern` reuses the legacy public Watch Datadog service name:

- RUM service: `watch`
- Production URL prefix: `https://www.jesusfilm.org/watch`
- Staging URL prefix: `https://watch.jesusfilm.org/watch` unless deployment configuration proves another mounted path
- Release version: the deploy commit SHA passed to the browser as `NEXT_PUBLIC_DATADOG_VERSION` and to sourcemap upload as `GIT_COMMIT_SHA`

`watch.jesusfilm.org` is a staging or development validation surface. Do not use it as the production Watch URL in launch reports or dashboard assumptions.

## RUM Smoke Query

Use these dimensions when checking a staging or production deploy:

```text
service:watch env:<deploy env> version:<commit sha> @view.url:<mounted Watch URL prefix>
```

For production launch proof, the URL prefix must be `https://www.jesusfilm.org/watch`.

If legacy Watch and Watch Modern emit `service:watch` at the same time, separate traffic by URL prefix and release version.

## Staging Smoke

1. Visit the mounted Watch Modern URL.
2. Confirm a RUM view event appears with `service:watch`, the expected env, the deploy commit SHA version, and the staging URL prefix.
3. Exercise representative search, language, player, and recoverable error paths when they are available in the deployed build.
4. Confirm RUM URL fields and replay/action/error text do not expose query strings, URL fragments, or email-like values.
5. Confirm trace headers are sent only to the central and stage gateway origins.
6. Confirm representative emitted `.js.map` URLs return `403` or `404`.

## Sourcemap Correlation

The `watch-modern` sourcemap upload must use the same service and release as RUM:

```text
service=watch
release-version=$GIT_COMMIT_SHA
```

The upload script chooses the minified path prefix by deploy environment:

- `production`, `prod`, and `stage`: `/watch/modern/_next/static/`
- preview and development: `/watch/_next/static/`

Vercel prebuilt output should have public `.js.map` files removed before `vercel deploy --prebuilt`; Datadog upload still uses the build output under `dist/apps/watch-modern/.next/static`.

## Environment Matrix

Verify these values read-only before release. Missing or over-broad values are release blockers or follow-up tasks; do not mutate external Datadog, Vercel, Doppler, or GitHub secret configuration as part of the Datadog parity PR.

| Context    | Public RUM values                                                                                                                                   | Secret values                 | Notes                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------- |
| Production | `NEXT_PUBLIC_DATADOG_APPLICATION_ID`, `NEXT_PUBLIC_DATADOG_CLIENT_TOKEN`, `NEXT_PUBLIC_DATADOG_SITE`, `VERCEL_ENV=prod`, `VERCEL_GIT_COMMIT_SHA`    | `DATADOG_API_KEY`             | API key must remain CI/server-only and must not use a `NEXT_PUBLIC_` name.                   |
| Staging    | `NEXT_PUBLIC_DATADOG_APPLICATION_ID`, `NEXT_PUBLIC_DATADOG_CLIENT_TOKEN`, `NEXT_PUBLIC_DATADOG_SITE`, `VERCEL_ENV=stage`, `VERCEL_GIT_COMMIT_SHA`   | `DATADOG_API_KEY`             | Validate against the staging mounted Watch URL, not production.                              |
| Preview    | `NEXT_PUBLIC_DATADOG_APPLICATION_ID`, `NEXT_PUBLIC_DATADOG_CLIENT_TOKEN`, `NEXT_PUBLIC_DATADOG_SITE`, `VERCEL_ENV=preview`, `VERCEL_GIT_COMMIT_SHA` | Only if deliberately approved | Preview should not receive production upload authority unless the release owner approves it. |

Record the rotation owner for Datadog public RUM values and `DATADOG_API_KEY` in the release checklist or deployment notes.
