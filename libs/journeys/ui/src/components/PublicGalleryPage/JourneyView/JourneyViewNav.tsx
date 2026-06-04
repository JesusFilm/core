import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'

import {
  GALLERY_ACCENT,
  GALLERY_NAV_HEIGHT,
  galleryGlassSx
} from '../galleryTokens'

import { useScrollSubscription } from './scrollContext'

export interface JourneyViewNavSection {
  /** id of the section element this link scrolls to. */
  id: string
  label: string
}

interface JourneyViewNavProps {
  /** Sections in scroll order; the first is the cover. */
  sections: JourneyViewNavSection[]
  ariaLabel: string
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Smooth-scroll the page to a gallery section by id, honouring
 * `prefers-reduced-motion`. Shared by the nav links and the cover CTA.
 */
export function scrollToSection(id: string): void {
  const element = document.getElementById(id)
  if (element == null) return
  element.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start'
  })
}

/**
 * The gallery section-nav. On desktop it's a slim, fixed glass bar with the
 * section links centred; its bottom border appears only once scrolled. On
 * mobile there's no bar — just a floating glass hamburger on the right that
 * opens a glass drawer sliding in from the same edge. Either way it doubles as
 * a scroll affordance and as wayfinding, highlighting the section currently
 * crossing the viewport's centre (the cover on first load).
 */
