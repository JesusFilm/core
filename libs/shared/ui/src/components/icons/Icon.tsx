import { SvgIconProps } from '@mui/material/SvgIcon'
import { ReactElement } from 'react'

import AddSquare2 from './AddSquare2'
import AddSquare4 from './AddSquare4'
import AlertCircle from './AlertCircle'
import AlignCenter from './AlignCenter'
import AlignJustify from './AlignJustify'
import AlignLeft from './AlignLeft'
import AlignRight from './AlignRight'
import ArrowDownContained1 from './ArrowDownContained1'
import ArrowExpand1 from './ArrowExpand1'
import ArrowExpand2 from './ArrowExpand2'
import ArrowLeft from './ArrowLeft'
import ArrowLeftContained1 from './ArrowLeftContained1'
import ArrowLeftSm from './ArrowLeftSm'
import ArrowRefresh6 from './ArrowRefresh6'
import ArrowRight from './ArrowRight'
import ArrowRightContained1 from './ArrowRightContained1'
import ArrowRightSm from './ArrowRightSm'
import ArrowRotateLeft1 from './ArrowRotateLeft1'
import ArrowRotateRight2 from './ArrowRotateRight2'
import ArrowUp from './ArrowUp'
import ArrowUpContained1 from './ArrowUpContained1'
import ArrowUpSm from './ArrowUpSm'
import Attatchment1 from './Attatchment1'
import Bag5 from './Bag5'
import BarGroup3 from './BarGroup3'
import Bell2 from './Bell2'
import Book from './Book'
import Calendar1 from './Calendar1'
import Check from './Check'
import CheckBroken from './CheckBroken'
import CheckContained from './CheckContained'
import CheckSquareBroken from './CheckSquareBroken'
import CheckSquareContained from './CheckSquareContained'
import ChevronDown from './ChevronDown'
import ChevronLeft from './ChevronLeft'
import ChevronRight from './ChevronRight'
import ChevronUp from './ChevronUp'
import Circle from './Circle'
import ColorPicker from './ColorPicker'
import Colors1 from './Colors1'
import Colors2 from './Colors2'
import Computer from './Computer'
import CopyLeft from './CopyLeft'
import CopyRight from './CopyRight'
import Crop1 from './Crop1'
import DownArrow from './DownArrow'
import DownArrowSm from './DownArrowSm'
import Download2 from './Download2'
import DuplicateCard from './DuplicateCard'
import Edit2 from './Edit2'
import Email from './Email'
import Embed from './Embed'
import Expand from './Expand'
import Expand2 from './Expand2'
import EyeClosed from './EyeClosed'
import EyeOpen from './EyeOpen'
import Facebook from './Facebook'
import FacebookLogo from './FacebookLogo'
import Favourite from './Favourite'
import Flame from './Flame'
import Globe from './Globe'
import Globe1 from './Globe1'
import Globe2 from './Globe2'
import Globe3 from './Globe3'
import Hash1 from './Hash1'
import Hash2 from './Hash2'
import HelpCircleContained from './HelpCircleContained'
import HelpSquareContained from './HelpSquareContained'
import Home4 from './Home4'
import Image3 from './Image3'
import InformationCircleContained from './InformationCircleContained'
import InformationSquareContained from './InformationSquareContained'
import Instagram from './Instagram'
import Journey from './Journey'
import Key1 from './Key1'
import Key2 from './Key2'
import Laptop1 from './Laptop1'
import Layers4 from './Layers4'
import LayoutScale from './LayoutScale'
import Lightning2 from './Lightning2'
import LightningCircleContained from './LightningCircleContained'
import Line from './Line'
import Link from './Link'
import LinkAngled from './LinkAngled'
import LinkBroken from './LinkBroken'
import LinkExternal from './LinkExternal'
import Lock1 from './Lock1'
import LockOpen1 from './LockOpen1'
import Mail1 from './Mail1'
import Mail2 from './Mail2'
import Marker1 from './Marker1'
import Marker2 from './Marker2'
import Maximise1 from './Maximise1'
import Maximise2 from './Maximise2'
import Menu1 from './Menu1'
import MessageChat1 from './MessageChat1'
import MessageText1 from './MessageText1'
import MessageTyping from './MessageTyping'
import Minimise1 from './Minimise1'
import Minimise2 from './Minimise2'
import MinusCircleContained from './MinusCircleContained'
import More from './More'
import Palette from './Palette'
import Passport from './Passport'
import Pause1 from './Pause1'
import Pause2 from './Pause2'
import Pause3 from './Pause3'
import Play2 from './Play2'
import Play3 from './Play3'
import Plus1 from './Plus1'
import Plus2 from './Plus2'
import Plus3 from './Plus3'
import Search1 from './Search1'
import Search2 from './Search2'
import Send1 from './Send1'
import Share from './Share'
import Skype from './Skype'
import Snapchat from './Snapchat'
import SpaceHeight from './SpaceHeight'
import SpaceHorizontal from './SpaceHorizontal'
import SpaceVertical from './SpaceVertical'
import Square from './Square'
import Star2 from './Star2'
import Target from './Target'
import Target2 from './Target2'
import Telegram from './Telegram'
import ThumbsDown from './ThumbsDown'
import ThumbsUp from './ThumbsUp'
import Tiktok from './Tiktok'
import Trash2 from './Trash2'
import TwitterLogo from './TwitterLogo'
import UserProfile2 from './UserProfile2'
import UserProfile3 from './UserProfile3'
import UserProfileAdd from './UserProfileAdd'
import UserProfileCircle from './UserProfileCircle'
import UsersProfiles2 from './UsersProfiles2'
import UsersProfiles3 from './UsersProfiles3'
import Viber from './Viber'
import Vk from './Vk'
import Web from './Web'
import WhatsApp from './WhatsApp'
import X1 from './X1'
import X2 from './X2'
import X3 from './X3'
import XCircleContained from './XCircleContained'
import XSquareContained from './XSquareContained'

