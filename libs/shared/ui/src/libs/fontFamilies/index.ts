import {
  BODY_FONT_OPTIONS,
  HEADER_FONT_OPTIONS,
  LABELS_FONT_OPTIONS
} from './fontFamilies'

export {
  BODY_FONT_OPTIONS,
  FONT_FAMILIES,
  FontFamily,
  HEADER_FONT_OPTIONS,
  LABELS_FONT_OPTIONS
} from './fontFamilies'

// Default also supports Node ESM consumers of this CommonJS barrel.
const fontCatalog = { BODY_FONT_OPTIONS, HEADER_FONT_OPTIONS, LABELS_FONT_OPTIONS }
export default fontCatalog
