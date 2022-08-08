// random integer between two values inclusive
function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// the gcd of two numbers
function gcd(a, b) {
  if (a == 0)
    return b;
  return gcd(b % a, a);
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

function Equation(string){
  this.left = []; // list of compounds on the LHS
  this.right = []; // list of compounds on the RHS
  this.balanced = true;
  this.output = "This equation can't be solved";

  // breaks the equation into the lhs and the rhs
  const [lhs, rhs] = string
      .replace(/ /g,'')
      .split(/=>|=|→|➔|➜|➙/);

  // breaks the sides into compounds
  const left_components = lhs.split("+");
  const right_components = rhs.split("+");

  let total_left = {}; // element totals for the left side
  let total_right = {}; // element totals for the right side

  // recursive algorithm to find elements from compounds
  const find_compound = function(component, multiplier, compound, total) {
    const element_regex = /\([A-Za-z0-9]*\)\d*|[A-Z][a-z]*[0-9]*(?=[\(A-Z]|$)/g;
    const subscript_regex = /\d*$|.*(?!\d*$)./g;
    const bracket_regex = /^\(|\)$/g;

    let parts = component.match(element_regex); // breaks the equation into parts with a main bit and the subscript
    for (let j = 0; j < parts.length; j++) {
      let [main, subscript] = parts[j].match(subscript_regex); // breaks the part into a main part and the subscript
      // checks if the equation needs to be broken further
      if (bracket_regex.test(main)) { 
        // recursion happens
        find_compound(main.replace(bracket_regex, ""), multiplier * (subscript ?+subscript : 1), compound, total);
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
      }
    }
  }

  // makes the output string from data
  const make_output = function(left, right, left_co, right_co) {
    // checks and records the gcd of the data
    let multi = findGCD([...left_co, ...right_co], [...left_co, ...right_co].length);

    let out = "";
    for (let i = 0; i < left.length; i++) {
      // makes the subscripts subscripts
      left[i] = left[i]
          .split("")
          .map(char => (char >= '0' && char <= '9' ? char.sub() : char))
          .join("");
      out += (left_co[i]/multi == 1 ? "" : left_co[i]/multi) + left[i];
      out += " + ";
    }
    out = out.slice(0, -3);
    out += " = "
    for (let i = 0; i < right.length; i++) {
      // makes the subscripts subscripts
      right[i] = right[i]
          .split("")
          .map(char => (char >= '0' && char <= '9' ? char.sub() : char))
          .join("");
      out += (right_co[i]/multi == 1 ? "" : right_co[i]/multi) + right[i];
      out += " + ";
    }
    out = out.slice(0, -3);
    return out;
  } 

  // gets data from the components on the lhs
  for (let i = 0; i < left_components.length; i++) {
    let compound = {};
    find_compound(left_components[i], 1, compound, total_left);
    this.left.push(compound);
  }

  // gets data from the components on the rhs
  for (let i = 0; i < right_components.length; i++) {
    let compound = {};
    find_compound(right_components[i], 1, compound, total_right);
    this.right.push(compound);
  }

  // checks if the equation can be solved, incomplete
  this.possible = true;
  for (const key in total_right) {
    if (total_left[key] == null) {
      this.possible = false
    }
  }
  for (const key in total_left) {
    if (total_right[key] == null) {
      this.possible = false
    }
  }

  // checks if the equation is balanced 
  for (const key in total_right) {
    if (total_left[key] != total_right[key]) {
      this.balanced = false
    }
  }

  // generates initial coefficients
  let left_coefficients = Array.from({length: this.left.length}, _ => 1);
  let right_coefficients = Array.from({length: this.right.length}, _ => 1);

  let tries = 0;
  while (this.balanced == false && this.possible) {
    tries += 1;
    let temp_left = [];
    let temp_right = [];
    let temp_total_left = {};
    let temp_total_right = {};

    // copies this.left and this.right to temp_left and temp_right
    for (let i= 0; i < this.left.length; i++) {
      let new_dict = {};
      for (const key in this.left[i]) {
        new_dict[key] = this.left[i][key];
      }
      temp_left.push(new_dict);
    }
    for (let i= 0; i < this.right.length; i++) {
      let new_dict = {};
      for (const key in this.right[i]) {
        new_dict[key] = this.right[i][key];
      }
      temp_right.push(new_dict);
    }

    // generates random coefficients 
    const upper = (2 + (tries ** (1 / (temp_left.length + temp_right.length + 1))));
    left_coefficients = Array.from({length: this.left.length}, _ => randint(1, upper));
    right_coefficients = Array.from({length: this.right.length}, _ => randint(1, upper));

    // works out the total given the coefficients
    for (let i = 0; i < left_coefficients.length; i++) {
      for (const key in temp_left[i]) {
        temp_left[i][key] *= left_coefficients[i];
        if (temp_total_left[key] != null) {
          temp_total_left[key] += temp_left[i][key];
        }
        else {
          temp_total_left[key] = temp_left[i][key];
        }
      }
    }

    for (let i = 0; i < right_coefficients.length; i++) {
      for (const key in temp_right[i]) {
        temp_right[i][key] *= right_coefficients[i];
        if (temp_total_right[key] != null) {
          temp_total_right[key] += temp_right[i][key];
        }
        else {
          temp_total_right[key] = temp_right[i][key];
        }
      }
    }

    // checks if the equation is balanced
    this.balanced = true;
    for (const key in temp_total_right) {
      if (temp_total_left[key] != temp_total_right[key]) {
        this.balanced = false
      }
    }
  }

  // makes the output string from data if it is balanced
  if (this.balanced && this.possible) this.output = make_output(left_components, right_components, left_coefficients, right_coefficients);
  hideLoading(); // removes the loading screen since it is done
}

// this function runs when balance is clicked 
function balance_equation(){
  const output_p = document.querySelector("#balanced_equation");
  const equation_field = document.querySelector("#equation") // the input field with the unbalanced equation
  output_p.textContent = "The Equation Isn't Valid";
  output_p.innerHTML = new Equation(equation_field.value).output;
}

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