import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded'
import Box from '@mui/material/Box'
import isFunction from 'lodash/isFunction'
import { ReactElement, ReactNode } from 'react'
import { Handle, OnConnect, Position } from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
import {} from '../../../../__generated__/StepAndCardBlockCreate'
import { useStepAndCardBlockCreateMutation } from '../../../libs/useStepAndCardBlockCreateMutation'

interface BaseNodeProps {
  isTargetConnectable?: boolean
  isSourceConnectable?: 'arrow' | boolean
  onSourceConnect?: (
    params: { target: string } | Parameters<OnConnect>[0]
  ) => void
  selected?: 'descendant' | boolean
  children?:
    | ((context: { selected: 'descendant' | boolean }) => ReactNode)
    | ReactNode
}

export function BaseNode({
  isTargetConnectable = false,
  isSourceConnectable = false,
  onSourceConnect,
  selected = false,
  children
}: BaseNodeProps): ReactElement {
  const { journey } = useJourney()
  const [stepAndCardBlockCreate] = useStepAndCardBlockCreateMutation()

  const handleClick = async (): Promise<void> => {
    if (journey == null) return

    const stepId = uuidv4()
    const cardId = uuidv4()
    const { data } = await stepAndCardBlockCreate({
      variables: {
        stepBlockCreateInput: {
          id: stepId,
          journeyId: journey.id
        },
        cardBlockCreateInput: {
          id: cardId,
          journeyId: journey.id,
          parentBlockId: stepId,
          themeMode: ThemeMode.dark,
          themeName: ThemeName.base
        }
      }
    })
    if (data?.stepBlockCreate != null) {
      onSourceConnect?.({
        target: data.stepBlockCreate.id
      })
    }
  }

  return (
    <Box
      sx={{
        '.show-on-hover': {
          visibility: 'hidden'
        },
        '&:hover .show-on-hover': {
          visibility: 'visible'
        }
      }}
    >
      {isFunction(children) ? children({ selected }) : children}
      {isTargetConnectable && (
        <>
          <Handle
            type="target"
            position={Position.Top}
            style={{
              width: 7.5,
              height: 7.5,
              background: 'white',
              border:
                selected !== false
                  ? '2px solid #c52d3aff'
                  : '2px solid #aaacbb',
              outline: '1px solid white',
              outlineColor: 'white',
              cursor: 'pointer',
              top: selected !== false ? -9.5 : -4
            }}
          />
          <Handle
            type="target"
            position={Position.Bottom}
            isConnectableStart={false}
            style={{
              overflow: 'visible',
              width: '100%',
              height: '100%',
              borderRadius: 0,
              background: 'tranparent',
              opacity: 0
            }}
          />
        </>
      )}
      {isSourceConnectable !== false && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            onConnect={onSourceConnect}
            onClick={handleClick}
            style={{
              width: 7.5,
              height: 7.5,
              background: 'white',
              border:
                selected !== false
                  ? '2px solid #c52d3aff'
                  : '2px solid #aaacbb',
              outline: '1px solid',
              outlineColor: 'white',
              bottom: selected !== false ? -9.5 : -4
            }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            onConnect={onSourceConnect}
            onClick={handleClick}
            style={{
              position: 'fixed',
              width: 40,
              height: 40,
              top: 60,
              background: 'transparent',
              borderColor: 'transparent',
              borderRadius: 20,
              overflow: 'visible'
            }}
          />
          {isSourceConnectable === 'arrow' && (
            <ArrowDownwardRoundedIcon
              className="show-on-hover"
              style={{
                display: 'flex',
                position: 'absolute',
                borderRadius: '50%',
                color: 'white',
                fontSize: 'large',
                padding: 0,
                marginTop: 5,
                backgroundColor: '#c52d3aff',
                left: '50%',
                transform: 'translate(-50%, 0)'
              }}
            />
          )}
        </>
      )}
    </Box>
  )
}
