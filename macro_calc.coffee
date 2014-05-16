class MacroCalculator
  constructor: (@weight, @lifestyle, @fat_per_pound = 0.5)->
    @target_calories = @weight * @multiplier[@lifestyle-1]

  multiplier: [11,12,13,14]

  protein: -> @weight

  fat: -> @weight*@fat_per_pound

  carbohydrate: ->
    protein_cals = @protein()*4
    fat_cals = @fat()*9
    (@target_calories - (protein_cals + fat_cals)) / 4

  results: ->
    daily_calories: @target_calories
    protein: @protein()
    fat: @fat()
    carbohydrate: @carbohydrate()

#
# Init
#

class Widget
  constructor: (id)->
    console.log 'in'
    return false if !(@el = d.getElementById(id)) 
    console.log @el


#
# Init
#

window.macro_calc = new Widget('macro-calc')
