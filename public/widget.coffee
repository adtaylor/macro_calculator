((w,d,u)->
  class MacroCalculator
    constructor: (@weight, @lifestyle, @fat_per_pound = 0.5)->

    target_calories: ->
      @weight * @multiplier[@lifestyle-1]

    multiplier: [11,12,13,14]

    @lifestyle_options:
      1: "Sedentary"
      2: "Mildly Active"
      3: "Active"
      4: "Very Active"

    protein: -> @weight

    fat: -> @weight*@fat_per_pound

    carbohydrate: ->
      protein_cals = @protein()*4
      fat_cals = @fat()*9
      (@target_calories() - (protein_cals + fat_cals)) / 4

    results: ->
      daily_calories: @target_calories()
      protein: @protein()
      fat: @fat()
      carbohydrate: @carbohydrate()

  #
  # HTML
  #

  class HTMLBuilder
    constructor: (@elements, @id)->

    create: (name)->
      return false if not (data = @elements[name])
      switch data.type
        when 'styles' then @buildStyles(data, name)
        when 'select' then @buildSelect(data, name)
        else @buildElement(data, name)

    buildStyles: (data)->
      css = ""
      css += "##{@id} #{key} {#{val}}"  for key, val of data.attr
      head = d.head || d.getElementsByTagName('head')[0]
      style = d.createElement('style')
      style.type = 'text/css'
      if style.styleSheet
        style.styleSheet.cssText = css
      else
        style.appendChild(document.createTextNode(css))
      head.appendChild(style)

    buildElement: (data, name)->
      te = d.createElement data.type
      te.setAttribute('for', 'macro_weight')
      te.innerHTML = data.innerHTML if data.innerHTML?
      te.setAttribute(key,value) for key, value of data.attr
      te.setAttribute('id', name)
      te

    buildSelect: (data, name)->
      selectList = @buildElement(data)
      selectList.setAttribute(key,value) for key, value of data.attr
      selectList.setAttribute('id', name)
      for val, text of MacroCalculator.lifestyle_options
        option = document.createElement("option")
        option.value = val
        option.text = text
        selectList.appendChild(option)
      selectList

    addEvent: (html_element, event_name, event_function) ->
      if html_element.addEventListener # Modern
        html_element.addEventListener event_name, event_function, false
      else if html_element.attachEvent # Internet Explorer
        html_element.attachEvent "on" + event_name, event_function
      else # others
        html_element["on" + event_name] = event_function


  #
  # Widget
  #

  class Widget
    constructor: (id, @builder)->
      return false if !(@el = d.getElementById(id)) 
      @calulator = new MacroCalculator(0, 1)
      @builder.create 'styles'
      @buildForm()
      @buildResults()

    weightChange: (e)->
      @calulator.weight = e.target.value
      @updatesResults @calulator.results()

    lifestyleChange: (e)->
      @calulator.lifestyle = e.target.value
      @updatesResults @calulator.results()

    buildResults: ->
      results = @builder.create 'macro_results'

      @cals = @builder.create 'macro_daily_calories'
      results.appendChild @cals
      @protein = @builder.create 'macro_protein'
      results.appendChild @protein
      @fat = @builder.create 'macro_fat'
      results.appendChild @fat
      @carbs = @builder.create 'macro_carbs'
      results.appendChild @carbs

      @el.appendChild results

    updatesResults: (data)->
      @cals.innerHTML = "Calories: #{data.daily_calories}"
      @protein.innerHTML = "Protein: #{data.protein}g"
      @fat.innerHTML = "Fat: #{data.fat}g"
      @carbs.innerHTML = "Carbohydrate : #{data.carbohydrate}g"

    buildForm: ->
      form = @builder.create 'macro_form'
      row1 = @builder.create 'macro_row1'
      row2 = @builder.create 'macro_row2'
      row1.appendChild @builder.create('macro_weight_label')
      row1.appendChild (wi = @builder.create 'macro_weight_input')
      @builder.addEvent wi, 'keyup', @weightChange.bind(@)

      # Lifestyle
      #

      row2.appendChild @builder.create('macro_lifestyle_label')
      row2.appendChild (selectList = @builder.create('macro_lifestyle_select'))
      @builder.addEvent selectList, 'change', @lifestyleChange.bind(@)
      row2.appendChild selectList

      form.appendChild row1
      form.appendChild row2
      @el.appendChild form

  #
  # Init
  #
  
  elementsStructure =
    styles:
      type: 'styles'
      attr:
        "": "overflow: hidden; font-family: 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight: 300; font-size: 14px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"
        "p": "margin: 0 0 10px; overflow: hidden; font-family: 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight: 300;"
        "label": "display: block; margin: 0 0 10px;font-weight: bold;"
        "input": "width: 100%; margin: 0 0 10px; overflow: hidden; font-family: 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight: 300;"
        "select": "width: 100%;"
        "#macro_form": "float: left; width: 45%; padding-right: 4%; border-right: 1px solid #eee;"
        "#macro_results": "float: left;width: 45%;padding-left: 5%;"
    macro_form:
      type: 'div'
    macro_row1:
      type: 'div'
    macro_row2:
      type: 'div'
    macro_weight_label:
      type: "label"
      innerHTML: "Weight:"
      attr:
        for: 'macro_weight_input'
    macro_weight_input:
      type: "input"
      attr:
        id: 'macro_weight'
        name: 'macro_weight'
        type: 'text'
        value: '0'
    macro_lifestyle_label:
      type: "label"
      innerHTML: "Lifestyle:"
      attr:
        for: 'macro_lifestyle_select'
    macro_lifestyle_select:
      type: "select"
      attr:
        id: 'macro_lifestyle'
      options: MacroCalculator.lifestyle_options
    macro_results:
      type: 'div'
    macro_daily_calories:
      type: "p"
      innerHTML: "Calories:"
    macro_protein:
      type: "p"
      innerHTML: "Protein:"
    macro_fat:
      type: "p"
      innerHTML: "Fat:"
    macro_carbs:
      type: "p"
      innerHTML: "Carbohydrate:"


  builder = new HTMLBuilder elementsStructure, 'macro-calc'
  w.macro_calc = new Widget('macro-calc', builder)

)(window,document, undefined)
