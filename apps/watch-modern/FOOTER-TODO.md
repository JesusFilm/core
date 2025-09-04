# Watch Footer (Tailwind + shadcn) — Implementation Task List

Goal: Recreate the footer currently shown on https://www.jesusfilm.org/watch using Tailwind CSS and shadcn/ui, integrated into the Next.js app in `apps/watch-modern`.

Do not write code in this file. Use it as the single source of truth for files to add/change and exact TODOs.

## Deliverables
- A responsive footer component matching the layout and content of the existing Watch footer:
  - Left: Jesus Film logomark.
  - Center-left: Address and office contact, with vertical dividers between address, office, and policies.
  - Center: Social icons (X, Facebook, Instagram, YouTube) as circular icons.
  - Right: Simple top-level nav links (Share, Watch, Giving, About, Products, Resources, Partners, Contact) and a prominent red “Give Now” pill button.
  - Secondary CTA: dark pill “Sign Up For Our Newsletter”.
- Integrated globally in the `app/layout.tsx` so it shows across pages.
- Unit tests (RTL) and one Playwright smoke test.
- EN locale strings; other locales can fallback to EN in this pass.

---

## Tasks by File

1) apps/watch-modern/public/brand/jesus-film-logomark.svg
- [ ] Add the Jesus Film logomark SVG asset used in the footer (square red mark with “Jesus Film” lettering).
- [ ] Optimize SVG for inline/`next/image` usage (unique `id`s, no embedded rasters).

2) apps/watch-modern/src/components/icons/brands.tsx
- [ ] Create a tiny icon module exporting brand React components:
  - [ ] `BrandXIcon` (X logo)
  - [ ] `BrandFacebookIcon`
  - [ ] `BrandInstagramIcon`
  - [ ] `BrandYouTubeIcon`
- [ ] Each icon renders a 24x24 SVG, inherits `currentColor`, and accepts `className`.
- [ ] Ensure accessible `title` support via prop for screen readers when needed.

3) apps/watch-modern/src/config/footer.ts
- [ ] Export structured config for the footer:
  - [ ] `navLinks`: ordered list of { `labelKey`, `href`, `external?` } for: Share, Watch, Giving, About, Products, Resources, Partners, Contact.
  - [ ] `primaryCta`: { `labelKey`: 'giveNow', `href`: external giving URL, `external`: true }.
  - [ ] `secondaryCta`: { `labelKey`: 'newsletterCta', `href`: newsletter URL, `external`: true }.
  - [ ] `address`: multi-line string or array (street line + city/state/zip).
  - [ ] `office`: strings for office phone and fax (E.164 values retained for `tel:`/`fax:` hrefs).
  - [ ] `policies`: { `privacyPolicy`: { labelKey, href }, `legalStatement`: { labelKey, href } }.
- [ ] Use absolute URLs for external links and `tel:`/`fax:` for numbers.

4) apps/watch-modern/src/components/ui/separator.tsx
- [ ] Add shadcn `Separator` (horizontal + vertical support). Keep API compatible with shadcn/ui.
- [ ] Tailwind classes use tokens from `globals.css` (no hard-coded colors).

5) apps/watch-modern/src/components/Footer/Footer.tsx
- [ ] Create the footer component (server component is fine):
  - [ ] Wrap with semantic `<footer role="contentinfo">`.
  - [ ] Use `Container` (`@/components/ui/container`) for width and consistent horizontal padding.
  - [ ] Top row (or single-row on wide viewports):
    - [ ] Left: logo (SVG from `/brand/jesus-film-logomark.svg`), sized ~48–56px, with `aria-label="Jesus Film"` and link to `/`.
    - [ ] Center-left block: three columns or stacked on mobile — Address, Office (phone/fax), Policies — divided with vertical `Separator` on `md+` screens.
    - [ ] Center block: social icons row (X, Facebook, Instagram, YouTube) with circular hover states and accessible `aria-label`s and `rel="noopener noreferrer"` for externals.
    - [ ] Right block: nav links list laid out horizontally on `lg+`, collapsing to stacked on mobile.
    - [ ] “Give Now” button: use shadcn `Button` with `variant="default"` or dedicated class using brand red, `rounded-full`, medium-large size.
  - [ ] Secondary CTA (Newsletter): a separate row or anchored right beneath; style as dark pill (`bg-neutral-800 text-white rounded-full`).
  - [ ] Respect spacing, font weights, and sizes consistent with the screenshot and existing site.
  - [ ] Light mode on footer (white background) even if page background is dark; ensure adequate contrast.
  - [ ] All links keyboard-focusable with visible focus ring.

6) apps/watch-modern/src/components/Footer/index.ts
- [ ] Re-export `Footer` to allow `@/components/Footer` imports.

7) apps/watch-modern/src/app/layout.tsx
- [ ] Import and render `<Footer />` beneath `children` but inside the `<body>`.
- [ ] Keep layout tree stable and avoid hydration mismatches (Footer can be server component).

