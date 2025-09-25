# Sharing Ideas Tab - Implementation Strategy

## Goals

- [x] Add a Sharing Ideas tab to legacy single video pages.
- [x] Extend the new single video experience to surface Sharing Ideas content.
- [x] Provide a Pinterest-style masonry layout for idea blocks fed by existing study questions.
- [x] Localize the new tab label across supported locales.

## Plan

- [x] Build a reusable `<SharingIdeasWall>` component that arranges text blocks in a masonry-style column layout.
- [x] Integrate the component into the legacy `VideoContent` tabs, ensuring accessibility (ARIA) support and sensible fallbacks when questions are missing.
- [x] Update the Tailwind-based `DiscussionQuestions` section to expose Discussion vs Sharing Ideas tabs while preserving the Ask Yours CTA.
- [x] Add unit tests validating tab toggling and rendering of the new wall on both experiences.
- [x] Update locale dictionaries with the new "Sharing Ideas" string.

## Validation

- [x] Run affected Jest test suites (`VideoContent` and `DiscussionQuestions`).
- [x] Perform linting/formatting checks if required by the workspace tooling.
