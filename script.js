// random integer between two values inclusive
function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function lcm(x, y) {
  if ((typeof x !== 'number') || (typeof y !== 'number')) 
   return false;
 return (!x || !y) ? 0 : Math.abs((x * y) / gcd(x, y));
}

// the gcd of two numbers
function gcd(x, y) {
  if (typeof x != "number" || typeof y != "number" || isNaN(x) || isNaN(y))
    throw new Error("Invalid argument");
  x = Math.abs(x);
  y = Math.abs(y);
  while (y != 0) {
    var z = x % y;
    x = y;
    y = z;
  }
  return x;
}


// the gcd of a list of numbers
function findGCD(arr, n) {
  let result = arr[0];
  for (let i = 1; i < n; i++) {
    result = gcd(arr[i], result);

    if (result == 1) {
      return 1;
    }
  }
  return result;
}

function Matrix(numRows, numCols) {
  this.numRows = numRows;
  this.numCols = numCols;
  // Initialize with zeros
  let row = [];
  for (var j = 0; j < numCols; j++)
      row.push(0);
  this.cells = []; // Main data (the matrix)
  for (var i = 0; i < numRows; i++)
      this.cells.push([...row]);

  this.get = function(row, col) {
    if (row >= 0 && row <= this.numRows && col >= 0 && col <= this.numCols) {
      return this.cells[row][col]
    }
  }

  this.set = function(row, col, value) {
    if (row >= 0 && row <= this.numRows && col >= 0 && col <= this.numCols) {
      this.cells[row][col] = value;
    }
  }

  this.swap = function(row1, row2) {
    if (row1 >= 0 && row1 <= this.numRows && row2 >= 0 && row2 <= this.numCols) {
      let temp = this.cells[row1];
      this.cells[row1] = this.cells[row2];
      this.cells[row2] = temp;
    }
  }

  this.add = function(row1, row2) {
    return row1.map((number, index) => {
      return number + row2[index];
    });
  }

  this.multiply = function(row, c) {
    return row.map(num => num*c);
  }

  this.gcdRow = function(row) {
    return findGCD(row, row.length);
  }

  this.simplifyRow = function(row) {
    let sign = 0;
    for (let index = 0; index < row.length; index++) {
      const element = row[index];
      if (element != 0) {
        if (element < 0) sign = -1;
        if (element > 0) sign = 1;
        break;
      }
    };

    const divisor = (sign == 0 ? 1 : this.gcdRow(row) * sign);
    return row.map(num => num / divisor);
  }

  this.gaussJordanEliminate = function() {
    this.cells = this.cells.map(row => this.simplifyRow(row));

    let num_pivots = 0;
    for (let i = 0; i < this.numCols; i++) {
      let curr_row = num_pivots;
      while (curr_row < this.numRows && this.cells[curr_row][i] == 0) {
        curr_row ++;
      }
      if (curr_row != this.numRows) {
        this.swap(curr_row, num_pivots);
        while (curr_row <= this.numRows) {
          if (this.cells[curr_row] != null && this.cells[curr_row][i] != 0) {
            this.simplifyRow(this.cells[curr_row]);
            this.cells[curr_row] = this.multiply(this.cells[curr_row], lcm(this.cells[curr_row][i], this.cells[num_pivots][i]) / -this.cells[curr_row][i]);
            this.cells[num_pivots] = this.multiply(this.cells[num_pivots], lcm(this.cells[curr_row][i], this.cells[num_pivots][i]) / this.cells[num_pivots][i]);
            this.cells[curr_row] = this.add(this.cells[num_pivots], this.cells[curr_row]);
          }
          curr_row += 1;
        }
        num_pivots += 1;
        this.cells = this.cells.map(row => this.simplifyRow(row));
      }
    }

    num_pivots = 0;
    for (let i = 0; i < this.numCols; i++) {
      let curr_row = num_pivots;
      while (curr_row < this.numRows && this.cells[curr_row][i] == 0) {
        curr_row += 1;
      }
      if (curr_row != this.numRows) {
        while (curr_row >= 0) {
          if (this.cells[curr_row] != null && this.cells[curr_row][i] != 0) {
            this.simplifyRow(this.cells[curr_row]);
            this.cells[curr_row] = this.multiply(this.cells[curr_row], lcm(this.cells[curr_row][i], this.cells[num_pivots][i]) / -this.cells[curr_row][i]);
            this.cells[num_pivots] = this.multiply(this.cells[num_pivots], lcm(this.cells[curr_row][i], this.cells[num_pivots][i]) / this.cells[num_pivots][i]);
            this.cells[curr_row] = this.add(this.cells[num_pivots], this.cells[curr_row]);
          }
          curr_row -= 1;
        }
        num_pivots += 1;
        this.cells = this.cells.map(row => this.simplifyRow(row));
      }
    }
    this.cells = this.cells.map(row => this.simplifyRow(row));
    return this.cells;
  }
}

