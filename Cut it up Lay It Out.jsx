/* Divide it up, lay it out*/

app.beginUndoGroup("diulio");

//Holds the cuurent comp to put supComps in
var comp = app.project.activeItem;

//total number of horz comps
var totalNewCompsHorz;

//total number of vert comps
var totalNewCompsVert;

//Name of sub comps
var newCompsName;

//find the width of the new comps
var newCompsWidth

//find the height of the comps
var newCompsHeight

//name of comp to include into the new comps
var compToIncludeName;

//Hold the instance of the included comp
var subComp = null;

//Hold the instance of the created comp
var newComp;

//hold the name of the new comp
var newCompName;

//hold the duration of the new comp
var newCompDuration;

//hold  the value for the pixel ratio (aspect ratio)
var newCompPR;

//hold the value for the new comp frames per second (FPS)
var newCompFPS;

//holds total comps to be created
var totalNewComps;

//track new comp positions
var newCompXpos = 0;
var newCompYPos = 0;

//count the number of new comps
var newCompXCount = 0;
var newCompYCount = 0;

//holds all the comps in the project - used in the menu to allow user to pick the comp to be included in the new comps
var compArray = [];

//holds the custom expresions for the anchor point
var anchorPointExpresionText = null;

//holds the custom expresions for the position
var posExpresionText = null;

//holds the custom expresions for the scale
var scaleExpresionText = null;

//holds the custom expresions for the rotation
var rotationExpresionText = null;

//holds the custom expresions for the opacity
var opacityExpresionText = null;

//holds the boolean to make layers 3d
var make3dLayer;

//holds the boolean to turn on layers motion blur
var motionBlurLayer;

//holds the boolean to create the control layer
var createControlLayer;

//create a parent null for all the new comps
var createParentNull;

//holds the error messages
var errorMessage = "";

//used to position comps
var insideCompX;
var insideCompY;

//hold reference to the created comps - used to reference comps when adding a control layer
var createdComps = [];

//holds the reference to the folder that holds the created comps
var compFolder;

//Holds the boolean to make initial keys
var initialKey;

//holds the default error message
var defaultErrorMessage = "There are errors that need fixed: \n";

