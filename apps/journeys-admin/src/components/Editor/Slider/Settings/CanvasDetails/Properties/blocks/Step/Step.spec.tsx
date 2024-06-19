import { MockedProvider } from "@apollo/client/testing";
import { render } from "@testing-library/react";
import { SnackbarProvider } from "notistack";

import {
  ActiveContent,
  ActiveFab,
  EditorProvider,
  EditorState,
} from "@core/journeys/ui/EditorProvider";
import {
  ActiveCanvasDetailsDrawer,
  ActiveSlide,
} from "@core/journeys/ui/EditorProvider/EditorProvider";
import { JourneyProvider } from "@core/journeys/ui/JourneyProvider";
import type { TreeBlock } from "@core/journeys/ui/block";

import { BlockFields_StepBlock as StepBlock } from "../../../../../../../../../__generated__/BlockFields";

import { Step } from ".";

jest.mock("@mui/material/useMediaQuery", () => ({
  __esModule: true,
  default: () => true,
}));

describe("Step", () => {
  const state: EditorState = {
    steps: [],
    activeFab: ActiveFab.Add,
    activeSlide: ActiveSlide.JourneyFlow,
    activeContent: ActiveContent.Canvas,
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
  };

  it("shows default messages", () => {
    const step: TreeBlock<StepBlock> = {
      id: "step1.id",
      __typename: "StepBlock",
      parentBlockId: "step1.id",
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      children: [],
    };

    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider>
            <EditorProvider
              initialState={{
                ...state,
                steps: [step],
                selectedStep: step,
                selectedBlock: step,
              }}
            >
              <Step {...step} />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    );
    expect(getByText("None")).toBeInTheDocument();
    // expect(getByText('Unlocked Card')).toBeInTheDocument()
  });

  describe("nextCard", () => {
    it("shows locked", () => {
      const step: TreeBlock<StepBlock> = {
        id: "step1.id",
        __typename: "StepBlock",
        parentBlockId: "step1.id",
        parentOrder: 0,
        locked: true,
        nextBlockId: null,
        children: [],
      };
      const { getByText } = render(
        <MockedProvider>
          <EditorProvider initialState={{ steps: [step] }}>
            <Step {...step} />
          </EditorProvider>
        </MockedProvider>
      );
      expect(getByText("Locked With Interaction")).toBeInTheDocument();
    });

    it("shows next step title", () => {
      const step1: TreeBlock<StepBlock> = {
        id: "step1.id",
        __typename: "StepBlock",
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        children: [],
      };
      const step2: TreeBlock<StepBlock> = {
        id: "step2.id",
        __typename: "StepBlock",
        parentBlockId: null,
        parentOrder: 1,
        locked: false,
        nextBlockId: null,
        children: [],
      };

      const { getByText } = render(
        <MockedProvider>
          <EditorProvider
            initialState={{
              steps: [step1, step2],
              activeFab: ActiveFab.Add,
              activeSlide: ActiveSlide.JourneyFlow,
              activeContent: ActiveContent.Canvas,
              activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
            }}
          >
            <Step {...step1} />
          </EditorProvider>
        </MockedProvider>
      );
      expect(getByText("Step 2")).toBeInTheDocument();
    });

    it("shows custom next step title", () => {
      const step1: TreeBlock<StepBlock> = {
        id: "step1.id",
        __typename: "StepBlock",
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: "step5.id",
        children: [],
      };
      const step2: TreeBlock<StepBlock> = {
        id: "step2.id",
        __typename: "StepBlock",
        parentBlockId: null,
        parentOrder: 1,
        locked: false,
        nextBlockId: null,
        children: [],
      };
      const step5: TreeBlock<StepBlock> = {
        id: "step5.id",
        __typename: "StepBlock",
        parentBlockId: null,
        parentOrder: 4,
        locked: false,
        nextBlockId: null,
        children: [
          {
            __typename: "CardBlock",
            id: "card1.id",
            parentBlockId: "step2.id",
            coverBlockId: null,
            parentOrder: 0,
            backgroundColor: null,
            themeMode: null,
            themeName: null,
            fullscreen: false,
            children: [
              {
                __typename: "TypographyBlock",
                id: "typography",
                content: "my Title",
                parentBlockId: "card1.id",
                parentOrder: 0,
                align: null,
                color: null,
                variant: null,
                children: [],
              },
            ],
          },
        ],
      };

      const { getByText } = render(
        <MockedProvider>
          <EditorProvider
            initialState={{
              steps: [step1, step2, step5],
              activeFab: ActiveFab.Add,
              activeSlide: ActiveSlide.JourneyFlow,
              activeContent: ActiveContent.Canvas,
              activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
            }}
          >
            <Step {...step1} />
          </EditorProvider>
        </MockedProvider>
      );
      expect(getByText("my Title")).toBeInTheDocument();
    });

    it("shows first typography text", () => {
      const step1: TreeBlock<StepBlock> = {
        id: "step1.id",
        __typename: "StepBlock",
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        children: [],
      };
      const step2: TreeBlock<StepBlock> = {
        id: "step2.id",
        __typename: "StepBlock",
        parentBlockId: null,
        parentOrder: 1,
        locked: false,
        nextBlockId: null,
        children: [
          {
            __typename: "CardBlock",
            id: "card1.id",
            parentBlockId: "step2.id",
            coverBlockId: null,
            parentOrder: 0,
            backgroundColor: null,
            themeMode: null,
            themeName: null,
            fullscreen: false,
            children: [
              {
                __typename: "TypographyBlock",
                id: "typography",
                content: "my Title",
                parentBlockId: "card1.id",
                parentOrder: 0,
                align: null,
                color: null,
                variant: null,
                children: [],
              },
            ],
          },
        ],
      };

      const { getByText } = render(
        <MockedProvider>
          <EditorProvider
            initialState={{
              steps: [step1, step2],
              activeFab: ActiveFab.Add,
              activeSlide: ActiveSlide.JourneyFlow,
              activeContent: ActiveContent.Canvas,
              activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
            }}
          >
            <Step {...step1} />
          </EditorProvider>
        </MockedProvider>
      );
      expect(getByText("my Title")).toBeInTheDocument();
    });

    it("should show none", () => {
      const step1: TreeBlock<StepBlock> = {
        id: "step1.id",
        __typename: "StepBlock",
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        children: [],
      };
      const step2: TreeBlock<StepBlock> = {
        id: "step2.id",
        __typename: "StepBlock",
        parentBlockId: null,
        parentOrder: 1,
        locked: false,
        nextBlockId: null,
        children: [],
      };
      const { getByText } = render(
        <MockedProvider>
          <EditorProvider
            initialState={{
              steps: [step1, step2],
            }}
          >
            <Step {...step2} />
          </EditorProvider>
        </MockedProvider>
      );
      expect(getByText("None")).toBeInTheDocument();
    });
  });
});
