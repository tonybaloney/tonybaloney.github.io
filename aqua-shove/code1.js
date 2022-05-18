gdjs.Battle_32SceneCode = {};
gdjs.Battle_32SceneCode.GDLargeBlueHoleObjects1= [];
gdjs.Battle_32SceneCode.GDLargeBlueHoleObjects2= [];
gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1= [];
gdjs.Battle_32SceneCode.GDBlueCharacter2Objects2= [];
gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1= [];
gdjs.Battle_32SceneCode.GDGreenCharacter8Objects2= [];
gdjs.Battle_32SceneCode.GDScoreCountObjects1= [];
gdjs.Battle_32SceneCode.GDScoreCountObjects2= [];
gdjs.Battle_32SceneCode.GDScoreLabelObjects1= [];
gdjs.Battle_32SceneCode.GDScoreLabelObjects2= [];

gdjs.Battle_32SceneCode.conditionTrue_0 = {val:false};
gdjs.Battle_32SceneCode.condition0IsTrue_0 = {val:false};
gdjs.Battle_32SceneCode.condition1IsTrue_0 = {val:false};
gdjs.Battle_32SceneCode.condition2IsTrue_0 = {val:false};


gdjs.Battle_32SceneCode.mapOfGDgdjs_46Battle_9532SceneCode_46GDBlueCharacter2Objects1Objects = Hashtable.newFrom({"BlueCharacter2": gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1});
gdjs.Battle_32SceneCode.mapOfGDgdjs_46Battle_9532SceneCode_46GDLargeBlueHoleObjects1Objects = Hashtable.newFrom({"LargeBlueHole": gdjs.Battle_32SceneCode.GDLargeBlueHoleObjects1});
gdjs.Battle_32SceneCode.mapOfGDgdjs_46Battle_9532SceneCode_46GDBlueCharacter2Objects1Objects = Hashtable.newFrom({"BlueCharacter2": gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1});
gdjs.Battle_32SceneCode.mapOfGDgdjs_46Battle_9532SceneCode_46GDGreenCharacter8Objects1Objects = Hashtable.newFrom({"GreenCharacter8": gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1});
gdjs.Battle_32SceneCode.mapOfGDgdjs_46Battle_9532SceneCode_46GDGreenCharacter8Objects1Objects = Hashtable.newFrom({"GreenCharacter8": gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1});
gdjs.Battle_32SceneCode.mapOfGDgdjs_46Battle_9532SceneCode_46GDLargeBlueHoleObjects1Objects = Hashtable.newFrom({"LargeBlueHole": gdjs.Battle_32SceneCode.GDLargeBlueHoleObjects1});
gdjs.Battle_32SceneCode.mapOfGDgdjs_46Battle_9532SceneCode_46GDGreenCharacter8Objects1Objects = Hashtable.newFrom({"GreenCharacter8": gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1});
gdjs.Battle_32SceneCode.mapOfGDgdjs_46Battle_9532SceneCode_46GDBlueCharacter2Objects1Objects = Hashtable.newFrom({"BlueCharacter2": gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1});
gdjs.Battle_32SceneCode.eventsList0 = function(runtimeScene) {

{

gdjs.copyArray(runtimeScene.getObjects("BlueCharacter2"), gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1);
gdjs.copyArray(runtimeScene.getObjects("LargeBlueHole"), gdjs.Battle_32SceneCode.GDLargeBlueHoleObjects1);

gdjs.Battle_32SceneCode.condition0IsTrue_0.val = false;
{
gdjs.Battle_32SceneCode.condition0IsTrue_0.val = gdjs.evtTools.object.hitBoxesCollisionTest(gdjs.Battle_32SceneCode.mapOfGDgdjs_46Battle_9532SceneCode_46GDBlueCharacter2Objects1Objects, gdjs.Battle_32SceneCode.mapOfGDgdjs_46Battle_9532SceneCode_46GDLargeBlueHoleObjects1Objects, true, runtimeScene, false);
}if (gdjs.Battle_32SceneCode.condition0IsTrue_0.val) {
{gdjs.evtTools.runtimeScene.pushScene(runtimeScene, "Battle Scene");
}}

}


{

gdjs.copyArray(runtimeScene.getObjects("BlueCharacter2"), gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1);
gdjs.copyArray(runtimeScene.getObjects("GreenCharacter8"), gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1);

gdjs.Battle_32SceneCode.condition0IsTrue_0.val = false;
{
gdjs.Battle_32SceneCode.condition0IsTrue_0.val = gdjs.evtTools.object.hitBoxesCollisionTest(gdjs.Battle_32SceneCode.mapOfGDgdjs_46Battle_9532SceneCode_46GDBlueCharacter2Objects1Objects, gdjs.Battle_32SceneCode.mapOfGDgdjs_46Battle_9532SceneCode_46GDGreenCharacter8Objects1Objects, false, runtimeScene, false);
}if (gdjs.Battle_32SceneCode.condition0IsTrue_0.val) {
/* Reuse gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1 */
/* Reuse gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1 */
{for(var i = 0, len = gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1.length ;i < len;++i) {
    gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1[i].addForce((( gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1.length === 0 ) ? 0 :gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1[0].getBehavior("TopDownMovement").getXVelocity()) / 60, (( gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1.length === 0 ) ? 0 :gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1[0].getBehavior("TopDownMovement").getYVelocity()) / 60, 1);
}
}{for(var i = 0, len = gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1.length ;i < len;++i) {
    gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1[i].addForce(-(((gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1[i].getBehavior("TopDownMovement").getXVelocity()) / 2)), -(((gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1[i].getBehavior("TopDownMovement").getYVelocity()) / 2)), 0);
}
}}

}


{

gdjs.copyArray(runtimeScene.getObjects("GreenCharacter8"), gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1);
gdjs.copyArray(runtimeScene.getObjects("LargeBlueHole"), gdjs.Battle_32SceneCode.GDLargeBlueHoleObjects1);

gdjs.Battle_32SceneCode.condition0IsTrue_0.val = false;
{
gdjs.Battle_32SceneCode.condition0IsTrue_0.val = gdjs.evtTools.object.hitBoxesCollisionTest(gdjs.Battle_32SceneCode.mapOfGDgdjs_46Battle_9532SceneCode_46GDGreenCharacter8Objects1Objects, gdjs.Battle_32SceneCode.mapOfGDgdjs_46Battle_9532SceneCode_46GDLargeBlueHoleObjects1Objects, true, runtimeScene, false);
}if (gdjs.Battle_32SceneCode.condition0IsTrue_0.val) {
gdjs.copyArray(runtimeScene.getObjects("BlueCharacter2"), gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1);
/* Reuse gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1 */
gdjs.copyArray(runtimeScene.getObjects("ScoreCount"), gdjs.Battle_32SceneCode.GDScoreCountObjects1);
{for(var i = 0, len = gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1.length ;i < len;++i) {
    gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1[i].clearForces();
}
}{for(var i = 0, len = gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1.length ;i < len;++i) {
    gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1[i].setPosition(482,285);
}
}{for(var i = 0, len = gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1.length ;i < len;++i) {
    gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1[i].returnVariable(gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1[i].getVariables().getFromIndex(1)).add(1);
}
}{for(var i = 0, len = gdjs.Battle_32SceneCode.GDScoreCountObjects1.length ;i < len;++i) {
    gdjs.Battle_32SceneCode.GDScoreCountObjects1[i].setString((gdjs.RuntimeObject.getVariableString(((gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1.length === 0 ) ? gdjs.VariablesContainer.badVariablesContainer : gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1[0].getVariables()).getFromIndex(1))));
}
}}

}


{

gdjs.copyArray(runtimeScene.getObjects("BlueCharacter2"), gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1);
gdjs.copyArray(runtimeScene.getObjects("GreenCharacter8"), gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1);

gdjs.Battle_32SceneCode.condition0IsTrue_0.val = false;
gdjs.Battle_32SceneCode.condition1IsTrue_0.val = false;
{
for(var i = 0, k = 0, l = gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1.length;i<l;++i) {
    if ( gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1[i].getAverageForce().getLength() < 30 ) {
        gdjs.Battle_32SceneCode.condition0IsTrue_0.val = true;
        gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1[k] = gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1[i];
        ++k;
    }
}
gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1.length = k;}if ( gdjs.Battle_32SceneCode.condition0IsTrue_0.val ) {
{
gdjs.Battle_32SceneCode.condition1IsTrue_0.val = gdjs.evtTools.object.hitBoxesCollisionTest(gdjs.Battle_32SceneCode.mapOfGDgdjs_46Battle_9532SceneCode_46GDGreenCharacter8Objects1Objects, gdjs.Battle_32SceneCode.mapOfGDgdjs_46Battle_9532SceneCode_46GDBlueCharacter2Objects1Objects, true, runtimeScene, false);
}}
if (gdjs.Battle_32SceneCode.condition1IsTrue_0.val) {
/* Reuse gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1 */
/* Reuse gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1 */
{for(var i = 0, len = gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1.length ;i < len;++i) {
    gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1[i].addForceTowardObject((gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1.length !== 0 ? gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1[0] : null), 60, 0);
}
}}

}


};

gdjs.Battle_32SceneCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.Battle_32SceneCode.GDLargeBlueHoleObjects1.length = 0;
gdjs.Battle_32SceneCode.GDLargeBlueHoleObjects2.length = 0;
gdjs.Battle_32SceneCode.GDBlueCharacter2Objects1.length = 0;
gdjs.Battle_32SceneCode.GDBlueCharacter2Objects2.length = 0;
gdjs.Battle_32SceneCode.GDGreenCharacter8Objects1.length = 0;
gdjs.Battle_32SceneCode.GDGreenCharacter8Objects2.length = 0;
gdjs.Battle_32SceneCode.GDScoreCountObjects1.length = 0;
gdjs.Battle_32SceneCode.GDScoreCountObjects2.length = 0;
gdjs.Battle_32SceneCode.GDScoreLabelObjects1.length = 0;
gdjs.Battle_32SceneCode.GDScoreLabelObjects2.length = 0;

gdjs.Battle_32SceneCode.eventsList0(runtimeScene);
return;

}

gdjs['Battle_32SceneCode'] = gdjs.Battle_32SceneCode;