export function JourneyViewNav({
  sections,
  ariaLabel
}: JourneyViewNavProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  // Seed the first section as active so the first link is highlighted on the
  // very first paint, before the IntersectionObserver fires its first callback.
  const [activeId, setActiveId] = useState<string | null>(
    () => sections[0]?.id ?? null
  )
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleOpenDrawer = (): void => {
    setDrawerOpen(true)
  }
  const handleCloseDrawer = (): void => {
    setDrawerOpen(false)
  }
  const handleSelect = (id: string): void => {
    scrollToSection(id)
    setDrawerOpen(false)
  }

  // The glass background is always on; the bottom border only appears once the
  // page leaves the very top, so the bar reads as borderless over the cover.
  // Driven by the shared ScrollProvider rather than its own scroll listener.
  useScrollSubscription(() => {
    setScrolled(window.scrollY > 8)
  })

  // Scrollspy: the section crossing the viewport's centre is active. A thin
  // centre band (45% margins top and bottom) keeps one section active through
  // most of the scroll. The cover spans the viewport at the top, so it's the
  // active link on first load.
  //
  // Keyed on the joined ids — not on `sections` — so a language change (which
  // rebuilds the labels) doesn't tear the observer down and re-attach it for
  // a fresh closure with the same id set.
  const sectionIdsKey = sections.map((section) => section.id).join(',')
  useEffect(() => {
    if (typeof IntersectionObserver !== 'function') return
    const ids = sectionIdsKey === '' ? [] : sectionIdsKey.split(',')
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element != null)
    if (elements.length === 0) return

    // Track which sections currently cross the centre band, reacting to both
    // entering AND leaving, then pick the topmost in scroll order. Choosing
    // deterministically by order (rather than "whichever entry fired last")
    // keeps the active link correct when two sections straddle the band — e.g.
    // when you reverse direction right at a section boundary.
    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        // `next ?? null` clears the active link when no observed section
        // intersects the centre band — e.g. when the user scrolls past the
        // last section into footer/whitespace below the page content.
        setActiveId(ids.find((id) => visible.has(id)) ?? null)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [sectionIdsKey])

  return (
    <Box component="nav" aria-label={ariaLabel}>
      {/* Desktop (md+): a fixed glass top bar with the section links centred */}
      <Box
        sx={[
          // Glass treatment shared with the hamburger button and drawer Paper
          // — see `galleryGlassSx` for the recipe.
          galleryGlassSx,
          {
            display: { xs: 'none', md: 'flex' },
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: (theme) => theme.zIndex.appBar,
            height: GALLERY_NAV_HEIGHT,
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: scrolled ? 'divider' : 'transparent',
            transition: 'border-color 200ms ease'
          }
        ]}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            spacing={0}
            justifyContent="center"
            sx={{
              // The bar is slim; hide the scrollbar that horizontal overflow
              // would otherwise add when the labels don't all fit.
              overflowX: 'auto',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' }
            }}
          >
            {sections.map((section) => {
              const active = section.id === activeId
              return (
                <Link
                  key={section.id}
                  component="button"
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  underline="none"
                  aria-current={active ? 'location' : undefined}
                  sx={{
                    whiteSpace: 'nowrap',
                    fontWeight: active ? 700 : 600,
                    fontSize: '0.8rem',
                    letterSpacing: '0.04em',
                    color: active ? GALLERY_ACCENT : 'text.secondary',
                    borderBottom: '2px solid',
                    borderColor: active ? GALLERY_ACCENT : 'transparent',
                    // Symmetric horizontal padding on each link instead of a
                    // Stack `spacing` (which lives only on the left of each
                    // non-first item). Equal left+right keeps the active
                    // underline visually centred under its label and balances
                    // the row regardless of which link is active.
                    px: 1,
                    pb: 0.25,
                    transition: 'color 150ms ease, border-color 150ms ease',
                    '&:hover': {
                      color: active ? GALLERY_ACCENT : 'text.primary'
                    }
                  }}
                >
                  {section.label}
                </Link>
              )
            })}
          </Stack>
        </Container>
      </Box>

      {/* Mobile (xs/sm): no top bar — a floating glass hamburger on the right.
          The drawer slides out from the same edge, so it reads as expanding
          from here rather than as a separate bar. */}
      <IconButton
        aria-label={ariaLabel}
        // `aria-haspopup="dialog"` matches the MUI Drawer's role and replaces
        // the deprecated boolean form. `aria-expanded` is explicit so screen
        // readers announce the collapsed/expanded state on both transitions —
        // omitting it (the prior `drawerOpen ? 'true' : undefined`) leaves
        // AT silent on the closed state. `aria-controls` is unconditional
        // because the Drawer Paper is kept mounted (see the Drawer's
        // `keepMounted` below), so the id is always a real DOM node.
        aria-haspopup="dialog"
        aria-controls="gallery-nav-drawer"
        aria-expanded={drawerOpen}
        onClick={handleOpenDrawer}
        sx={[
          galleryGlassSx,
          {
            display: { xs: 'inline-flex', md: 'none' },
            position: 'fixed',
            top: 8,
            right: 8,
            zIndex: (theme) => theme.zIndex.appBar,
            color: 'text.primary',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              // Slightly stronger tint on hover so the surface lifts; the
              // glass blur stays the same.
              backgroundColor: (theme) =>
                `rgba(${theme.palette.mode === 'dark' ? '255,255,255' : '0,0,0'}, 0.05)`
            }
          }
        ]}
      >
        <MenuRoundedIcon />
      </IconButton>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        // Keep the Paper mounted when closed so the hamburger's unconditional
        // `aria-controls="gallery-nav-drawer"` always resolves to a real DOM
        // node (MUI Drawer's default unmounts the Modal subtree when closed).
        keepMounted
        slotProps={{
          paper: {
            id: 'gallery-nav-drawer',
            // `inert` removes the closed Paper from the tab order and the
            // accessibility tree — without it, `keepMounted` would leave the
            // Close button and each section's ListItemButton focusable and
            // announced even though they're off-screen and visually hidden.
            inert: !drawerOpen,
            sx: [
              // Match the bar's glass treatment so the three surfaces stay
              // in lockstep.
              galleryGlassSx,
              {
                width: { xs: '75vw', sm: 320 },
                maxWidth: 360,
                // MUI's default Paper applies a subtle elevation overlay in
                // dark mode via `backgroundImage`; suppress it so the glass
                // tint reads cleanly.
                backgroundImage: 'none'
              }
            ]
          },
          // Drop the default dark scrim so the glass reveals the blurred page
          // behind it rather than a dim overlay (taps still close the drawer).
          backdrop: { sx: { backgroundColor: 'transparent' } }
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          sx={{ px: 1, py: 1 }}
        >
          <IconButton aria-label={t('Close')} onClick={handleCloseDrawer}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        <List>
          {sections.map((section) => {
            const active = section.id === activeId
            return (
              <ListItemButton
                key={section.id}
                selected={active}
                onClick={() => handleSelect(section.id)}
                // Use the same canonical `'location'` token as the desktop
                // links so the active-section announcement is consistent
                // across surfaces (was the deprecated boolean `'true'`).
                aria-current={active ? 'location' : undefined}
              >
                <Typography
                  sx={{
                    fontSize: '0.95rem',
                    fontWeight: active ? 700 : 600,
                    color: active ? GALLERY_ACCENT : 'text.primary'
                  }}
                >
                  {section.label}
                </Typography>
              </ListItemButton>
            )
          })}
        </List>
      </Drawer>
    </Box>
  )
}