//Check that a comp is selected
if (comp instanceof CompItem) {
    
    //find the comp to include in the new comps
    for (var findItem = 1; findItem <= app.project.numItems; findItem++) {

        if ((app.project.item(findItem) instanceof CompItem)) {

            compArray.push(app.project.item(findItem).name);

        }

    }
    
    //create the menu window
    var myWindow = new Window("dialog", "Cut it up, lay it out", undefined, {
        closeButton: true
    });

    //create the holder for the tabs
    var myTab = myWindow.add("tabbedpanel", undefined, "");

    //create the basic tab
    var basicTab = myTab.add("tab", undefined, "Basic");
    
    //create the group for the comp name
    var compsNameGroup = basicTab.add("group");
    compsNameGroup.orientation = "row";
    compsNameGroup.add("statictext", undefined, "Comps name:");
    newCompsName = compsNameGroup.add("edittext", undefined, "subComps");
    newCompsName.characters = 20;

    //create text for comp to include into the new comps
    var compToCopyDirections = basicTab.add("group");
    compToCopyDirections.add('statictext {text: "Comp to include", characters: 20, justify: "center"}');

    //create the multiSelect to pick from for the comp to be included into the new comps
    var compToCopyGroup = basicTab.add("group");
    compsNameGroup.orientation = "row";
    var compToIncludeName = compToCopyGroup.add('listbox', [0, 0, 150, 100], compArray, {
        multiselect: false
    });

    //create group for the comp counts
    var countGroup = basicTab.add("group");
    countGroup.orientation = "row";

    //horizontal count
    countGroup.add("statictext", undefined, "Horz. Count:");
    totalNewCompsHorz = countGroup.add("edittext", undefined, "1");
    totalNewCompsHorz.characters = 5;

    //vertical count
    countGroup.add("statictext", undefined, "Vert. Count:");
    totalNewCompsVert = countGroup.add("edittext", undefined, "1");
    totalNewCompsVert.characters = 5;

    //create group for checkboxes
    var threeDGroup = basicTab.add("group");
    threeDGroup.orientation = "row";
    threeDGroup.margins = [0, 20, 0, 0];
    threeDGroup.spacing = 15;

    //make 3d checkbox
    make3dLayer = threeDGroup.add("checkbox", undefined, "Make Layers 3d");
    
    //motion blur checkbox
    motionBlurLayer = threeDGroup.add("checkbox", undefined, "Motion Blur");
    
    var nulGroup = basicTab.add("group");
    nulGroup.orientation = "row";
    nulGroup.margins = [0, 20, 0, 0];
    nulGroup.spacing = 15;
    //control layer checkbox
    createControlLayer = nulGroup.add("checkbox", undefined, "Add control layer");
    
    createParentNull = nulGroup.add("checkbox", undefined, "Add parent");
    
    var initKeyGroup = basicTab.add("group");
    initKeyGroup.orientation = "row";
    initKeyGroup.margins = [0, 20, 0, 0];
    initKeyGroup.spacing = 15;
    
     initKeyGroup.add("statictext", undefined, "Add initial key at frame ");
    initialKey = initKeyGroup.add("edittext", undefined, "  ");
    initialKey.characters = 7;
    
    //create tab for custom expersions
    var newCompExp = myTab.add("tab", undefined, "Add Expression");

    //create group for custom expresions
    var expGroup = newCompExp.add("panel", undefined, "Add expresions to the generated comps");
    expGroup.orientation = "column";

    //anchor expresion
    expGroup.add("statictext", undefined, "Anchor Point Expression:");
    anchorPointExpresionText = expGroup.add("edittext", undefined, "");
    anchorPointExpresionText.characters = 45;

    //position expresion
    expGroup.add("statictext", undefined, "Possition Expression:");
    posExpresionText = expGroup.add("edittext", undefined, "");
    posExpresionText.characters = 45;

    //scale expresion
    expGroup.add("statictext", undefined, "Scale Expression:");
    scaleExpresionText = expGroup.add("edittext", undefined, "");
    scaleExpresionText.characters = 45;

    //rotation expresion
    expGroup.add("statictext", undefined, "Rotation Expression:");
    rotationExpresionText = expGroup.add("edittext", undefined, "");
    rotationExpresionText.characters = 45;

    //opacity expresion
    expGroup.add("statictext", undefined, "Opacity Expression:");
    opacityExpresionText = expGroup.add("edittext", undefined, "");
    opacityExpresionText.characters = 45;

    //nutton group
    var buildButtonGroup = myWindow.add("group");
    buildButtonGroup.orientation = "row";

    //create build button
    var buildButtton;
    buildButtton = buildButtonGroup.add('button {text: "Build"}');

    //build button onClick function
    buildButtton.onClick = function() {

        checkErrors();

        if (errorMessage != defaultErrorMessage) {
            alert(errorMessage);
        } else {
            buildComps();
            myWindow.close();

        }


    }

    //create cancel button
    var cancelButtton;
    cancelButtton = buildButtonGroup.add('button {text: "Cancel"}');

    //cancel button onClick function
    cancelButtton.onClick = function() {

        myWindow.close();

    }

    myWindow.show();


} else {

    alert("Please select the timeline window pane");

}

