import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";
import { ReactElement } from "react";
import { NodeProps } from "reactflow";

import { ActiveContent, useEditor } from "@core/journeys/ui/EditorProvider";
import { filterActionBlocks } from "@core/journeys/ui/filterActionBlocks";

import { BaseNode } from "../BaseNode";

import { ActionButton } from "./ActionButton";
import { StepBlockNodeCard } from "./StepBlockNodeCard";
import { StepBlockNodeMenu } from "./StepBlockNodeMenu";
import { STEP_NODE_WIDTH } from "./libs/sizes";

export function StepBlockNode({
  id,
  xPos,
  yPos,
  dragging,
}: NodeProps): ReactElement {
  const {
    state: { steps, selectedStep, activeContent },
  } = useEditor();
  const step = steps?.find((step) => step.id === id);
  const actionBlocks = filterActionBlocks(step);

  const isSelected =
    activeContent === ActiveContent.Canvas && selectedStep?.id === step?.id;

  return step != null ? (
    <>
      <StepBlockNodeMenu
        in={isSelected}
        className="fab"
        step={step}
        xPos={xPos}
        yPos={yPos}
      />

      <Stack
        data-testid={`StepBlockNode-${step.id}`}
        direction="column"
        sx={{
          background: (theme) =>
            isSelected
              ? alpha(theme.palette.secondary.dark, 0.095)
              : alpha(theme.palette.background.default, 0.064),
          border: (theme) =>
            `2px solid ${alpha(theme.palette.secondary.dark, 0.1)}`,
          borderRadius: 3,
          maxWidth: STEP_NODE_WIDTH,
          transition: (theme) => theme.transitions.create("background"),
        }}
      >
        <BaseNode
          id={step.id}
          targetHandle="show"
          selected={isSelected}
          isSourceConnected={step.nextBlockId != null}
          dragging={dragging}
        >
          {() => (
            <>
              <StepBlockNodeCard step={step} selected={isSelected} />
              <ActionButton block={step} selected={isSelected} />
            </>
          )}
        </BaseNode>
        <Stack direction="column">
          {actionBlocks.map((block) => (
            <ActionButton key={block.id} block={block} selected={isSelected} />
          ))}
        </Stack>
      </Stack>
    </>
  ) : (
    <></>
  );
}
