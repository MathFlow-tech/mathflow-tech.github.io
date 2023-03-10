import Constant from './Constant';
import { Side } from './Equation';
import Variable from './Variable';

export interface ElementItem {
  index: number;
  element: Element;
}

class Element {
  constant: Constant;
  positive: boolean;
  side: Side;
  variables: Variable[];
  denominator: Variable | number;
  split: boolean;

  constructor(
    constant: number,
    positive: boolean,
    side: Side,
    variables?: Variable[],
    denominator?: number | Variable
  ) {
    this.constant = new Constant(constant);
    this.positive = positive;
    this.side = side;
    this.split = false;

    if (variables) {
      this.variables = variables;
    } else {
      this.variables = [];
    }

    if (denominator !== undefined) {
      this.denominator = denominator;
    } else {
      this.denominator = 1;
    }
  }

  denominatorAsString() {
    if (typeof this.denominator === 'number') {
      return this.denominator.toString();
    } else {
      return (this.denominator as Variable).type;
    }
  }

  divideBy(divisor: number) {
    if (typeof this.denominator === 'number') {
      this.denominator *= divisor;
    }
  }

  divideByVariable(variable: Variable) {
    this.denominator = variable;
  }

  simplifyFraction() {
    if (
      typeof this.denominator === 'number' &&
      this.constant.value % this.denominator === 0
    ) {
      this.constant.value /= this.denominator;
      this.denominator = 1;
    } else {
      const variable = this.denominator as Variable;
      if (this.variables.map((elm) => elm.type).includes(variable.type)) {
        this.variables = this.variables.filter(
          (elementVariable) => elementVariable.type !== variable.type
        );
        this.denominator = 1;
      }
    }
  }

  isNumber() {
    return this.variables.length === 0;
  }

  equalsType(other: Element) {
    if (other.variables.length !== this.variables.length) {
      return false;
    }

    this.variables.forEach((variable) => {
      if (!other.variables.includes(variable)) {
        return false;
      }
    });

    return true;
  }

  clone() {
    const newElement = new Element(
      this.constant.value,
      this.positive,
      this.side,
      this.variables,
      this.denominator
    );
    newElement.split = this.split;

    return newElement;
  }

  getString() {
    return (
      this.constant.value.toString() +
      this.variables.reduce((acc, variable) => acc + variable.type, '')
    );
  }
}

export default Element;
