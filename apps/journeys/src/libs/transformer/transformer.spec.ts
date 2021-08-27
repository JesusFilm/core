import transformer from './transformer';
import { data1 } from '../data/data';

describe('Transformer', () => {
  it('should render successfully', () => {
    expect(transformer(data1)).toEqual([{ "__typename": "video", "children": [{ "__typename": "radioOption", "action": "SecondBlock That's a Video", "children": [], "id": "Radio Option", "options": ["first choice", "second choice"], "parentId": "Root" }, { "__typename": "radioOption", "children": [], "id": "Another Radio Option", "options": ["great choice", "terrible choice"], "parentId": "Root" }], "id": "Root", "src": "videosource" }, { "__typename": "video", "children": [], "id": "SecondBlock That's a Video", "src": "yoyoyo2" }, { "__typename": "video", "children": [{ "__typename": "radioOption", "children": [{ "__typename": "radioOption", "children": [], "id": "NestedMoreQuestions", "options": ["a nested choice", "another nested choice"], "parentId": "MoreQuestions" }], "id": "MoreQuestions", "options": ["Button1 choice", "Button2 choice", "Button3 choice"], "parentId": "ThirdBlock also Video" }], "id": "ThirdBlock also Video", "src": "yoyoyo" }]);
  });
});