let matrix1 = new Matrix(4, 4);
matrix1.set(0, 0, 1);
matrix1.set(0, 3, 1);
matrix1.set(1, 0, 2);
matrix1.set(2, 0, 3);
matrix1.set(2, 1, 1);
matrix1.set(1, 2, -2);
matrix1.set(2, 2, -1);
console.table(matrix1.cells);
console.table(matrix1.gaussJordanEliminate());
  
function balance_equation(string){
  let left = []; // list of compounds on the LHS
  let right = []; // list of compounds on the RHS
  let balanced = true;
  let output = "This equation can't be solved";

  if (string.split(/=>|=|→|➔|➜|➙/g).length != 2) return "SyntaxError in the yields sign";
  // breaks the equation into the lhs and the rhs
  const [lhs, rhs] = string
      .replace(/ /g,'')
      .split(/=>|=|→|➔|➜|➙/);

  // breaks the sides into compounds
  const split_regex = /(?<!\^\d|\^)\+/g;
  const left_components = lhs.split(split_regex);
  const right_components = rhs.split(split_regex);

  let chemicals = ["e"];

  let total_left = {e:0}; // element totals for the left side
  let total_right = {e:0}; // element totals for the right side

  // recursive algorithm to find elements from compounds
  const find_compound = function(component, multiplier, compound, total, chemicals) {
    const electron_regex = /\^[0-9]*[+-](?![^\(]*\))/;
    const element_regex = /\([A-Za-z0-9]*\)\d*|[A-Z][a-z]*[0-9]*(?=[\(A-Z]|$)/g;
    const subscript_regex = /\d*$|.*(?!\d*$)./g;
    const bracket_regex = /^\(|\)$/g;

    if (component == "e") {
      compound.e -= 1;
      total.e -= 1;
      return;
    }

    let electrons = component.match(electron_regex);
    if (electrons == null) electrons = [];
    for (let j = 0; j < electrons.length; j++) {
      let number = 1;
      if (/\d+/.test(electrons[j])) {
        [number] = electrons[j].match(/\d+/);
      }
      let [sign] = electrons[j].match(/[+-]/);
      compound.e += (sign == "+" ? +number : -number) * multiplier;
      total.e += (sign == "+" ? +number : -number) * multiplier;
    }

    component = component.replace(electron_regex, "");

    let parts = component.match(element_regex); // breaks the equation into parts with a main bit and the subscript
    for (let j = 0; j < parts.length; j++) {
      let [main, subscript] = parts[j].match(subscript_regex); // breaks the part into a main part and the subscript
      // checks if the equation needs to be broken further
      if (bracket_regex.test(main)) { 
        // recursion happens
        find_compound(main.replace(bracket_regex, ""), multiplier * (subscript ?+subscript : 1), compound, total, chemicals);
      }
      else {
        // sets the values into the data fields
        if (compound[main] == null) {
          compound[main] = 0;
        }
        compound[main] += multiplier * (subscript ? +subscript : 1)
        if (total[main] == null) {
          total[main] = 0;
        }
        total[main] += multiplier * (subscript ? +subscript : 1)
        if (!chemicals.includes(main)) chemicals.push(main); 
      }
    }
  }
  try {
    // gets data from the components on the lhs
    for (let i = 0; i < left_components.length; i++) {
      let compound = {e:0};
      find_compound(left_components[i], 1, compound, total_left, chemicals);
      left.push(compound);
    }

    // gets data from the components on the rhs
    for (let i = 0; i < right_components.length; i++) {
      let compound = {e:0};
      find_compound(right_components[i], 1, compound, total_right, chemicals);
      right.push(compound);
    }
  } catch (error) {
    console.log(error);
    return "SyntaxError in the compound";
  }

  const check_multiple_solutions = function(matrix) {
    let coefficients = matrix.numCols - 1;
    let number = 0;
    matrix.cells.forEach(row => {
      if (row.some(cell => cell != 0)) number ++;
    });
    if (number != coefficients) return true;
  }

  const get_coefficients = function(matrix) {
    let lowest = 1;
    matrix.cells.forEach(row => {
      for (let index = 0; index < row.length; index++) {
        const element = row[index];
        if (element != 0) {
          lowest = lcm(lowest, element);
          break;
        }
      };
    });
    matrix.cells.forEach((row, i) => {
      let index = 0;
      while (index < row.length) {
        const element = row[index];
        if (element != 0) {
          lowest = lcm(lowest, element);
          break;
        }
        index ++;
      }
      matrix.cells[i] = matrix.multiply(row, lowest/(row[index] ? row[index] : 1));
    });
    console.table(matrix.cells);
    return matrix.cells.map(row => row[matrix.numCols - 1])
  }

  // makes the output string from data
  const make_output = function(left, right, left_co, right_co) {
    const electron_regex = /\^[0-9]*[+-](?![^\(]*\))/g;
    // checks and records the gcd of the data
    let multi = findGCD([...left_co, ...right_co], [...left_co, ...right_co].length);

    let out = "";
    for (let i = 0; i < left.length; i++) {
      // makes the subscripts subscripts
      if (left[i] == "e") left[i] = "e<sup>-</sup>";

      left[i] = left[i].replace(/[0-9]+(?![+-])/g, number => number.sub());

      left[i] = left[i].replace(electron_regex, electron => {
        return "<sup>" + electron.slice(1) + "</sup>";
      })

      out += (left_co[i]/multi == 1 ? "" : left_co[i]/multi) + left[i];
      out += " + ";
    }
    out = out.slice(0, -3);
    out += " → "
    for (let i = 0; i < right.length; i++) {
      // makes the subscripts subscripts
      if (right[i] == "e") right[i] = "e<sup>-</sup>";

      right[i] = right[i].replace(/[0-9]+(?![+-])/g, number => number.sub());

      right[i] = right[i].replace(electron_regex, electron => {
        return "<sup>" + electron.slice(1) + "</sup>";
      })

      out += (right_co[i]/multi == 1 ? "" : right_co[i]/multi) + right[i];
      out += " + ";
    }
    out = out.slice(0, -3);
    return out;
  } 

    // checks if the equation can be solved, incomplete
    possible = true;
    for (const key in total_right) {
      if (total_left[key] == null) {
        possible = false
      }
    }
    for (const key in total_left) {
      if (total_right[key] == null) {
        possible = false
      }
    }
  
    if (!possible) return "All zero solution only";

  // create matrix columns
  let matrix = new Matrix(chemicals.length + 1, left.length + right.length + 1);
  for (let i = 0; i < chemicals.length; i++) {
    const element = chemicals[i];
    for (let j = 0; j < left.length; j++) {
      const compound = left[j];
      matrix.set(i+1, j, (compound[element] ? +compound[element] : 0));
    }
    for (let j = 0; j < right.length; j++) {
      const compound = right[j];
      matrix.set(i+1, j + left.length, (compound[element] ? -compound[element] : 0));
    }
  }
  matrix.set(0, 0, 1);
  matrix.set(0, matrix.numCols - 1, 1);
  console.table(matrix.cells);
  console.table(matrix.gaussJordanEliminate());
  if (check_multiple_solutions(matrix)) return "There is more than one solution";
  let coefficients = get_coefficients(matrix);

  // generates coefficients
  let left_coefficients = coefficients.slice(0, left.length);
  let right_coefficients = coefficients.slice(left.length, left.length + right.length);

  console.log(left_coefficients, right_coefficients);

  output = make_output(left_components, right_components, left_coefficients, right_coefficients);
  return output;
}

// this function runs when balance is clicked 
function balance_it(){
  const output_p = document.querySelector("#balanced_equation");
  const equation_field = document.querySelector("#equation") // the input field with the unbalanced equation
  output_p.innerHTML = balance_equation(equation_field.value);
  hideLoading(); // removes the loading screen since it is done
}

window.addEventListener("keydown", e => e.key == "Enter" ? balance_it() : null);

// the loading screen element
const loaderContainer = document.querySelector('.loader-container');

// displays the loading screen
const displayLoading = () => {
  loaderContainer.classList.remove('loader-container-hidden');
};

// removes the loading screen
const hideLoading = () => {
  loaderContainer.classList.add('loader-container-hidden');
};