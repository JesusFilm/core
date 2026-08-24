import { hoverOnly } from '.'

/**
 * hoverOnly guards hover styles behind `@media (hover: hover)` so that sticky
 * hover on touch devices - which paints the last-touched element as hovered
 * after a card transition - cannot make poll and multiselect options read as
 * already-selected (NES-1894).
 *
 * Scope: these tests pin this helper's return shape only. They do not reach the
 * call sites, so they will not catch a component reverting to a bare `&:hover`
 * (how the bug returned after #1793), nor a guarded block being clobbered by a
 * second `@media (hover: hover)` spread. Catching either needs an assertion on
 * emitted CSS, which this repo has no precedent for.
 */
describe('hoverOnly', () => {
  it('should wrap styles in a hover media query', () => {
    expect(hoverOnly({ backgroundColor: 'red', color: 'white' })).toEqual({
      '@media (hover: hover)': {
        '&:hover': {
          backgroundColor: 'red',
          color: 'white'
        }
      }
    })
  })

  it('should pass styles through unaltered', () => {
    expect(
      hoverOnly({
        borderColor: 'rgba(255, 255, 255, 0.5) !important',
        opacity: 1,
        '& .MuiSvgIcon-root': { color: 'inherit' }
      })
    ).toEqual({
      '@media (hover: hover)': {
        '&:hover': {
          borderColor: 'rgba(255, 255, 255, 0.5) !important',
          opacity: 1,
          '& .MuiSvgIcon-root': { color: 'inherit' }
        }
      }
    })
  })

  it('should invent no keys when given empty styles', () => {
    expect(hoverOnly({})).toEqual({
      '@media (hover: hover)': {
        '&:hover': {}
      }
    })
  })
})