type IconNames =
  | 'AddSquare2'
  | 'AddSquare4'
  | 'AlertCircle'
  | 'AlignCenter'
  | 'AlignJustify'
  | 'AlignLeft'
  | 'AlignRight'
  | 'ArrowDownContained1'
  | 'ArrowExpand1'
  | 'ArrowExpand2'
  | 'ArrowLeftContained1'
  | 'ArrowLeftSm'
  | 'ArrowLeft'
  | 'ArrowRefresh6'
  | 'ArrowRightContained1'
  | 'ArrowRightSm'
  | 'ArrowRight'
  | 'ArrowRotateLeft1'
  | 'ArrowRotateRight2'
  | 'ArrowUpContained1'
  | 'ArrowUpSm'
  | 'ArrowUp'
  | 'Attatchment1'
  | 'Bag5'
  | 'BarGroup3'
  | 'Bell2'
  | 'Book'
  | 'Calendar1'
  | 'CheckBroken'
  | 'CheckContained'
  | 'CheckSquareBroken'
  | 'CheckSquareContained'
  | 'Check'
  | 'ChevronDown'
  | 'ChevronLeft'
  | 'ChevronRight'
  | 'ChevronUp'
  | 'Circle'
  | 'ColorPicker'
  | 'Colors1'
  | 'Colors2'
  | 'Computer'
  | 'CopyLeft'
  | 'CopyRight'
  | 'Crop1'
  | 'DownArrowSm'
  | 'DownArrow'
  | 'Download2'
  | 'DuplicateCard'
  | 'Edit2'
  | 'Email'
  | 'Embed'
  | 'Expand2'
  | 'Expand'
  | 'EyeClosed'
  | 'EyeOpen'
  | 'Facebook'
  | 'FacebookLogo'
  | 'Favourite'
  | 'Flame'
  | 'Globe1'
  | 'Globe2'
  | 'Globe3'
  | 'Globe'
  | 'Hash1'
  | 'Hash2'
  | 'HelpCircleContained'
  | 'HelpSquareContained'
  | 'Home4'
  | 'Image3'
  | 'InformationCircleContained'
  | 'InformationSquareContained'
  | 'Instagram'
  | 'Journey'
  | 'Key1'
  | 'Key2'
  | 'Laptop1'
  | 'Layers4'
  | 'LayoutScale'
  | 'Lightning2'
  | 'LightningCircleContained'
  | 'Line'
  | 'LinkAngled'
  | 'LinkBroken'
  | 'LinkExternal'
  | 'Link'
  | 'Lock1'
  | 'LockOpen1'
  | 'Mail1'
  | 'Mail2'
  | 'Marker1'
  | 'Marker2'
  | 'Maximise1'
  | 'Maximise2'
  | 'Menu1'
  | 'MessageChat1'
  | 'MessageText1'
  | 'MessageTyping'
  | 'Minimise1'
  | 'Minimise2'
  | 'MinusCircleContained'
  | 'More'
  | 'Palette'
  | 'Passport'
  | 'Pause1'
  | 'Pause2'
  | 'Pause3'
  | 'Play2'
  | 'Play3'
  | 'Plus1'
  | 'Plus2'
  | 'Plus3'
  | 'Search1'
  | 'Search2'
  | 'Send1'
  | 'Share'
  | 'Skype'
  | 'Snapchat'
  | 'SpaceHeight'
  | 'SpaceHorizontal'
  | 'SpaceVertical'
  | 'Square'
  | 'Star2'
  | 'Target'
  | 'Target2'
  | 'Telegram'
  | 'Trash2'
  | 'Tiktok'
  | 'ThumbsDown'
  | 'ThumbsUp'
  | 'TwitterLogo'
  | 'UserProfile2'
  | 'UserProfile3'
  | 'UserProfileAdd'
  | 'UserProfileCircle'
  | 'UsersProfiles2'
  | 'UsersProfiles3'
  | 'Viber'
  | 'Vk'
  | 'Web'
  | 'WhatsApp'
  | 'X1'
  | 'X2'
  | 'X3'
  | 'XCircleContained'
  | 'XSquareContained'

