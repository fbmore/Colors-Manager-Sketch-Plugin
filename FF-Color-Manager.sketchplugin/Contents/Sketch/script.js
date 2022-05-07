var onRun = function(context) {
  var sketch = require('sketch');
  var ui = require('sketch/ui');
  var doc = context.document;


  var	document = sketch.getSelectedDocument();

  var documentColors = sketch.getSelectedDocument().colors;

  // Detect Sketch Version to create colors or color vars
  var sketchversion = sketch.version.sketch;

  var layerStyles = document.sharedLayerStyles;
  var textStyles = document.sharedTextStyles;

  var layername = "";
  var stylename = "";
  var colorname;
  var colorindex;
  var layer;
  var textStyles;
  var result;

  var alertTitle = "Import, Export & Update Color Variables";
  var instructionalTextForInput = "👉 Paste CSS colors (name and value) below\nor enter HEX values:";
  var initialValue = getColorVarsAsCSSTokens()

  //// Get user input
  ui.getInputFromUser(
    alertTitle,
    {
      initialValue: initialValue,
      description: instructionalTextForInput,
      numberOfLines: 10
    },
    (err, value) => {
      if (err) {
        // most likely the user canceled the input
        return;
      } else {
        console.log(value);
        result = value;
      }
    }
  );


  var goodQuotes = result.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');

  result = goodQuotes;
  var array = result.split("\n")

  var customColorNameNotProvided = true;

  // Generate colors from selection
  for (c = 0; c < array.length; ++c){

    var colorNameAndValue = array[c].split(": ") || array[c];

    var colorName = colorNameAndValue[0];
    var colorValue = colorName


    if (colorNameAndValue[1] != undefined ){

      colorValue = colorNameAndValue[1].slice(0,7)

    } else {

      if (customColorNameNotProvided) {

        var instructionalTextForInput = "Each HEX value provided will be a step of the scale";

        var initialValue = "$primary-color-"



        //// Get user input
        ui.getInputFromUser(
          "Common name for the color scale?",
          {
            initialValue: initialValue,
            description: instructionalTextForInput,
            numberOfLines: 1
          },
          (err, value) => {
            if (err) {
              // most likely the user canceled the input
              return;
            } else {
              console.log(value);
              result2 = value;
            }
          }
        );

        // console.log("name");
        // console.log(result2);

        customColorNameNotProvided = false

      }

      if (result2 == ""){
        // no common name? then use HEX value as name
        colorName = + colorValue
      } else {
        // if common name is provided then add name + counter
        colorName = result2 + (c+1)
      }


    }




    var arrayColorAssetsValues = documentColors.map(ColorAsset => ColorAsset["color"]);
    var arrayColorAssetsNames = documentColors.map(ColorAsset => ColorAsset["name"]);
    var arrayColorNamesAndValues = documentColors.map(ColorAsset => [ColorAsset["name"], ColorAsset["color"]]);

    if (sketchversion >= 69) {
      var arrayColorVarNames = document.swatches.map(Swatch => Swatch["name"]);
      var arrayColorVarNamesAndValues = document.swatches.map(Swatch => [Swatch["name"], Swatch["color"]]);
    }

    colorname = colorName;
    color = colorValue;


    if (sketchversion >= 69) {
      const Swatch = sketch.Swatch
      var newSwatch = Swatch.from({ name: colorname, color: color })

      console.log(newSwatch)

      if (arrayColorVarNames.indexOf(colorname) === -1) {
        document.swatches.push(newSwatch)
      }
      else {
        console.log("already existing color var");
        var existingSwatch = document.swatches[arrayColorVarNames.indexOf(colorname)];  console.log(existingSwatch)
        console.log(existingSwatch.name)
        //existingSwatch.name = "New Color"
        console.log(existingSwatch.color)
        console.log(existingSwatch.referencingColor)

        /// UDPATES ALL PLACES WHERE COLOR VARS WERE USED :)
        document.swatches[arrayColorVarNames.indexOf(colorname)].sketchObject.updateWithColor(MSColor.colorWithHex_alpha(color.slice(0,7), 1))
        let swatchContainer = document.sketchObject.documentData().sharedSwatches()
        swatchContainer.updateReferencesToSwatch(existingSwatch.sketchObject)

      }
    }

    else {
      if (arrayColorAssetsNames.indexOf(colorname) === -1) {
        documentColors.push({type: 'ColorAsset', name: colorname, color: color});
      } else {
        console.log("already existing color");
      }

    }

  }



  if (sketchversion >= 69) {
    ui.message("🌈: Yay! You now have " + document.swatches.length + " color variables available! 👏 🚀");
  } else {
    ui.message("🌈: Yay! You now have " + documentColors.length + " colors available! 👏 🚀");
  }

  // getColorVarsAsCSSTokens()

  function getColorVarsAsCSSTokens() {
    ///// Color Vars to CSS

    var documentColors = sketch.getSelectedDocument().colors;
    var documentTextStyles = sketch.getSelectedDocument().sharedTextStyles


    // Detect Sketch Version to create colors or color vars
    var sketchversion = sketch.version.sketch;

    var layerStyles = document.sharedLayerStyles;
    var textStyles = document.sharedTextStyles;

    console.log("Generate colors from swatches")

    var layername = "";
    var stylename = "";
    var colorname;
    var colorindex;
    var layer;
    var textStyles;
    var CSSVars = "";
    var UIColorVars = "";
    var CSSTokens = "// Color Tokens";
    var CSSVarsExport = "";
    var CSSTokensExport = "// Color Tokens Export";
    var CSSToExport = "";

    var arrayColorVarNamesAndValues = document.swatches.map(Swatch => [Swatch["name"], Swatch["color"]]);
    //   console.log(arrayColorVarNamesAndValues)
    // Export colors from selection
    for (c = 0; c <  arrayColorVarNamesAndValues.length; ++c){
      //console.log(arrayColorVarNamesAndValues[c])
      CSSVars = CSSVars + arrayColorVarNamesAndValues[c][0].replace(/[ ]+/g, "-") + ": " + arrayColorVarNamesAndValues[c][1] + ";"+ "\n"
      UIColorVars = UIColorVars + "\nlet " + camelCaseNameFromToken(arrayColorVarNamesAndValues[c][0]).replace(/[ ]+/g, "")) + " = " + RgbAtoUIColor(hexToRgbA(arrayColorVarNamesAndValues[c][1].substring(0,7))) + ";"
      //let col1 = UIColor(red: 1, green: 0, blue: 0, alpha: 1)
    }



    CSSVarsExport = ""

    for (c = 0; c <  arrayColorVarNamesAndValues.length; ++c){
      CSSVarsExport = CSSVarsExport + camelCaseNameFromToken(arrayColorVarNamesAndValues[c][0]).replace(/[ ]+/g, "") + ": " + arrayColorVarNamesAndValues[c][0].replace(/[ ]+/g, "-") + ";\n"
    }

    // CSSVarsExport = "// Color Tokens" + CSSVars + "\n\n" + "// Export color tokens for use in Webpack.\n:export {\n" + CSSVarsExport + "}"
    CSSVarsExport = CSSVars.trim()


    console.log("CSSVarsExport")
    console.log(CSSVarsExport)

    return CSSVarsExport

  }

  ///// functions

  function camelCaseNameFromToken(string) {
    var subStrings = string.replace("$","").split("-")

    var camelCaseNameFromTokenName = subStrings[0]

    for (ss = 1; ss <  subStrings.length; ++ss){
      camelCaseNameFromTokenName = camelCaseNameFromTokenName + (subStrings[ss].charAt(0).toUpperCase() + subStrings[ss].slice(1))
    }

    // var camelCaseNameFromTokenName = initialCaps(subStrings)
    return camelCaseNameFromTokenName
  }


  function getCleanCSS(layer) {
    var cleanCSS = layer.sketchObject.CSSAttributes().toString().split('",').join().split('"').join("").replace(/,+/g, '').replace('(', '').replace(')', '')
    // var cleanCSS = layer.sketchObject.CSSAttributes().toString()
    return cleanCSS;
  }

  function hexToRgbA(hex){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c= hex.substring(1).split('');
      if(c.length== 3){
        c= [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c= '0x'+c.join('');
      return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',1)';
    }
    throw new Error('Bad Hex');
  }

  function RgbAtoUIColor(rgba){
    var c;
    rgba = rgba.replace("rgba(","").replace(")","")
    // if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
    c = rgba.split(',');
    if(c.length== 4){
      c= ["red: ",c[0]/255,", green: ",c[1]/255,", blue: ",c[2]/255,", alpha: ", c[3]];
      //UIColor(red: 1, green: 0, blue: 0, alpha: 1)
    }
    c= c.join('');
    return 'UIColor('+c+')';
    //}
    throw new Error('Bad RGBa');
  }


};
