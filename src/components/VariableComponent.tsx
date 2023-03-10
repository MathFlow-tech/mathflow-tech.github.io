import { useDrag } from 'react-dnd';
import { ConstantOrVariableItem, DragTypes } from '../model/DragTypes';
import Element from '../model/Element';

interface Props {
  index: number;
  variableIndex: number;
  element: Element;
}

const VariableComponent = ({ index, variableIndex, element }: Props) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DragTypes.DIVISOR,
      item: {
        index,
        variableIndex: variableIndex,
        isConstant: false,
        element,
      } as ConstantOrVariableItem,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [index, variableIndex, element]
  );
  return (
    <p ref={drag} className={`variable ${isDragging ? 'dragging' : ''}`}>
      {element.variables[variableIndex].type}
    </p>
  );
};

export default VariableComponent;
