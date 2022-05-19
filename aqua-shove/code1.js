gdjs.Battle_32Scene2Code = {};
gdjs.Battle_32Scene2Code.GDLargeBlueHoleObjects1= [];
gdjs.Battle_32Scene2Code.GDLargeBlueHoleObjects2= [];
gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1= [];
gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects2= [];
gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1= [];
gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects2= [];
gdjs.Battle_32Scene2Code.GDScoreCountObjects1= [];
gdjs.Battle_32Scene2Code.GDScoreCountObjects2= [];
gdjs.Battle_32Scene2Code.GDScoreLabelObjects1= [];
gdjs.Battle_32Scene2Code.GDScoreLabelObjects2= [];
gdjs.Battle_32Scene2Code.GDScoreCount2Objects1= [];
gdjs.Battle_32Scene2Code.GDScoreCount2Objects2= [];
gdjs.Battle_32Scene2Code.GDInstructionsObjects1= [];
gdjs.Battle_32Scene2Code.GDInstructionsObjects2= [];

gdjs.Battle_32Scene2Code.conditionTrue_0 = {val:false};
gdjs.Battle_32Scene2Code.condition0IsTrue_0 = {val:false};
gdjs.Battle_32Scene2Code.condition1IsTrue_0 = {val:false};


gdjs.Battle_32Scene2Code.mapOfGDgdjs_46Battle_9532Scene2Code_46GDBlueCharacter2Objects1Objects = Hashtable.newFrom({"BlueCharacter2": gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1});
gdjs.Battle_32Scene2Code.mapOfGDgdjs_46Battle_9532Scene2Code_46GDGreenCharacter8Objects1Objects = Hashtable.newFrom({"GreenCharacter8": gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1});
gdjs.Battle_32Scene2Code.mapOfGDgdjs_46Battle_9532Scene2Code_46GDGreenCharacter8Objects1Objects = Hashtable.newFrom({"GreenCharacter8": gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1});
gdjs.Battle_32Scene2Code.mapOfGDgdjs_46Battle_9532Scene2Code_46GDBlueCharacter2Objects1Objects = Hashtable.newFrom({"BlueCharacter2": gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1});
gdjs.Battle_32Scene2Code.mapOfGDgdjs_46Battle_9532Scene2Code_46GDGreenCharacter8Objects1Objects = Hashtable.newFrom({"GreenCharacter8": gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1});
gdjs.Battle_32Scene2Code.mapOfGDgdjs_46Battle_9532Scene2Code_46GDLargeBlueHoleObjects1Objects = Hashtable.newFrom({"LargeBlueHole": gdjs.Battle_32Scene2Code.GDLargeBlueHoleObjects1});
gdjs.Battle_32Scene2Code.mapOfGDgdjs_46Battle_9532Scene2Code_46GDBlueCharacter2Objects1Objects = Hashtable.newFrom({"BlueCharacter2": gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1});
gdjs.Battle_32Scene2Code.mapOfGDgdjs_46Battle_9532Scene2Code_46GDLargeBlueHoleObjects1Objects = Hashtable.newFrom({"LargeBlueHole": gdjs.Battle_32Scene2Code.GDLargeBlueHoleObjects1});
gdjs.Battle_32Scene2Code.eventsList0 = function(runtimeScene) {

{

gdjs.copyArray(runtimeScene.getObjects("BlueCharacter2"), gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1);
gdjs.copyArray(runtimeScene.getObjects("GreenCharacter8"), gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1);

gdjs.Battle_32Scene2Code.condition0IsTrue_0.val = false;
{
gdjs.Battle_32Scene2Code.condition0IsTrue_0.val = gdjs.evtTools.object.hitBoxesCollisionTest(gdjs.Battle_32Scene2Code.mapOfGDgdjs_46Battle_9532Scene2Code_46GDBlueCharacter2Objects1Objects, gdjs.Battle_32Scene2Code.mapOfGDgdjs_46Battle_9532Scene2Code_46GDGreenCharacter8Objects1Objects, false, runtimeScene, false);
}if (gdjs.Battle_32Scene2Code.condition0IsTrue_0.val) {
/* Reuse gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1 */
/* Reuse gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1 */
{for(var i = 0, len = gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1.length ;i < len;++i) {
    gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1[i].addForce((( gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1.length === 0 ) ? 0 :gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1[0].getBehavior("TopDownMovement").getXVelocity()) / 60, (( gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1.length === 0 ) ? 0 :gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1[0].getBehavior("TopDownMovement").getYVelocity()) / 60, 1);
}
}{for(var i = 0, len = gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1.length ;i < len;++i) {
    gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1[i].addForce(-(((gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1[i].getBehavior("TopDownMovement").getXVelocity()) / 2)), -(((gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1[i].getBehavior("TopDownMovement").getYVelocity()) / 2)), 0);
}
}}

}


{

gdjs.copyArray(runtimeScene.getObjects("BlueCharacter2"), gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1);
gdjs.copyArray(runtimeScene.getObjects("GreenCharacter8"), gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1);

gdjs.Battle_32Scene2Code.condition0IsTrue_0.val = false;
{
gdjs.Battle_32Scene2Code.condition0IsTrue_0.val = gdjs.evtTools.object.hitBoxesCollisionTest(gdjs.Battle_32Scene2Code.mapOfGDgdjs_46Battle_9532Scene2Code_46GDGreenCharacter8Objects1Objects, gdjs.Battle_32Scene2Code.mapOfGDgdjs_46Battle_9532Scene2Code_46GDBlueCharacter2Objects1Objects, false, runtimeScene, false);
}if (gdjs.Battle_32Scene2Code.condition0IsTrue_0.val) {
/* Reuse gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1 */
/* Reuse gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1 */
{for(var i = 0, len = gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1.length ;i < len;++i) {
    gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1[i].addForce((( gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1.length === 0 ) ? 0 :gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1[0].getBehavior("TopDownMovement").getXVelocity()) / 60, (( gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1.length === 0 ) ? 0 :gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1[0].getBehavior("TopDownMovement").getYVelocity()) / 60, 1);
}
}{for(var i = 0, len = gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1.length ;i < len;++i) {
    gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1[i].addForce(-(((gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1[i].getBehavior("TopDownMovement").getXVelocity()) / 2)), -(((gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1[i].getBehavior("TopDownMovement").getYVelocity()) / 2)), 0);
}
}}

}


{

gdjs.copyArray(runtimeScene.getObjects("GreenCharacter8"), gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1);
gdjs.copyArray(runtimeScene.getObjects("LargeBlueHole"), gdjs.Battle_32Scene2Code.GDLargeBlueHoleObjects1);

gdjs.Battle_32Scene2Code.condition0IsTrue_0.val = false;
{
gdjs.Battle_32Scene2Code.condition0IsTrue_0.val = gdjs.evtTools.object.hitBoxesCollisionTest(gdjs.Battle_32Scene2Code.mapOfGDgdjs_46Battle_9532Scene2Code_46GDGreenCharacter8Objects1Objects, gdjs.Battle_32Scene2Code.mapOfGDgdjs_46Battle_9532Scene2Code_46GDLargeBlueHoleObjects1Objects, true, runtimeScene, false);
}if (gdjs.Battle_32Scene2Code.condition0IsTrue_0.val) {
gdjs.copyArray(runtimeScene.getObjects("BlueCharacter2"), gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1);
/* Reuse gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1 */
gdjs.copyArray(runtimeScene.getObjects("ScoreCount"), gdjs.Battle_32Scene2Code.GDScoreCountObjects1);
{for(var i = 0, len = gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1.length ;i < len;++i) {
    gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1[i].clearForces();
}
}{for(var i = 0, len = gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1.length ;i < len;++i) {
    gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1[i].setPosition(482,285);
}
}{for(var i = 0, len = gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1.length ;i < len;++i) {
    gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1[i].returnVariable(gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1[i].getVariables().getFromIndex(1)).add(1);
}
}{for(var i = 0, len = gdjs.Battle_32Scene2Code.GDScoreCountObjects1.length ;i < len;++i) {
    gdjs.Battle_32Scene2Code.GDScoreCountObjects1[i].setString((gdjs.RuntimeObject.getVariableString(((gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1.length === 0 ) ? gdjs.VariablesContainer.badVariablesContainer : gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1[0].getVariables()).getFromIndex(1))));
}
}}

}


{

gdjs.copyArray(runtimeScene.getObjects("BlueCharacter2"), gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1);
gdjs.copyArray(runtimeScene.getObjects("LargeBlueHole"), gdjs.Battle_32Scene2Code.GDLargeBlueHoleObjects1);

gdjs.Battle_32Scene2Code.condition0IsTrue_0.val = false;
{
gdjs.Battle_32Scene2Code.condition0IsTrue_0.val = gdjs.evtTools.object.hitBoxesCollisionTest(gdjs.Battle_32Scene2Code.mapOfGDgdjs_46Battle_9532Scene2Code_46GDBlueCharacter2Objects1Objects, gdjs.Battle_32Scene2Code.mapOfGDgdjs_46Battle_9532Scene2Code_46GDLargeBlueHoleObjects1Objects, true, runtimeScene, false);
}if (gdjs.Battle_32Scene2Code.condition0IsTrue_0.val) {
/* Reuse gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1 */
gdjs.copyArray(runtimeScene.getObjects("GreenCharacter8"), gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1);
gdjs.copyArray(runtimeScene.getObjects("ScoreCount2"), gdjs.Battle_32Scene2Code.GDScoreCount2Objects1);
{for(var i = 0, len = gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1.length ;i < len;++i) {
    gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1[i].clearForces();
}
}{for(var i = 0, len = gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1.length ;i < len;++i) {
    gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1[i].setPosition(482,285);
}
}{for(var i = 0, len = gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1.length ;i < len;++i) {
    gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1[i].returnVariable(gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1[i].getVariables().getFromIndex(0)).add(1);
}
}{for(var i = 0, len = gdjs.Battle_32Scene2Code.GDScoreCount2Objects1.length ;i < len;++i) {
    gdjs.Battle_32Scene2Code.GDScoreCount2Objects1[i].setString((gdjs.RuntimeObject.getVariableString(((gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1.length === 0 ) ? gdjs.VariablesContainer.badVariablesContainer : gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1[0].getVariables()).getFromIndex(0))));
}
}}

}


{


gdjs.Battle_32Scene2Code.condition0IsTrue_0.val = false;
{
gdjs.Battle_32Scene2Code.condition0IsTrue_0.val = gdjs.evtTools.input.isKeyPressed(runtimeScene, "w");
}if (gdjs.Battle_32Scene2Code.condition0IsTrue_0.val) {
gdjs.copyArray(runtimeScene.getObjects("GreenCharacter8"), gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1);
{for(var i = 0, len = gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1.length ;i < len;++i) {
    gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1[i].getBehavior("TopDownMovement").simulateUpKey();
}
}{for(var i = 0, len = gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1.length ;i < len;++i) {
    gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1[i].clearForces();
}
}}

}


{


gdjs.Battle_32Scene2Code.condition0IsTrue_0.val = false;
{
gdjs.Battle_32Scene2Code.condition0IsTrue_0.val = gdjs.evtTools.input.isKeyPressed(runtimeScene, "s");
}if (gdjs.Battle_32Scene2Code.condition0IsTrue_0.val) {
gdjs.copyArray(runtimeScene.getObjects("GreenCharacter8"), gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1);
{for(var i = 0, len = gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1.length ;i < len;++i) {
    gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1[i].getBehavior("TopDownMovement").simulateDownKey();
}
}{for(var i = 0, len = gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1.length ;i < len;++i) {
    gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1[i].clearForces();
}
}}

}


{


gdjs.Battle_32Scene2Code.condition0IsTrue_0.val = false;
{
gdjs.Battle_32Scene2Code.condition0IsTrue_0.val = gdjs.evtTools.input.isKeyPressed(runtimeScene, "a");
}if (gdjs.Battle_32Scene2Code.condition0IsTrue_0.val) {
gdjs.copyArray(runtimeScene.getObjects("GreenCharacter8"), gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1);
{for(var i = 0, len = gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1.length ;i < len;++i) {
    gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1[i].getBehavior("TopDownMovement").simulateLeftKey();
}
}{for(var i = 0, len = gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1.length ;i < len;++i) {
    gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1[i].clearForces();
}
}}

}


{


gdjs.Battle_32Scene2Code.condition0IsTrue_0.val = false;
{
gdjs.Battle_32Scene2Code.condition0IsTrue_0.val = gdjs.evtTools.input.isKeyPressed(runtimeScene, "d");
}if (gdjs.Battle_32Scene2Code.condition0IsTrue_0.val) {
gdjs.copyArray(runtimeScene.getObjects("GreenCharacter8"), gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1);
{for(var i = 0, len = gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1.length ;i < len;++i) {
    gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1[i].getBehavior("TopDownMovement").simulateRightKey();
}
}{for(var i = 0, len = gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1.length ;i < len;++i) {
    gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1[i].clearForces();
}
}}

}


{

gdjs.copyArray(runtimeScene.getObjects("BlueCharacter2"), gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1);

gdjs.Battle_32Scene2Code.condition0IsTrue_0.val = false;
{
for(var i = 0, k = 0, l = gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1.length;i<l;++i) {
    if ( gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1[i].getBehavior("TopDownMovement").isUsingControl("Up") ) {
        gdjs.Battle_32Scene2Code.condition0IsTrue_0.val = true;
        gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1[k] = gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1[i];
        ++k;
    }
}
gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1.length = k;}if (gdjs.Battle_32Scene2Code.condition0IsTrue_0.val) {
/* Reuse gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1 */
{for(var i = 0, len = gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1.length ;i < len;++i) {
    gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1[i].clearForces();
}
}}

}


};