8) apps/watch-modern/src/i18n/locales/en/apps-watch-modern.json
- [ ] Add `Footer` namespace keys:
  - [ ] `Footer.logoAria`: "Jesus Film"
  - [ ] `Footer.address.line1`: "100 Lake Hart Drive"
  - [ ] `Footer.address.line2`: "Orlando, FL, 32832"
  - [ ] `Footer.office.phoneLabel`: "Office"
  - [ ] `Footer.office.phone`: "(407) 826–2300"
  - [ ] `Footer.office.faxLabel`: "Fax"
  - [ ] `Footer.office.fax`: "(407) 826–2359"
  - [ ] `Footer.privacyPolicy`: "Privacy Policy"
  - [ ] `Footer.legalStatement`: "Legal Statement"
  - [ ] `Footer.share`: "Share"
  - [ ] `Footer.watch`: "Watch"
  - [ ] `Footer.giving`: "Giving"
  - [ ] `Footer.about`: "About"
  - [ ] `Footer.products`: "Products"
  - [ ] `Footer.resources`: "Resources"
  - [ ] `Footer.partners`: "Partners"
  - [ ] `Footer.contact`: "Contact"
  - [ ] `Footer.giveNow`: "Give Now"
  - [ ] `Footer.newsletterCta": "Sign Up For Our Newsletter"
- [ ] Reference these keys from `Footer.tsx` via `getTranslations('Footer')`.

9) apps/watch-modern/tailwind.config.js
- [ ] Ensure `content` includes the new paths: `src/components/Footer/**/*`, `src/components/icons/**/*`, and `src/config/**/*`.
- [ ] Optionally add a `colors` extension for `brand.red` (if not already covered by CSS vars in `globals.css`). Prefer CSS vars where possible.

10) apps/watch-modern/src/app/globals.css
- [ ] Confirm brand tokens suffice for footer needs (`--primary` for red, neutral grays for text, separators).
- [ ] If needed, add a utility class for a subtle top border on the footer background.

11) apps/watch-modern/src/components/Footer/Footer.spec.tsx
- [ ] Render test: Footer mounts without crashing.
- [ ] Accessibility/name tests:
  - [ ] Logo link has `aria-label` and navigates to `/`.
  - [ ] Social links have correct `aria-label`s and `rel` attributes for externals.
  - [ ] “Give Now” and “Sign Up For Our Newsletter” buttons render with correct labels.
  - [ ] Address and office info are present.
  - [ ] Policies links render with correct text.
- [ ] Snapshot of DOM structure is acceptable but don’t overfit to class names.

12) apps/watch-modern-e2e/src/e2e/footer.spec.ts
- [ ] Smoke test that the footer is visible on `/` and `/watch`.
- [ ] Verify the “Give Now” button href points to the configured external URL.
- [ ] Verify at least one social icon link is visible and clickable.

13) Storybook (optional but recommended)
- [ ] apps/watch-modern/src/components/Footer/Footer.stories.tsx — add a story with default state and mobile/desktop viewports.

14) apps/watch-modern/README.md (footer section) or apps/watch-modern/MIGRATION-TASKS.md
- [ ] Document the footer component responsibilities, props (none), and configuration source (`src/config/footer.ts`).

---

## Content & Links (source of truth)
- Address: 100 Lake Hart Drive, Orlando, FL, 32832
- Office phone: (407) 826–2300 → use `tel:+14078262300`
- Fax: (407) 826–2359 → use `fax:+14078262359` or omit `fax:` protocol if not desired
- Policies: external URLs to existing jesusfilm.org Privacy Policy and Legal Statement pages
- Socials: link to official Jesus Film accounts for X/Twitter, Facebook, Instagram, YouTube
- Primary CTA: “Give Now” → official giving URL
- Secondary CTA: “Sign Up For Our Newsletter” → newsletter signup URL

Note: Place the final external URLs in `src/config/footer.ts`. Avoid hard-coding in the component.

---

## Layout & Behavior Checklist
- [ ] Desktop
  - [ ] Left-aligned logomark
  - [ ] Address | Office | Policies column with vertical separators
  - [ ] Social icons row centered or balanced visually
  - [ ] Right-aligned nav links + red “Give Now” pill
  - [ ] Secondary dark pill for newsletter CTA beneath or aligned per design
- [ ] Mobile
  - [ ] Stacked layout with generous spacing
  - [ ] Vertical separators become horizontal dividers
  - [ ] Icon sizes remain fingertip-friendly (44px target)
- [ ] Accessibility
  - [ ] All links keyboard-focusable with visible focus ring
  - [ ] Meaningful `aria-label`s for non-text icons
  - [ ] Sufficient color contrast in light footer background
  - [ ] Semantic `<footer>` with `role="contentinfo"`

---

## Acceptance Criteria
- [ ] Visual parity with https://www.jesusfilm.org/watch footer across common breakpoints.
- [ ] Footer present on all pages that use `app/layout.tsx`.
- [ ] No console errors; links and buttons are focusable and accessible.
- [ ] Unit tests pass; e2e footer smoke test passes locally.

---

## Implementation Notes
- Use existing `@/components/ui/button` for both CTAs. Apply `rounded-full` and size classes as needed.
- Prefer `Container` for horizontal padding and max-width consistency.
- Icons should be `currentColor`-driven and wrapped in a round button/link with hover/focus states.
- Keep styles Tailwind-first; only add minimal custom CSS if necessary.