type IconComponents = {
  [key in IconNames]: React.ComponentType<SvgIconProps>
}

const iconComponents: IconComponents = {
  AddSquare2,
  AddSquare4,
  AlertCircle,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDownContained1,
  ArrowExpand1,
  ArrowExpand2,
  ArrowLeftContained1,
  ArrowLeftSm,
  ArrowLeft,
  ArrowRefresh6,
  ArrowRightContained1,
  ArrowRightSm,
  ArrowRight,
  ArrowRotateLeft1,
  ArrowRotateRight2,
  ArrowUpContained1,
  ArrowUpSm,
  ArrowUp,
  Attatchment1,
  Bag5,
  BarGroup3,
  Bell2,
  Book,
  Calendar1,
  CheckBroken,
  CheckContained,
  CheckSquareBroken,
  CheckSquareContained,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  ColorPicker,
  Colors1,
  Colors2,
  Computer,
  CopyLeft,
  CopyRight,
  Crop1,
  DownArrowSm,
  DownArrow,
  Download2,
  DuplicateCard,
  Edit2,
  Email,
  Embed,
  Expand2,
  Expand,
  EyeClosed,
  EyeOpen,
  Facebook,
  FacebookLogo,
  Favourite,
  Flame,
  Globe1,
  Globe2,
  Globe3,
  Globe,
  Hash1,
  Hash2,
  HelpCircleContained,
  HelpSquareContained,
  Home4,
  Image3,
  InformationCircleContained,
  InformationSquareContained,
  Instagram,
  Journey,
  Key1,
  Key2,
  Laptop1,
  Layers4,
  LayoutScale,
  Lightning2,
  LightningCircleContained,
  Line,
  LinkAngled,
  LinkBroken,
  LinkExternal,
  Link,
  Lock1,
  LockOpen1,
  Mail1,
  Mail2,
  Marker1,
  Marker2,
  Maximise1,
  Maximise2,
  Menu1,
  MessageChat1,
  MessageText1,
  MessageTyping,
  Minimise1,
  Minimise2,
  MinusCircleContained,
  More,
  Palette,
  Passport,
  Pause1,
  Pause2,
  Pause3,
  Play2,
  Play3,
  Plus1,
  Plus2,
  Plus3,
  Search1,
  Search2,
  Send1,
  Share,
  Skype,
  Snapchat,
  SpaceHeight,
  SpaceHorizontal,
  SpaceVertical,
  Square,
  Star2,
  Target,
  Target2,
  Telegram,
  Trash2,
  ThumbsDown,
  ThumbsUp,
  Tiktok,
  TwitterLogo,
  UserProfile2,
  UserProfile3,
  UserProfileAdd,
  UserProfileCircle,
  UsersProfiles2,
  UsersProfiles3,
  Viber,
  Vk,
  Web,
  WhatsApp,
  X1,
  X2,
  X3,
  XCircleContained,
  XSquareContained
}

interface IconProps extends Pick<SvgIconProps, 'color' | 'fontSize' | 'sx'> {
  name: IconNames
}

export function Icon({ name, color, fontSize, sx }: IconProps): ReactElement {
  const IconComponent = iconComponents[name]
  return <IconComponent color={color} fontSize={fontSize} sx={{ ...sx }} />
}
