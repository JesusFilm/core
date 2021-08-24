import { render } from '@testing-library/react';
import {BlockRenderer, Block} from './BlockRenderer';
import Transformer from '../Transformer/Transformer';

const data = [{
    "id":"Root",
  },
  {
    "parentId":"Root",
    "id":"Video",
  },
  {
    "parentId":"Root",
    "id":"Questions",
  },
  {
    "id":"SecondBlock",
  },
  {
    "id":"ThirdBlock",
  },
  {
    "parentId":"ThirdBlock",
    "id":"MoreQuestions",
  },
]

describe('BlockRenderer', () => {
  it('should render successfully', () => {

    const { baseElement } = render(
      <BlockRenderer {...Transformer(data)[0]} />
    );

    expect(baseElement).toBeTruthy();
  });

});
