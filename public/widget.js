(function(w, d, u) {
  var HTMLBuilder, MacroCalculator, Widget, builder, elementsStructure;
  MacroCalculator = (function() {
    function MacroCalculator(weight, lifestyle, fat_per_pound) {
      this.weight = weight;
      this.lifestyle = lifestyle;
      this.fat_per_pound = fat_per_pound != null ? fat_per_pound : 0.5;
    }

    MacroCalculator.prototype.target_calories = function() {
      return this.weight * this.multiplier[this.lifestyle - 1];
    };

    MacroCalculator.prototype.multiplier = [11, 12, 13, 14];

    MacroCalculator.lifestyle_options = {
      1: "Sedentary",
      2: "Mildly Active",
      3: "Active",
      4: "Very Active"
    };

    MacroCalculator.prototype.protein = function() {
      return this.weight;
    };

    MacroCalculator.prototype.fat = function() {
      return this.weight * this.fat_per_pound;
    };

    MacroCalculator.prototype.carbohydrate = function() {
      var fat_cals, protein_cals;
      protein_cals = this.protein() * 4;
      fat_cals = this.fat() * 9;
      return (this.target_calories() - (protein_cals + fat_cals)) / 4;
    };

    MacroCalculator.prototype.results = function() {
      return {
        daily_calories: this.target_calories(),
        protein: this.protein(),
        fat: this.fat(),
        carbohydrate: this.carbohydrate()
      };
    };

    return MacroCalculator;

  })();
  HTMLBuilder = (function() {
    function HTMLBuilder(elements, id) {
      this.elements = elements;
      this.id = id;
    }

    HTMLBuilder.prototype.create = function(name) {
      var data;
      if (!(data = this.elements[name])) {
        return false;
      }
      switch (data.type) {
        case 'styles':
          return this.buildStyles(data, name);
        case 'select':
          return this.buildSelect(data, name);
        default:
          return this.buildElement(data, name);
      }
    };

    HTMLBuilder.prototype.buildStyles = function(data) {
      var css, head, key, style, val, _ref;
      css = "";
      _ref = data.attr;
      for (key in _ref) {
        val = _ref[key];
        css += "#" + this.id + " " + key + " {" + val + "}";
      }
      head = d.head || d.getElementsByTagName('head')[0];
      style = d.createElement('style');
      style.type = 'text/css';
      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
      return head.appendChild(style);
    };

    HTMLBuilder.prototype.buildElement = function(data, name) {
      var key, te, value, _ref;
      te = d.createElement(data.type);
      te.setAttribute('for', 'macro_weight');
      if (data.innerHTML != null) {
        te.innerHTML = data.innerHTML;
      }
      _ref = data.attr;
      for (key in _ref) {
        value = _ref[key];
        te.setAttribute(key, value);
      }
      te.setAttribute('id', name);
      return te;
    };

    HTMLBuilder.prototype.buildSelect = function(data, name) {
      var key, option, selectList, text, val, value, _ref, _ref1;
      selectList = this.buildElement(data);
      _ref = data.attr;
      for (key in _ref) {
        value = _ref[key];
        selectList.setAttribute(key, value);
      }
      selectList.setAttribute('id', name);
      _ref1 = MacroCalculator.lifestyle_options;
      for (val in _ref1) {
        text = _ref1[val];
        option = document.createElement("option");
        option.value = val;
        option.text = text;
        selectList.appendChild(option);
      }
      return selectList;
    };

    HTMLBuilder.prototype.addEvent = function(html_element, event_name, event_function) {
      if (html_element.addEventListener) {
        return html_element.addEventListener(event_name, event_function, false);
      } else if (html_element.attachEvent) {
        return html_element.attachEvent("on" + event_name, event_function);
      } else {
        return html_element["on" + event_name] = event_function;
      }
    };

    return HTMLBuilder;

  })();
  Widget = (function() {
    function Widget(id, builder) {
      this.builder = builder;
      if (!(this.el = d.getElementById(id))) {
        return false;
      }
      this.calulator = new MacroCalculator(0, 1);
      this.builder.create('styles');
      this.buildForm();
      this.buildResults();
    }

    Widget.prototype.weightChange = function(e) {
      this.calulator.weight = e.target.value;
      return this.updatesResults(this.calulator.results());
    };

    Widget.prototype.lifestyleChange = function(e) {
      this.calulator.lifestyle = e.target.value;
      return this.updatesResults(this.calulator.results());
    };

    Widget.prototype.buildResults = function() {
      var results;
      results = this.builder.create('macro_results');
      this.cals = this.builder.create('macro_daily_calories');
      results.appendChild(this.cals);
      this.protein = this.builder.create('macro_protein');
      results.appendChild(this.protein);
      this.fat = this.builder.create('macro_fat');
      results.appendChild(this.fat);
      this.carbs = this.builder.create('macro_carbs');
      results.appendChild(this.carbs);
      return this.el.appendChild(results);
    };

    Widget.prototype.updatesResults = function(data) {
      this.cals.innerHTML = "Calories: " + data.daily_calories;
      this.protein.innerHTML = "Protein: " + data.protein + "g";
      this.fat.innerHTML = "Fat: " + data.fat + "g";
      return this.carbs.innerHTML = "Carbohydrate : " + data.carbohydrate + "g";
    };

    Widget.prototype.buildForm = function() {
      var form, row1, row2, selectList, wi;
      form = this.builder.create('macro_form');
      row1 = this.builder.create('macro_row1');
      row2 = this.builder.create('macro_row2');
      row1.appendChild(this.builder.create('macro_weight_label'));
      row1.appendChild((wi = this.builder.create('macro_weight_input')));
      this.builder.addEvent(wi, 'keyup', this.weightChange.bind(this));
      row2.appendChild(this.builder.create('macro_lifestyle_label'));
      row2.appendChild((selectList = this.builder.create('macro_lifestyle_select')));
      this.builder.addEvent(selectList, 'change', this.lifestyleChange.bind(this));
      row2.appendChild(selectList);
      form.appendChild(row1);
      form.appendChild(row2);
      return this.el.appendChild(form);
    };

    return Widget;

  })();
  elementsStructure = {
    styles: {
      type: 'styles',
      attr: {
        "": "overflow: hidden; font-family: 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight: 300; font-size: 14px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;",
        "p": "margin: 0 0 10px; overflow: hidden; font-family: 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight: 300;",
        "label": "display: block; margin: 0 0 10px;font-weight: bold;",
        "input": "width: 100%; margin: 0 0 10px; overflow: hidden; font-family: 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight: 300;",
        "select": "width: 100%;",
        "#macro_form": "float: left; width: 45%; padding-right: 4%; border-right: 1px solid #eee;",
        "#macro_results": "float: left;width: 45%;padding-left: 5%;"
      }
    },
    macro_form: {
      type: 'div'
    },
    macro_row1: {
      type: 'div'
    },
    macro_row2: {
      type: 'div'
    },
    macro_weight_label: {
      type: "label",
      innerHTML: "Weight:",
      attr: {
        "for": 'macro_weight_input'
      }
    },
    macro_weight_input: {
      type: "input",
      attr: {
        id: 'macro_weight',
        name: 'macro_weight',
        type: 'text',
        value: '0'
      }
    },
    macro_lifestyle_label: {
      type: "label",
      innerHTML: "Lifestyle:",
      attr: {
        "for": 'macro_lifestyle_select'
      }
    },
    macro_lifestyle_select: {
      type: "select",
      attr: {
        id: 'macro_lifestyle'
      },
      options: MacroCalculator.lifestyle_options
    },
    macro_results: {
      type: 'div'
    },
    macro_daily_calories: {
      type: "p",
      innerHTML: "Calories:"
    },
    macro_protein: {
      type: "p",
      innerHTML: "Protein:"
    },
    macro_fat: {
      type: "p",
      innerHTML: "Fat:"
    },
    macro_carbs: {
      type: "p",
      innerHTML: "Carbohydrate:"
    }
  };
  builder = new HTMLBuilder(elementsStructure, 'macro-calc');
  return w.macro_calc = new Widget('macro-calc', builder);
})(window, document, void 0);
