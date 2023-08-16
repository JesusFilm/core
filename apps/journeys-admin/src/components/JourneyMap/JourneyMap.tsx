import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { ReactElement, useState } from 'react'
import Graph from "react-d3-graph";

import type { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'

import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { GetUserRole } from '../../../__generated__/GetUserRole'
import { JourneysReportType, Role } from '../../../__generated__/globalTypes'
import { MemoizedDynamicReport } from '../DynamicPowerBiReport'

import { CardView } from './CardView'
import { DatePreview } from './DatePreview'
import { JourneyLink } from './JourneyLink'
import { EmbedJourneyDialog } from './JourneyLink/EmbedJourneyDialog'
import { SlugDialog } from './JourneyLink/SlugDialog'
import { JourneyViewFab } from './JourneyViewFab'
import { Properties } from './Properties'
import { SocialImage } from './SocialImage'
import { TitleDescription } from './TitleDescription'

const JourneyMap = ({graph = {
  steps: [
    {
      id: 'step1',
      label: 'Step 1',
      nextSteps: ['step2', 'step3']
    },
    {
      id: 'step2',
      label: 'Step 2',
      nextSteps: ['step4']  
    },
    {
      id: 'step3',
      label: 'Step 3',
      nextSteps: ['step4', 'step5']
    }
  ] 
}}) => {


  const [selectedNode, setSelectedNode] = useState();

  const data = {
    nodes: graph.steps.map(step => ({id: step.id})),
    links: buildLinks(graph.steps)
  };

  const buildLinks = (steps) => {
    const links = [];
    steps.forEach(step => {
      step.nextSteps.forEach(nextStepId => {
        links.push({source: step.id, target: nextStepId})  
      });
    });
    return links;
  }

  const onClickNode = (nodeId) => {
    setSelectedNode(nodeId);
  }

  return (
    <Graph
      id="graph"
      data={data}
      onClickNode={onClickNode}
      selected={selectedNode}
      nodeColor={node => node === selectedNode ? 'blue' : 'gray'}
    />
  );

}

