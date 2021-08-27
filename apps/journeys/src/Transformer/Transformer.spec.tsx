import Transformer from './Transformer';
import { data1 } from '../data/data';

describe('Transformer', () => {

  it('should render successfully', () => {
    const transformed = Transformer(data1)
    expect(transformed).toBeTruthy();
  });
});