function checkErrors() {
    
    //set errorMessages to the default message
    errorMessage = defaultErrorMessage;

    //check that the new comps have a name
    if(newCompsName.text == "")
    {
        errorMessage += "\n     - You need a name for the new comps";
    }
 
    //if there are 3 values in the custom rotationvexpresion, then check that 3d layer is turned on 
    if (rotationExpresionText.text.indexOf(",") != -1 && make3dLayer.value == false) {
        errorMessage += "\n     - You have 3 elements in the rotation expression, but 3d Layer is not checked";
    }

    //check that a comp has been choosen to include into the created comps
    if (compToIncludeName.selection == null) {
        errorMessage += "\n     - You need to select a comp to include into the new comps";
    }
    
    //check that there is a number for verticel count
    if (totalNewCompsVert.text < 1 || isNaN(totalNewCompsVert.text)) {
       errorMessage += "\n     - You need a number greater than 0 in the vert count.";
    }

    //check that there is a number for horizontal count
    if (totalNewCompsHorz.text < 1 || isNaN(totalNewCompsHorz.text)) {
       errorMessage += "\n     - You need a number greater than 0 in the horz count.";
    }

    //if a control layer is selected tell the user that custom expresions will be over written 
    if (createControlLayer.value && (posExpresionText.text != "" || opacityExpresionText.text != "" || scaleExpresionText.text != "" || rotationExpresionText.text != "")) {
        errorMessage += "\n     - You Have checked to create the control layer and put custom expresions on the comps.  The custom expresions will be overwritten by the control layer expresion.";
    }

    return errorMessage;
}

