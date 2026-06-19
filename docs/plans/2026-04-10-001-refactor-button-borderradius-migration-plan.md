---
title: Migrate remaining borderRadius-overridden buttons to block variants
type: refactor
status: active
date: 2026-04-10
origin: docs/plans/2026-04-09-001-feat-button-design-consistency-plan.md
---

# Migrate remaining borderRadius-overridden buttons to block variants

## Overview

The new `blockContained` and `blockOutlined` button variants were introduced to standardize button styling across journeys-admin. Several buttons still use `variant="contained"` or `variant="outlined"` with manual `borderRadius` overrides in `sx`, which is exactly what the new variants replace. These should be migrated for consistency.

## Migration Candidates

### Group A: `borderRadius: 2` (8px) — Direct `blockOutlined` matches

These buttons use `borderRadius: 2` (8px) which matches `blockOutlined`'s built-in `borderRadius: '8px'`. Most use `color="secondary"` with custom height/width.

| #   | File                                                                                                          | Line | Variant  | Color     | Other sx overrides                                                              | Purpose        |
| --- | ------------------------------------------------------------------------------------------------------------- | ---- | -------- | --------- | ------------------------------------------------------------------------------- | -------------- |
| 1   | `components/Editor/Slider/Content/Goals/GoalsBanner/GoalsBanner.tsx`                                          | 101  | outlined | —         | `color: 'secondary.main'`, `borderColor: 'secondary.main'`, mobile-only display | "Learn More"   |
| 2   | `components/Editor/Slider/Content/Goals/GoalsList/GoalsList.tsx`                                              | 62   | outlined | —         | `color: 'secondary.main'`, `borderColor: 'secondary.main'`, alignment           | "Learn More"   |
| 3   | `components/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/ImageUpload/ImageUpload.tsx`           | 213  | outlined | secondary | `height: 32`, `width: '100%'`, `mt: 4`                                          | "Upload File"  |
| 4   | `components/Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromMux/AddByFile/AddByFile.tsx`                  | 233  | outlined | secondary | `height: 32`, `width: '100%'`, `mt: 4`                                          | Video upload   |
| 5   | `components/TemplateCustomization/MultiStepForm/Screens/MediaScreen/Sections/VideosSection/VideosSection.tsx` | 45   | outlined | secondary | `height: 40`, `width: '100%'`                                                   | "Upload Video" |
| 6   | `components/TemplateCustomization/MultiStepForm/Screens/MediaScreen/Sections/LogoSection/LogoSection.tsx`     | 128  | outlined | secondary | `height: 32`, `width: { xs: 160, sm: 220 }`                                     | "Upload File"  |

### Group B: `borderRadius: '12px'` — Evaluate case-by-case

These use `borderRadius: '12px'` which matches the admin MuiButton root default, not the block variants (8px). May need a different approach or a new size/variant.

| #   | File                                                                    | Line | Variant   | Color | Other sx overrides                                                                   | Purpose                |
| --- | ----------------------------------------------------------------------- | ---- | --------- | ----- | ------------------------------------------------------------------------------------ | ---------------------- |
| 7   | `components/AccessDenied/AccessDeniedListItem/AccessDeniedListItem.tsx` | 104  | contained | —     | `flexShrink: 0`                                                                      | "Request Now"          |
| 8   | `components/TermsAndConditions/TermsAndConditions.tsx`                  | 185  | contained | —     | `height: 54`, `width: '100%'`, `bgcolor: 'secondary.dark'`, `py: 3.25`, custom hover | Form submit with arrow |

### Group C: Not a migration candidate

| #   | File                                                        | Line | Reason                                                                                 |
| --- | ----------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------- |
| 9   | `components/AccessDialog/AddUserSection/AddUserSection.tsx` | 69   | `borderRadius: '16px'`, pill-shaped dropdown trigger — fundamentally different pattern |

## Acceptance Criteria

- [ ] Group A buttons (1-6) migrated to `blockOutlined` with `color="solid"` where using secondary colors
- [ ] Remove `borderRadius`, `borderColor`, `borderWidth` overrides that are now handled by the variant
- [ ] Retain layout-specific sx props (`width`, `height`, `mt`, `display`, `alignSelf`) that aren't part of the variant
- [ ] Group B buttons (7-8) evaluated — migrate to `blockContained` + `color="solid"` if 8px radius is acceptable, otherwise leave as-is
- [ ] Group C (9) left unchanged
- [ ] Existing tests still pass for all modified components
- [ ] No visual regressions in storybook for affected components

## Implementation Notes

- Group A items 1-2 (GoalsBanner/GoalsList) use inline `color`/`borderColor` in sx instead of the `color` prop — switch to `color="solid"` on the variant and remove those sx overrides
- Group A items 3-6 already use `color="secondary"` — switch to `color="solid"` since the new variants map secondary-equivalent styles through the `solid` color
- Group B item 8 (TermsAndConditions) has significant custom styling (`bgcolor`, `py`, `custom hover`) — may be better as `blockContained` + `color="solid"` with only the width/height kept in sx
- All file paths are relative to `apps/journeys-admin/src/`
