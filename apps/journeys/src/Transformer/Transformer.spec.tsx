import Transformer from './Transformer';

describe('Transformer', () => {
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

  it('should render successfully', () => {
    const transformed = Transformer(data)
    expect(transformed).toBeTruthy();
  });
});
