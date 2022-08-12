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

function balance_equation(string){
  left = []; // list of compounds on the LHS
  right = []; // list of compounds on the RHS
  balanced = true;
  output = "This equation can't be solved";

  if (string.split(/=>|=|→|➔|➜|➙/g).length != 2) return "SyntaxError in the yields sign";
  // breaks the equation into the lhs and the rhs
  const [lhs, rhs] = string
      .replace(/ /g,'')
      .split(/=>|=|→|➔|➜|➙/);

  // breaks the sides into compounds
  const split_regex = /(?<!\^\d|\^)\+/g;
  const left_components = lhs.split(split_regex);
  const right_components = rhs.split(split_regex);

  let total_left = {e:0}; // element totals for the left side
  let total_right = {e:0}; // element totals for the right side

  // recursive algorithm to find elements from compounds
  const find_compound = function(component, multiplier, compound, total) {
    const electron_regex = /\^[0-9]*[+-](?![^\(]*\))/;
    const element_regex = /\([A-Za-z0-9]*\)\d*|[A-Z][a-z]*[0-9]*(?=[\(A-Z]|$)/g;
    const subscript_regex = /\d*$|.*(?!\d*$)./g;
    const bracket_regex = /^\(|\)$/g;

    if (component === "e") {
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
      compound.e += (sign == "=" ? +number : -number) * multiplier;
      total.e += (sign == "=" ? +number : -number) * multiplier;
    }

    component = component.replace(electron_regex, "");

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
  try {
    // gets data from the components on the lhs
    for (let i = 0; i < left_components.length; i++) {
      let compound = {e:0};
      find_compound(left_components[i], 1, compound, total_left);
      left.push(compound);
    }

    // gets data from the components on the rhs
    for (let i = 0; i < right_components.length; i++) {
      let compound = {e:0};
      find_compound(right_components[i], 1, compound, total_right);
      right.push(compound);
    }
  } catch (error) {
    console.log(error);
    return "SyntaxError in the compound";
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
      out += " → ";
    }
    out = out.slice(0, -3);
    out += " ➜ "
    for (let i = 0; i < right.length; i++) {
      // makes the subscripts subscripts
      if (right[i] == "e") right[i] = "e<sup>-</sup>";

      right[i] = right[i]
          .split("")
          .map(char => (char >= '0' && char <= '9' ? char.sub() : char))
          .join("");

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

  // checks if the equation is balanced 
  for (const key in total_right) {
    if (total_left[key] != total_right[key]) {
      balanced = false
    }
  }

  // generates initial coefficients
  let left_coefficients = Array.from({length: left.length}, _ => 1);
  let right_coefficients = Array.from({length: right.length}, _ => 1);

  let tries = 0;
  while (balanced == false && possible) {
    tries += 1;
    let temp_left = [];
    let temp_right = [];
    let temp_total_left = {};
    let temp_total_right = {};

    // copies left and right to temp_left and temp_right
    for (let i= 0; i < left.length; i++) {
      let new_dict = {};
      for (const key in left[i]) {
        new_dict[key] = left[i][key];
      }
      temp_left.push(new_dict);
    }
    for (let i= 0; i < right.length; i++) {
      let new_dict = {};
      for (const key in right[i]) {
        new_dict[key] = right[i][key];
      }
      temp_right.push(new_dict);
    }

    // generates random coefficients 
    const upper = (2 + (tries ** (1 / (temp_left.length + temp_right.length + 1))));
    left_coefficients = Array.from({length: left.length}, _ => randint(1, upper));
    right_coefficients = Array.from({length: right.length}, _ => randint(1, upper));

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
    balanced = true;
    for (const key in temp_total_right) {
      if (temp_total_left[key] != temp_total_right[key]) {
        balanced = false
      }
    }
  }

  // makes the output string from data if it is balanced
  if (balanced && possible) output = make_output(left_components, right_components, left_coefficients, right_coefficients);
  return output;
}

// this function runs when balance is clicked 
function balance_it(){
  const output_p = document.querySelector("#balanced_equation");
  const equation_field = document.querySelector("#equation") // the input field with the unbalanced equation
  output_p.textContent = "The Equation Isn't Valid";
  output_p.innerHTML = balance_equation(equation_field.value);
  hideLoading(); // removes the loading screen since it is done
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