from random import randint
from math import gcd
from functools import reduce

class Equation:
  """
  A Chemistry Equation
  
  """

  def __init__(self, equation):
    """
    Initializes the chemistry equation
    
    @type of equation: str
    """
    self.left = list()
    self.right = list()
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
      for ind in range(0, len(component)):
        if component[ind] == ")":
          if component[ind - 2] == "(":
            element = component[ind-1]
          elif component[ind - 3] == "(":
            element = component[ind-2:ind:]

          if len(component) <= ind + 4 and component[ind+3] in integers:
            number = int(component[ind + 1: ind + 4:])
          elif len(component) <= ind + 3 and component[ind+2] in integers:
            number = int(component[ind + 1: ind + 3:])
          elif len(component) <= ind + 2 and component[ind+1] in integers:
            number = int(component[ind + 1: ind + 2:])

          if element in left_counts:
            left_counts[element] += number
          else:
            left_counts[element] += number 
          if element in total_left:
            total_left[element] += number
          else:
            total_left[element] += number 
      self.left.append(left_counts)

    # Breaks the rhs into elements (do with regex in JS version)
    for component in right_components:
      right_counts = dict()
      for ind in range(0, len(component)):
        if component[ind] == ")":
          # gets the name of the element
          if component[ind - 2] == "(":
            element = component[ind-1]
          elif component[ind - 3] == "(":
            element = component[ind-2:ind:]

          # gets the amount of the element
          if len(component) <= ind + 4 and component[ind+3] in integers:
            number = int(component[ind + 1: ind + 4:])
          elif len(component) <= ind + 3 and component[ind+2] in integers:
            number = int(component[ind + 1: ind + 3:])
          elif len(component) <= ind + 2 and component[ind+1] in integers:
            number = int(component[ind + 1: ind + 2:])

          # adds the data to a element by element tally
          if element in right_counts:
            right_counts[element] += number
          else:
            right_counts[element] += number 

          # adds the data to the total for one side of the equation
          if element in total_right:
            total_right[element] += number
          else:
            total_right[element] += number 
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