function buildComps() {

    //figure the total comps needed
    totalNewComps = (totalNewCompsHorz.text * totalNewCompsVert.text);

    //find the width of the new comps
    newCompsWidth = Math.ceil(comp.width / totalNewCompsHorz.text);

    //find the height of the comps
    newCompsHeight = Math.ceil(comp.height / totalNewCompsVert.text);

    //find the comp to include in the new comps
    for (var findItem = 1; findItem <= app.project.numItems; findItem++) {

        if ((app.project.item(findItem) instanceof CompItem) && (app.project.item(findItem).name === compToIncludeName.selection.toString())) {

            subComp = app.project.item(findItem);
            break;

        }

    }

    //get the duration of the new comp
    newCompDuration = subComp.workAreaDuration;

    //get comp aspect ratio
    newCompPR = subComp.pixelAspect;

    //new comp FPS
    newCompFPS = (1 / subComp.frameDuration);
     
     //create folder to store the new comps
     compFolder = newFolder = app.project.items.addFolder(newCompsName.text + " comps");

    //Creaate new comps
    for (var count = 0; count < totalNewComps; count++) {

        newCompXCount++;

        if ((newCompsWidth * (newCompXCount - 1)) >= comp.width) {

            newCompYCount++;
            newCompXCount = 1;

        }

        //Create new comp name
        newCompName = newCompsName.text + "-" + (newCompYCount + 1) + "-" + newCompXCount;

        //create the new comp
        newComp = app.project.items.addComp(newCompName, newCompsWidth, newCompsHeight, newCompPR, newCompDuration, newCompFPS);
        
        //put the comps in the comps folder
        newComp.parentFolder = compFolder;
        
        //add the comps into the createdComps array
        createdComps.push(newComp);

        //add the sub movie to the new comp
        newComp.layers.add(subComp);

        //add the new comp to the parent comp
        comp.layers.add(newComp);

        //Make layers 3d if box is checked
        if (make3dLayer.value) {
            comp.layer(newCompName).threeDLayer = true;
        }

        //Turn on Motion Blur for the video
        if (motionBlurLayer.value) {
            comp.layer(newCompName).motionBlur = true;
        }

        //Add custom expression to position of layer, if expresion exists
        //JUST A NOTE: seedRandom(SEED VALUE,true) Tells a random number to NOT change over time
        if (posExpresionText.text != "") {
            comp.layer(newCompName).transform.position.expression = posExpresionText.text;
        }

        //Add custom expression to opacity of layer, if expresion exists
        if (opacityExpresionText.text != "") {
            comp.layer(newCompName).transform.opacity.expression = opacityExpresionText.text;
        }

        //Add custom expression to scale of layer, if expresion exists
        if (scaleExpresionText.text != "") {
            comp.layer(newCompName).transform.scale.expression = scaleExpresionText.text;
        }

        //Add custom expression to rotation of layer, if expresion exists
        if (rotationExpresionText.text != "") {

            //check the number of vaules in the rotation expresion
            //if there is only 1 then add it to the rotation channel
            if (rotationExpresionText.text.indexOf(",") == -1) {
                comp.layer(newCompName).transform.rotation.expression = rotationExpresionText.text;
            } else {
                
                //if there is more than one add them to the correct channel
                var rotBreakUp = rotationExpresionText.text.split(",")

                comp.layer(newCompName).transform.xRotation.expression = rotBreakUp[0];

                comp.layer(newCompName).transform.yRotation.expression = rotBreakUp[1];

                comp.layer(newCompName).transform.zRotation.expression = rotBreakUp[2];
            }

        }

        //layout the created
        //figure new comps x position
        newCompXpos = ((newCompXCount - 1) * newCompsWidth);
        
        //figure new comps y position
        newCompYpos = (newCompYCount * newCompsHeight);

        //position the new comp
        comp.layer(newCompName).property("position").setValue([newCompXpos + (newCompsWidth / 2), newCompYpos + (newCompsHeight / 2)]);

        //figure the inside comps x position
        insideCompX = (subComp.width / 2) - (newCompsWidth * (newCompXCount - 1));

        //figure the inside comps y position
        insideCompY = (subComp.height / 2) - (newCompsHeight * (newCompYCount));

        //position the insode comp
        newComp.layer(1).property("position").setValue([insideCompX, insideCompY]);

    }
    
    if(createParentNull.value)
    {
        //Add the control NULL
        var compNull = comp.layers.addNull(comp.duration);
        compNull.name = "Parent Null";
        
        //Make layers 3d if box is checked
        if (make3dLayer.value || createControlLayer.value) {
            comp.layer("Parent Null").threeDLayer = true;
        }
    }


    //Create the control layer if wanted
    if (createControlLayer.value) {
        
        //Add the control NULL
        var compNull = comp.layers.addNull(comp.duration);
        compNull.name = "Control Layer";
        compNull.threeDLayer = true;

        //Set the position to 0
        comp.layer("Control Layer").property("position").setValue([0, 0, 0]);

        //set the scake to 0
        comp.layer("Control Layer").property("scale").setValue([0, 0, 0]);

        //set the opacity to 100
        comp.layer("Control Layer").property("opacity").setValue(100);
        
         //Add the position seed slider
        var posSlider = compNull.effect.addProperty("ADBE Slider Control");
        posSlider.name = "Position seed";

        //Add the position seed slider
        var posMin = compNull.effect.addProperty("ADBE Slider Control");
        posMin.name = "Position min.";
        
        var posMax = compNull.effect.addProperty("ADBE Slider Control");
        posMax.name = "Position max.";
 
         //Add the rotation seed slider
        var rotSlider = compNull.effect.addProperty("ADBE Slider Control");
        rotSlider.name = "Rotation seed";
        
        //Add the rotation seed slider
        var rotMin = compNull.effect.addProperty("ADBE Slider Control");
        rotMin.name = "Rotation min.";
        
        var rotMax = compNull.effect.addProperty("ADBE Slider Control");
        rotMax.name = "Rotation max.";

        //Add the scale seed slider
        var scaleSlider = compNull.effect.addProperty("ADBE Slider Control");
        scaleSlider.name = "Scale seed";
        
        //Add the scale seed slider
        var scaleMin = compNull.effect.addProperty("ADBE Slider Control");
        scaleMin.name = "Scale min.";
        
        var scaleMax = compNull.effect.addProperty("ADBE Slider Control");
        scaleMax.name = "Scale max.";
        
        //Add the opacity seed slider
        var opacitySlider = compNull.effect.addProperty("ADBE Slider Control");
        opacitySlider.name = "Opacity seed";
        
        //Add the opacity seed slider
        var opacityMin = compNull.effect.addProperty("ADBE Slider Control");
        opacityMin.name = "Opacity min.";
        
        var opacityMax = compNull.effect.addProperty("ADBE Slider Control");
        opacityMax.name = "Opacity max.";

        for (var count = 0; count < createdComps.length; count++) {
            
            //Get the name of the layer
            var cN = createdComps[count].name;
            
            //Turn the layer 3d on
            comp.layer(cN).threeDLayer = true;

            //add the position expresion
           comp.layer(cN).transform.position.expression = "seedRandom((thisComp.layer(\"Control Layer\").effect(\"Position seed\")(\"Slider\")*thisComp.layer(\"Control Layer\").effect(\"Position seed\")(\"Slider\")),true);randOn = ((thisComp.layer(\"Control Layer\").effect(\"Position min.\")(\"Slider\")!=0) || (thisComp.layer(\"Control Layer\").effect(\"Position max.\")(\"Slider\")!=0))?true:false;randMax = thisComp.layer(\"Control Layer\").effect(\"Position max.\")(\"Slider\");randMin = thisComp.layer(\"Control Layer\").effect(\"Position min.\")(\"Slider\");xRan = (randOn)?random(randMin, randMax):1;xMove = thisComp.layer(\"Control Layer\").transform.position[0] * xRan;yRan = (randOn)?random(randMin, randMax):1;yMove = thisComp.layer(\"Control Layer\").transform.position[1] * yRan;zRan = (randOn)?random(randMin, randMax):1;zMove = thisComp.layer(\"Control Layer\").transform.position[2] * zRan;[transform.position[0] + xMove,transform.position[1] + yMove,transform.position[2] + zMove];";

            //add the rotation expresions
            comp.layer(cN).transform.xRotation.expression = "seedRandom((thisComp.layer(\"Control Layer\").effect(\"Rotation seed\")(\"Slider\")*thisComp.layer(\"Control Layer\").effect(\"Rotation seed\")(\"Slider\")),true);randOn = ((thisComp.layer(\"Control Layer\").effect(\"Rotation min.\")(\"Slider\")!=0) || (thisComp.layer(\"Control Layer\").effect(\"Rotation max.\")(\"Slider\")!=0))?true:false;randMax = thisComp.layer(\"Control Layer\").effect(\"Rotation max.\")(\"Slider\");randMin = thisComp.layer(\"Control Layer\").effect(\"Rotation min.\")(\"Slider\");randVal = (randOn)?random(randMin, randMax):1;value + (thisComp.layer(\"Control Layer\").transform.xRotation * randVal);";
            comp.layer(cN).transform.yRotation.expression = "seedRandom((thisComp.layer(\"Control Layer\").effect(\"Rotation seed\")(\"Slider\")*thisComp.layer(\"Control Layer\").effect(\"Rotation seed\")(\"Slider\")),true);randOn = ((thisComp.layer(\"Control Layer\").effect(\"Rotation min.\")(\"Slider\")!=0) || (thisComp.layer(\"Control Layer\").effect(\"Rotation max.\")(\"Slider\")!=0))?true:false;randMax = thisComp.layer(\"Control Layer\").effect(\"Rotation max.\")(\"Slider\");randMin = thisComp.layer(\"Control Layer\").effect(\"Rotation min.\")(\"Slider\");randVal = (randOn)?random(randMin, randMax):1;value + (thisComp.layer(\"Control Layer\").transform.yRotation * randVal);";
            comp.layer(cN).transform.zRotation.expression = "seedRandom((thisComp.layer(\"Control Layer\").effect(\"Rotation seed\")(\"Slider\")*thisComp.layer(\"Control Layer\").effect(\"Rotation seed\")(\"Slider\")),true);randOn = ((thisComp.layer(\"Control Layer\").effect(\"Rotation min.\")(\"Slider\")!=0) || (thisComp.layer(\"Control Layer\").effect(\"Rotation max.\")(\"Slider\")!=0))?true:false;randMax = thisComp.layer(\"Control Layer\").effect(\"Rotation max.\")(\"Slider\");randMin = thisComp.layer(\"Control Layer\").effect(\"Rotation min.\")(\"Slider\");randVal = (randOn)?random(randMin, randMax):1;value + (thisComp.layer(\"Control Layer\").transform.zRotation * randVal);";

            //add the opacity expresion
            comp.layer(cN).transform.opacity.expression = "seedRandom((thisComp.layer(\"Control Layer\").effect(\"Opacity seed\")(\"Slider\")*thisComp.layer(\"Control Layer\").effect(\"Opacity seed\")(\"Slider\")),true);randOn = ((thisComp.layer(\"Control Layer\").effect(\"Opacity min.\")(\"Slider\")!=0) || (thisComp.layer(\"Control Layer\").effect(\"Opacity max.\")(\"Slider\")!=0))?true:false;randMax = thisComp.layer(\"Control Layer\").effect(\"Opacity max.\")(\"Slider\");randMin = thisComp.layer(\"Control Layer\").effect(\"Opacity min.\")(\"Slider\");randVal = (randOn)?random(randMin, randMax):0;oC = thisComp.layer(\"Control Layer\").transform.opacity;(oC != 100)?(oC + (value+randVal)):value;(oC != 100)?(oC + randVal):value+ randVal;";

            //add the scale expresion
            comp.layer(cN).transform.scale.expression = "seedRandom((thisComp.layer(\"Control Layer\").effect(\"Scale seed\")(\"Slider\")*thisComp.layer(\"Control Layer\").effect(\"Scale seed\")(\"Slider\")),true);randOn = ((thisComp.layer(\"Control Layer\").effect(\"Scale min.\")(\"Slider\")!=0) || (thisComp.layer(\"Control Layer\").effect(\"Scale max.\")(\"Slider\")!=0))?true:false;randMax = thisComp.layer(\"Control Layer\").effect(\"Scale max.\")(\"Slider\");randMin = thisComp.layer(\"Control Layer\").effect(\"Scale min.\")(\"Slider\");randVal = (randOn)?random(randMin, randMax):0;xRan = (randOn)?random(randMin, randMax):0;xScale = thisComp.layer(\"Control Layer\").transform.scale[0] + xRan;yRan = (randOn)?random(randMin, randMax):0;yScale = thisComp.layer(\"Control Layer\").transform.scale[1] + yRan;zRan = (randOn)?random(randMin, randMax):0;zScale = thisComp.layer(\"Control Layer\").transform.scale[2] + zRan;xValue = transform.scale[0] + xScale;yValue = transform.scale[1] + yScale;zValue = transform.scale[2] + zScale;[xValue,yValue,zValue]";

        }

    }

    if(createParentNull.value)
    {
        
        for (var count = 0; count < totalNewComps; count++) {
        
             //Get the name of the layer
                var cN = createdComps[count].name;
                            
                comp.layer(cN).parent = comp.layer("Parent Null");
                        
        
        }

    }

if(!isNaN(initialKey.text))
{
    comp.time = (Number(initialKey.text)/newCompFPS);
    
    for (var count = 0; count < totalNewComps; count++) 
    {
        
        var cN = createdComps[count].name;
        
        comp.layer(cN).property("Scale").addKey(comp.time);
        
        comp.layer(cN).property("Position").addKey(comp.time);
        
        if (make3dLayer.value) 
        {
            comp.layer(cN).property("X Rotation").addKey(comp.time);
            comp.layer(cN).property("Y Rotation").addKey(comp.time);
            comp.layer(cN).property("Z Rotation").addKey(comp.time);
        }
        else
        {
            comp.layer(cN).property("Rotation").addKey(comp.time);
        }
        
        comp.layer(cN).property("Opacity").addKey(comp.time);

    }
}


}

app.endUndoGroup();