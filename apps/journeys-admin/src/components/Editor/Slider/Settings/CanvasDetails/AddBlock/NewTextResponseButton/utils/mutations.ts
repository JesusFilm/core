import { gql } from '@apollo/client'

import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import { BUTTON_FIELDS } from '@core/journeys/ui/Button/buttonFields'
import { ICON_FIELDS } from '@core/journeys/ui/Icon/iconFields'
import { TEXT_RESPONSE_FIELDS } from '@core/journeys/ui/TextResponse/textResponseFields'

/**
 * Mutation to create a single text response block
 */
export const TEXT_RESPONSE_BLOCK_CREATE = gql`
  ${TEXT_RESPONSE_FIELDS}
  mutation TextResponseBlockCreate($input: TextResponseBlockCreateInput!) {
    textResponseBlockCreate(input: $input) {
      id
      parentBlockId
      parentOrder
      ...TextResponseFields
    }
  }
`

/**
 * Mutation to create a text response block with an associated submit button
 */
export const TEXT_RESPONSE_WITH_BUTTON_CREATE = gql`
  ${TEXT_RESPONSE_FIELDS}
  ${BUTTON_FIELDS}
  ${ICON_FIELDS}
  mutation TextResponseWithButtonCreate(
    $textResponseInput: TextResponseBlockCreateInput!
    $buttonInput: ButtonBlockCreateInput!
    $iconInput1: IconBlockCreateInput!
    $iconInput2: IconBlockCreateInput!
    $buttonId: ID!
    $journeyId: ID!
    $buttonUpdateInput: ButtonBlockUpdateInput!
  ) {
    textResponse: textResponseBlockCreate(input: $textResponseInput) {
      ...TextResponseFields
    }
    button: buttonBlockCreate(input: $buttonInput) {
      ...ButtonFields
    }
    startIcon: iconBlockCreate(input: $iconInput1) {
      ...IconFields
    }
    endIcon: iconBlockCreate(input: $iconInput2) {
      ...IconFields
    }
    buttonUpdate: buttonBlockUpdate(
      id: $buttonId
      journeyId: $journeyId
      input: $buttonUpdateInput
    ) {
      ...ButtonFields
    }
  }
`

/**
 * Mutation to delete a text response block and its associated button
 */
export const TEXT_RESPONSE_WITH_BUTTON_DELETE = gql`
  mutation TextResponseWithButtonDelete(
    $textResponseId: ID!
    $buttonId: ID!
    $startIconId: ID!
    $endIconId: ID!
  ) {
    endIcon: blockDelete(id: $endIconId) {
      id
      parentOrder
    }
    startIcon: blockDelete(id: $startIconId) {
      id
      parentOrder
    }
    button: blockDelete(id: $buttonId) {
      id
      parentOrder
    }
    textResponse: blockDelete(id: $textResponseId) {
      id
      parentOrder
    }
  }
`

/**
 * Mutation to restore a previously deleted text response block and its associated button
 */
export const TEXT_RESPONSE_WITH_BUTTON_RESTORE = gql`
  ${BLOCK_FIELDS}
  mutation TextResponseWithButtonRestore(
    $textResponseId: ID!
    $buttonId: ID!
    $startIconId: ID!
    $endIconId: ID!
  ) {
    textResponse: blockRestore(id: $textResponseId) {
      ...BlockFields
    }
    button: blockRestore(id: $buttonId) {
      ...BlockFields
    }
    startIcon: blockRestore(id: $startIconId) {
      ...BlockFields
    }
    endIcon: blockRestore(id: $endIconId) {
      ...BlockFields
    }
  }
`
