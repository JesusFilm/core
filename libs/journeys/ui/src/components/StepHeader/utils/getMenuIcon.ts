import SvgIcon from '@mui/material/SvgIcon'

import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import Ellipsis from '@core/shared/ui/icons/Ellipsis'
import Equals from '@core/shared/ui/icons/Equals'
import Grid1 from '@core/shared/ui/icons/Grid1'
import Home3 from '@core/shared/ui/icons/Home3'
import Home4 from '@core/shared/ui/icons/Home4'
import Menu1 from '@core/shared/ui/icons/Menu1'
import More from '@core/shared/ui/icons/More'

import { JourneyMenuButtonIcon } from '../../../../__generated__/globalTypes'

export function getMenuIcon(icon: JourneyMenuButtonIcon): typeof SvgIcon {
  return {
    [JourneyMenuButtonIcon.chevronDown]: ChevronDown,
    [JourneyMenuButtonIcon.ellipsis]: Ellipsis,
    [JourneyMenuButtonIcon.equals]: Equals,
    [JourneyMenuButtonIcon.grid1]: Grid1,
    [JourneyMenuButtonIcon.home3]: Home3,
    [JourneyMenuButtonIcon.home4]: Home4,
    [JourneyMenuButtonIcon.menu1]: Menu1,
    [JourneyMenuButtonIcon.more]: More
  }[icon]
}
