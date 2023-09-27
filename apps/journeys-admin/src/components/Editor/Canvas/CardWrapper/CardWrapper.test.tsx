import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render } from '@testing-library/react'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { WrappersProps } from '@core/journeys/ui/BlockRenderer'
import { Card } from '@core/journeys/ui/Card'
import { EditorProvider, useEditor } from '@core/journeys/ui/EditorProvider'

import { VideoBlockSource } from '../../../../../__generated__/globalTypes'

import { CardWrapper } from '.'

jest.mock('@core/journeys/ui/Card', () => ({
  __esModule: true,
  Card: jest.fn(() => <></>)
}))

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('CardWrapper', () => {
  function Container(_props: { wrappers?: WrappersProps }): ReactElement {
    return <></>
  }

  function EditorState(): ReactElement {
    const { state } = useEditor()
    return (
      <>
        <div>selectedBlock: {state.selectedBlock?.id}</div>
        <div>drawerTitle: {state.drawerTitle}</div>
        <div>selectedAttributeId: {state.selectedAttributeId}</div>
      </>
    )
  }

  it('should set videoId to null', () => {
    const block: TreeBlock = {
      id: 'card5.id',
      __typename: 'CardBlock',
      parentBlockId: 'step5.id',
      coverBlockId: 'video5.id',
      parentOrder: 0,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: [
        {
          id: 'video5.id',
          __typename: 'VideoBlock',
          parentBlockId: 'card5.id',
          parentOrder: 0,
          autoplay: false,
          muted: true,
          videoId: '2_0-FallingPlates',
          videoVariantLanguageId: '529',
          source: VideoBlockSource.internal,
          title: null,
          description: null,
          duration: null,
          image: null,
          video: null,
          startAt: null,
          endAt: null,
          posterBlockId: 'image5.id',
          fullsize: null,
          action: null,
          objectFit: null,
          children: [
            {
              id: 'image5.id',
              __typename: 'ImageBlock',
              src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
              width: 1920,
              height: 1080,
              alt: 'random image from unsplash',
              parentBlockId: 'video5.id',
              parentOrder: 0,
              children: [],
              blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ'
            }
          ]
        }
      ]
    }
    render(
      <CardWrapper block={block}>
        <Container wrappers={{}} />
      </CardWrapper>
    )
    expect(Card).toHaveBeenCalledWith(
      {
        __typename: 'CardBlock',
        backgroundColor: null,
        children: [
          {
            __typename: 'VideoBlock',
            autoplay: false,
            children: [
              {
                __typename: 'ImageBlock',
                alt: 'random image from unsplash',
                blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ',
                children: [],
                height: 1080,
                id: 'image5.id',
                parentBlockId: 'video5.id',
                parentOrder: 0,
                src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
                width: 1920
              }
            ],
            endAt: null,
            fullsize: null,
            action: null,
            id: 'video5.id',
            muted: true,
            parentBlockId: 'card5.id',
            parentOrder: 0,
            posterBlockId: 'image5.id',
            startAt: null,
            source: VideoBlockSource.internal,
            title: null,
            description: null,
            duration: null,
            objectFit: null,
            image: null,
            video: null,
            videoId: null,
            videoVariantLanguageId: '529'
          }
        ],
        coverBlockId: 'video5.id',
        fullscreen: false,
        id: 'card5.id',
        parentBlockId: 'step5.id',
        parentOrder: 0,
        themeMode: null,
        themeName: null,
        wrappers: {}
      },
      {}
    )
  })

  it('should handle where videoId is not set', () => {
    const block: TreeBlock = {
      id: 'card5.id',
      __typename: 'CardBlock',
      parentBlockId: 'step5.id',
      coverBlockId: 'video5.id',
      parentOrder: 0,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: [
        {
          id: 'video5.id',
          __typename: 'VideoBlock',
          parentBlockId: 'card5.id',
          parentOrder: 0,
          autoplay: false,
          muted: true,
          videoId: null,
          videoVariantLanguageId: '529',
          source: VideoBlockSource.internal,
          title: null,
          description: null,
          duration: null,
          image: null,
          video: null,
          startAt: null,
          endAt: null,
          posterBlockId: 'image5.id',
          fullsize: null,
          action: null,
          objectFit: null,
          children: [
            {
              id: 'image5.id',
              __typename: 'ImageBlock',
              src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
              width: 1920,
              height: 1080,
              alt: 'random image from unsplash',
              parentBlockId: 'video5.id',
              parentOrder: 0,
              children: [],
              blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ'
            }
          ]
        }
      ]
    }
    render(
      <CardWrapper block={block}>
        <Container wrappers={{}} />
      </CardWrapper>
    )
    expect(Card).toHaveBeenCalledWith(
      {
        __typename: 'CardBlock',
        backgroundColor: null,
        children: [
          {
            __typename: 'VideoBlock',
            autoplay: false,
            children: [
              {
                __typename: 'ImageBlock',
                alt: 'random image from unsplash',
                blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ',
                children: [],
                height: 1080,
                id: 'image5.id',
                parentBlockId: 'video5.id',
                parentOrder: 0,
                src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
                width: 1920
              }
            ],
            endAt: null,
            fullsize: null,
            action: null,
            id: 'video5.id',
            muted: true,
            parentBlockId: 'card5.id',
            parentOrder: 0,
            posterBlockId: 'image5.id',
            startAt: null,
            source: VideoBlockSource.internal,
            title: null,
            description: null,
            objectFit: null,
            duration: null,
            image: null,
            video: null,
            videoId: null,
            videoVariantLanguageId: '529'
          }
        ],
        coverBlockId: 'video5.id',
        fullscreen: false,
        id: 'card5.id',
        parentBlockId: 'step5.id',
        parentOrder: 0,
        themeMode: null,
        themeName: null,
        wrappers: {}
      },
      {}
    )
  })

  it('does not show Select Card Template button when desktop', () => {
    const card: TreeBlock = {
      id: 'cardId',
      __typename: 'CardBlock',
      parentBlockId: 'stepId',
      coverBlockId: null,
      parentOrder: 0,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: []
    }
    const step: TreeBlock = {
      id: 'stepId',
      __typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      children: [card]
    }
    const { queryByRole } = render(
      <EditorProvider initialState={{ steps: [step] }}>
        <EditorState />
        <CardWrapper block={card}>
          <Container wrappers={{}} />
        </CardWrapper>
      </EditorProvider>
    )
    expect(
      queryByRole('button', { name: 'Select Card Template' })
    ).not.toBeInTheDocument()
  })

  describe('mobile', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => false)
    )

    it('opens card template library', () => {
      const card: TreeBlock = {
        id: 'cardId',
        __typename: 'CardBlock',
        parentBlockId: 'stepId',
        coverBlockId: null,
        parentOrder: 0,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: []
      }
      const step: TreeBlock = {
        id: 'stepId',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        children: [card]
      }
      const { getByRole, getByText } = render(
        <EditorProvider initialState={{ steps: [step] }}>
          <EditorState />
          <CardWrapper block={card}>
            <Container wrappers={{}} />
          </CardWrapper>
        </EditorProvider>
      )
      fireEvent.click(getByRole('button', { name: 'Select Card Template' }))
      expect(getByText('selectedBlock: stepId')).toBeInTheDocument()
      expect(getByText('drawerTitle: Card Templates')).toBeInTheDocument()
      expect(getByText('selectedAttributeId:')).toBeInTheDocument()
    })

    it('does not show Select Card Template button when children', () => {
      const card: TreeBlock = {
        id: 'cardId',
        __typename: 'CardBlock',
        parentBlockId: 'stepId',
        coverBlockId: null,
        parentOrder: 0,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            id: 'imageId',
            __typename: 'ImageBlock',
            src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            width: 1920,
            height: 1080,
            alt: 'random image from unsplash',
            parentBlockId: 'cardId',
            parentOrder: 0,
            children: [],
            blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ'
          }
        ]
      }
      const step: TreeBlock = {
        id: 'stepId',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        children: [card]
      }
      const { queryByRole } = render(
        <EditorProvider initialState={{ steps: [step] }}>
          <EditorState />
          <CardWrapper block={card}>
            <Container wrappers={{}} />
          </CardWrapper>
        </EditorProvider>
      )
      expect(
        queryByRole('button', { name: 'Select Card Template' })
      ).not.toBeInTheDocument()
    })
  })
})
