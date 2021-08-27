import { BaseBlockProps } from '../BlockRenderer/BlockRenderer';
import { ConductorContext } from '../Conductor/Conductor';

type RadioOptionProps = {
  options: string[]
  __typename: 'radioOption'
}

export type RadioOptionBlockProps = RadioOptionProps & BaseBlockProps

export function BlockRendererRadioOption(block: RadioOptionBlockProps) {

  return (
    <ConductorContext.Consumer>
      {({goTo: handleNextStep}) => (
        <>
          {
            block.options.map((option, i) => {
              return (
                <div className="radio" key={i}>
                  <label>
                    <input
                      type="radio"
                      value="Male"
                      onChange={() => handleNextStep(block.action? block.action : undefined)}
                    />
                    {option}
                  </label>
                </div>
              )
            }
          )}
        </>
      )}
    </ConductorContext.Consumer>
  );
}

export default BlockRendererRadioOption;

