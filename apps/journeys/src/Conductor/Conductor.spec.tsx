import { render } from '@testing-library/react';
import Conductor from './Conductor';
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
describe('Conductor', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Conductor {...Transformer(data)} />
    );

    expect(baseElement).toBeTruthy();
  });

});
