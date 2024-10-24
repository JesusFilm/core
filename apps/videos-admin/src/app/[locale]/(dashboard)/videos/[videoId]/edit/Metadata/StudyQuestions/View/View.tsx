import { ReactElement } from "react";

export function View({ studyQuestion }): ReactElement  {
  return <pre>{JSON.stringify(studyQuestion, null, 2)}</pre>
}