gdjs.Battle_32Scene2Code.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.Battle_32Scene2Code.GDLargeBlueHoleObjects1.length = 0;
gdjs.Battle_32Scene2Code.GDLargeBlueHoleObjects2.length = 0;
gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects1.length = 0;
gdjs.Battle_32Scene2Code.GDBlueCharacter2Objects2.length = 0;
gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects1.length = 0;
gdjs.Battle_32Scene2Code.GDGreenCharacter8Objects2.length = 0;
gdjs.Battle_32Scene2Code.GDScoreCountObjects1.length = 0;
gdjs.Battle_32Scene2Code.GDScoreCountObjects2.length = 0;
gdjs.Battle_32Scene2Code.GDScoreLabelObjects1.length = 0;
gdjs.Battle_32Scene2Code.GDScoreLabelObjects2.length = 0;
gdjs.Battle_32Scene2Code.GDScoreCount2Objects1.length = 0;
gdjs.Battle_32Scene2Code.GDScoreCount2Objects2.length = 0;
gdjs.Battle_32Scene2Code.GDInstructionsObjects1.length = 0;
gdjs.Battle_32Scene2Code.GDInstructionsObjects2.length = 0;

gdjs.Battle_32Scene2Code.eventsList0(runtimeScene);
return;

}

gdjs['Battle_32Scene2Code'] = gdjs.Battle_32Scene2Code;
