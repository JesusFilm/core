import { hoverOnly } from '.'

/**
 * hoverOnly guards hover styles behind `@media (hover: hover)` so that sticky
 * hover on touch devices - which paints the last-touched element as hovered
 * after a card transition - cannot make poll and multiselect options read as
 * already-selected (NES-1894).
 *
 * These tests pin the wrapper shape: if the media query is ever simplified
 * away, the bug returns silently.
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
