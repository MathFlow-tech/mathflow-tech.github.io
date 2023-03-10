import Element from './Element';

export enum Side {
  Left,
  Right,
}

class Equation {
  left: Element[];
  right: Element[];
  prevState: Equation | null;
  nextState: Equation | null;

  constructor(left: Element[], right: Element[]) {
    this.left = left;
    this.right = right;
    this.prevState = null;
    this.nextState = null;
  }

  moveVariable(from: number, to: number, left: boolean) {
    const newEquation = this.getNextEquation();

    const equation = left ? newEquation.left : newEquation.right;
    const element = equation.splice(from, 1)[0];
    equation.splice(to, 0, element);

    if (equation.length === 0) {
      equation.push(new Element(0, true, left ? Side.Left : Side.Right));
    }

    return newEquation;
  }

  moveVariableFromSide(fromIndex: number, fromLeft: boolean) {
    const newEquation = this.getNextEquation();

    const fromEquation = fromLeft ? newEquation.left : newEquation.right;
    const toEquation = fromLeft ? newEquation.right : newEquation.left;
    const element = fromEquation.splice(fromIndex, 1)[0];

    if (fromEquation.length === 0) {
      fromEquation.push(
        new Element(0, true, fromLeft ? Side.Left : Side.Right)
      );
    }

    if (
      toEquation.length === 1 &&
      toEquation[0].isNumber() &&
      toEquation[0].constant.value === 0
    ) {
      toEquation.splice(0, 1);
    }

    // Change positivity when moving sides
    element.positive = !element.positive;
    element.side = element.side === Side.Left ? Side.Right : Side.Left;

    toEquation.push(element);

    return newEquation;
  }

  divideSidesBy(index: number, side: Side) {
    const newEquation = this.getNextEquation();
    const eqSide = side === Side.Left ? newEquation.left : newEquation.right;
    const divisor = eqSide[index].constant.value;
    eqSide[index].split = false;

    newEquation.left.forEach((element) => element.divideBy(divisor));
    newEquation.right.forEach((element) => element.divideBy(divisor));

    // Simplify the divisor
    eqSide[index].simplifyFraction();

    return newEquation;
  }

  divideSidesByVariable(index: number, variableIndex: number, side: Side) {
    const newEquation = this.getNextEquation();
    const eqSide = side === Side.Left ? newEquation.left : newEquation.right;
    const divisor = eqSide[index].variables[variableIndex];
    eqSide[index].split = false;

    newEquation.left.forEach((element) => element.divideByVariable(divisor));
    newEquation.right.forEach((element) => element.divideByVariable(divisor));

    // Simplify the divisor
    eqSide[index].simplifyFraction();

    return newEquation;
  }

  simplifyElementFraction(index: number, side: Side) {
    const newEquation = this.getNextEquation();
    const equation = side === Side.Left ? newEquation.left : newEquation.right;

    equation[index].simplifyFraction();

    return newEquation;
  }

  combine(index1: number, index2: number, left: boolean) {
    const newEquation = this.getNextEquation();

    const equation = left ? newEquation.left : newEquation.right;
    const element1 = equation[index1];
    const element2 = equation.splice(index2, 1)[0];

    if (!element1.equalsType(element2)) {
      throw new Error(
        `Cannot combine terms. Type ${element1.variables} does not match ${element2.variables}`
      );
    }

    if (index1 === index2) {
      throw new Error('Combination indices must be different');
    }

    element1.constant.value += element2.constant.value;

    return newEquation;
  }

  flipSides = () => {
    const newEquation = this.getNextEquation();

    const temp = newEquation.left;
    const flip = (element: Element) => {
      element.positive = !element.positive;
      element.side = element.side === Side.Left ? Side.Right : Side.Left;
      return element;
    };
    newEquation.left = newEquation.right.map(flip);
    newEquation.right = temp.map(flip);

    return newEquation;
  };

  splitVariable = (index: number, side: Side) => {
    const newEquation = this.getNextEquation();

    const equation = side === Side.Left ? newEquation.left : newEquation.right;

    if (!equation[index].isNumber()) {
      equation[index].split = !equation[index].split;
    }

    return newEquation;
  };

  private getEquationStr = (equation: Element[]) =>
    equation.reduce((acc: string, element: Element, index: number) => {
      const first = index === 0;

      if (!first) {
        acc += ` ${element.positive ? '+' : '-'} `;
      }

      acc += element.getString();

      return acc;
    }, '');

  toString() {
    return (
      this.getEquationStr(this.left) + ' = ' + this.getEquationStr(this.right)
    );
  }

  clone() {
    const equationClone = new Equation(
      this.left.map((element) => element.clone()),
      this.right.map((element) => element.clone())
    );

    equationClone.nextState = this.nextState;
    equationClone.prevState = this.prevState;

    return equationClone;
  }

  private getNextEquation() {
    const newEquation = this.clone();
    newEquation.prevState = this;
    newEquation.nextState = null;
    this.nextState = newEquation;

    return newEquation;
  }
}

export default Equation;
