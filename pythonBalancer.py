from random import randint
import math

class Equation:
  """
  A Chemistry Equation
  
  """

  def __init__(self, equation):
    """
    Initializes the chemistry equation
    
    @type of equation: str

    format is '(Al)2(O)3 + (Fe) = (Fe)3(O)4 + (Al)'
    """
    self.left = list() # List of the compounds on the lhs
    self.right = list() # List of the compounds on the rhs
    self.balanced = True

    # Breaks equation into lhs and rhs (do with regex in JS version)
    integers = "0123456789"
    split = equation.split(" = ")
    left = split[0]
    right = split[1]
    left_components = left.split(" + ")
    right_components = right.split(" + ")
    total_left = dict()
    total_right = dict()

    # Breaks the lhs into elements (do with regex in JS version)
    for component in left_components:
      left_counts = dict()

      # finds the index of the end of the element name
      for ind in range(0, len(component)):
        if component[ind] == ")":

          # gets the name of the element
          if component[ind - 2] == "(":
            element = component[ind-1]
          elif component[ind - 3] == "(":
            element = component[ind-2:ind:]

          # gets the amount of the element
          if len(component) >= ind + 4 and component[ind+3] in integers:
            number = int(component[ind + 1: ind + 4:])
          elif len(component) >= ind + 3 and component[ind+2] in integers:
            number = int(component[ind + 1: ind + 3:])
          elif len(component) >= ind + 2 and component[ind+1] in integers:
            number = int(component[ind + 1: ind + 2:])
          else:
            number = 1

          # adds the data to a element by element tally
          if element in left_counts:
            left_counts[element] += number
          else:
            left_counts[element] = number 

          # adds the data to the total for one side of the equation
          if element in total_left:
            total_left[element] += number
          else:
            total_left[element] = number 
      self.left.append(left_counts)

    # Breaks the rhs into elements (do with regex in JS version)
    for component in right_components:
      right_counts = dict()

      # finds the index of the end of the element name
      for ind in range(0, len(component)):
        if component[ind] == ")":

          # gets the name of the element
          if component[ind - 2] == "(":
            element = component[ind-1]
          elif component[ind - 3] == "(":
            element = component[ind-2:ind:]
  
          # gets the amount of the element
          if len(component) >= ind + 4 and component[ind+3] in integers:
            number = int(component[ind + 1: ind + 4:])
          elif len(component) >= ind + 3 and component[ind+2] in integers:
            number = int(component[ind + 1: ind + 3:])
          elif len(component) >= ind + 2 and component[ind+1] in integers:
            number = int(component[ind + 1: ind + 2:])
          else:
            number = 1

          # adds the data to a element by element tally
          if element in right_counts:
            right_counts[element] += number
          else:
            right_counts[element] = number 

          # adds the data to the total for one side of the equation
          if element in total_right:
            total_right[element] += number
          else:
            total_right[element] = number 
      self.right.append(right_counts)
    
    # Checks if the equation is balanced 
    for key in total_right:
      if total_left[key] != total_right[key]:
        self.balanced = False
      else:
        continue

  def balance(self):
    """
    Balances the chemical equation
    """

    # Check if the equation is already solved
    if self.balanced:
      string = str()
      for dictionary in self.left:
        compound = str()
        for key in dictionary:
          compound += key
          if dictionary[key] != 1:
            compound += str(dictionary[key])
        string += compound
        string += " + "
      string = string[:-3:] + " = "
      for dictionary in self.right:
        compound = str()
        for key in dictionary:
          compound += key
          if dictionary[key] != 1:
            compound += str(dictionary[key])
        string += compound
        string += " + "
      string = string[:-3:]
      return(string)
    else:
      tries = 0
      while not self.balanced:
        tries += 1
        temp_left = list()
        temp_right = list()
        total_left = dict()
        total_right = dict()

        # Copies self.left and self.right to temp_left and temp_right
        for item in self.left:
          new_dict = dict()
          for key in item:
            new_dict[key] = item[key]
          temp_left.append(new_dict)
        for item in self.right:
          new_dict = dict()
          for key in item:
            new_dict[key] = item[key]
          temp_right.append(new_dict)

        # generate random coefficients
        upper = (2  + math.floor(tries ** (1 / (len(temp_left) + len(temp_right) + 0.5))))
        left_coefficients = [randint(1, upper) for num in range(len(temp_left))]
        right_coefficients = [randint(1, upper) for num in range(len(temp_right))]
        
        for index in range(len(left_coefficients)):
          for key in temp_left[index]:
            temp_left[index][key] *= left_coefficients[index]
            if key in total_left:
              total_left[key] += temp_left[index][key]
            else:
              total_left[key] = temp_left[index][key]

        for index in range(len(right_coefficients)):
          for key in temp_right[index]:
            temp_right[index][key] *= right_coefficients[index]
            if key in total_right:
              total_right[key] += temp_right[index][key]
            else:
              total_right[key] = temp_right[index][key]

        # Checks if the equation is balanced 
        self.balanced = True
        for key in total_right:
          if total_left[key] != total_right[key]:
            self.balanced = False

        # finds the gcd for the coefficients
        gcd = math.gcd(*left_coefficients, *right_coefficients)

        if self.balanced == True:
          string = str()
          for index, dictionary in enumerate(self.left):
            compound = str()
            if left_coefficients[index] != 1:
              compound += str(int(left_coefficients[index] / gcd))
            for key in dictionary:
              compound += key
              if dictionary[key] != 1:
                compound += str(dictionary[key])
            string += compound
            string += " + "
          string = string[:-3:] + " = "
          for index, dictionary in enumerate(self.right):
            compound = str()
            if right_coefficients[index] != 1:
              compound += str(int(right_coefficients[index] / gcd))
            for key in dictionary:
              compound += key
              if dictionary[key] != 1:
                compound += str(dictionary[key])
            string += compound
            string += " + "
          string = string[:-3:]
          return(string)

        

water = Equation(input("Enter the equation you want to solve... "))
print(water.balance())


