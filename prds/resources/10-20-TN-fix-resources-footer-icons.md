# Resources footer images

Goal: restore the footer social icons reported by Mike Shaw on 19 October 2026.

- [x] Reproduce: production `/watch/assets/footer/*.svg` requests return HTML from Watch instead of SVG images.
- [x] Move the footer assets to `/journeys/assets/footer/`, a namespace already routed to Resources, and update the footer references.
- [x] Add a browser regression test that checks all five footer images decode successfully, including the logo.
- [x] Run existing footer tests (10 passed) and changed-file formatting, lint, and translation extraction (passed).
- [ ] Run the browser regression against the preview and finish affected type checks.
- [ ] Merge and verify production; capture a screenshot and reply to Mike's original email.

User flow: open `/resources`, scroll to the footer, see the logo and four social icons, and follow their existing links.

The existing Footer/ FooterLink separation is sufficient; this fix needs no new module or routing rule. The logo moves with the social icons so all footer images stay in the Resources-owned namespace. No follow-up refactor is needed.

Validation: `DEPLOYMENT_URL=https://www.jesusfilm.org pnpm exec playwright test --config apps/resources-e2e/playwright.config.ts resources-footer.spec.ts --reporter=line` fails on the original bug with image `naturalWidth = 0`. Existing footer component tests pass. Initial type checking found stale dependencies in the parent checkout (Apollo Client 3 while main requires 4); install this worktree's frozen lockfile before retrying. Resources-e2e type checking passed even before reinstalling.
