# Resources footer images

Goal: restore the footer social icons reported by Mike Shaw on 19 October 2026.

- [x] Reproduce: production `/watch/assets/footer/*.svg` requests return HTML from Watch instead of SVG images.
- [x] Move the footer assets to `/journeys/assets/footer/`, a namespace already routed to Resources, and update the footer references.
- [x] Add a browser regression test that checks all five footer images decode successfully, including the logo.
- [ ] Run the regression against the preview, existing footer tests, lint, and type checks.
- [ ] Merge and verify production; capture a screenshot and reply to Mike's original email.

User flow: open `/resources`, scroll to the footer, see the logo and four social icons, and follow their existing links.

The existing Footer/ FooterLink separation is sufficient; this fix needs no new module or routing rule. The logo moves with the social icons so all footer images stay in the Resources-owned namespace. No follow-up refactor is needed.

Validation and obstacles will be recorded below.
