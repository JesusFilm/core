# Watch Homepage Newsletter Signup Section

## Goal
Create a dedicated newsletter signup section on the Watch homepage so visitors can share their email, audience type, areas of interest, and preferred languages to receive updates about new gospel media tools.

## Task List
- [x] Audit the existing WatchHomePage layout to identify where the new section should live and what styling constraints exist.
- [x] Design and implement a responsive newsletter signup section that matches the Watch homepage visual language and uses Tailwind/shadcn patterns.
- [x] Capture email, audience type, interests, and languages with accessible form controls and inline feedback for the typed email address.
- [x] Wire the new section into the WatchHomePage content stack with translations and accompanying tests.

## Obstacles
- None encountered during this implementation.

## Resolutions
- Not applicable; the feature work proceeded without blocking issues.

## Test Coverage
- Added `SectionNewsletterSignup.spec.tsx` to exercise rendering, live email preview text, and the submit confirmation state.

## User Flows
- Scroll down the Watch homepage until the newsletter section is visible.
- Enter an email address to see the confirmation preview for that address.
- Choose whether you are a missionary, mission organization, or private person, then select areas of interest and preferred languages.
- Submit the form to receive an on-page confirmation that the subscription details were captured.

## Follow-up Ideas
- Integrate the form with the actual newsletter subscription service and persist the selected preferences instead of keeping them client-side only.
