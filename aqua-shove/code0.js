gdjs.Menu_32SceneCode = {};
gdjs.Menu_32SceneCode.GDPlayButtonTextObjects1= [];
gdjs.Menu_32SceneCode.GDPlayButtonTextObjects2= [];
gdjs.Menu_32SceneCode.GDNewSpriteObjects1= [];
gdjs.Menu_32SceneCode.GDNewSpriteObjects2= [];

gdjs.Menu_32SceneCode.conditionTrue_0 = {val:false};
gdjs.Menu_32SceneCode.condition0IsTrue_0 = {val:false};
gdjs.Menu_32SceneCode.condition1IsTrue_0 = {val:false};


gdjs.Menu_32SceneCode.eventsList0 = function(runtimeScene) {

{


gdjs.Menu_32SceneCode.condition0IsTrue_0.val = false;
{
gdjs.Menu_32SceneCode.condition0IsTrue_0.val = gdjs.evtTools.input.anyKeyPressed(runtimeScene);
}if (gdjs.Menu_32SceneCode.condition0IsTrue_0.val) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "Battle Scene", true);
}}

}


};

gdjs.Menu_32SceneCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.Menu_32SceneCode.GDPlayButtonTextObjects1.length = 0;
gdjs.Menu_32SceneCode.GDPlayButtonTextObjects2.length = 0;
gdjs.Menu_32SceneCode.GDNewSpriteObjects1.length = 0;
gdjs.Menu_32SceneCode.GDNewSpriteObjects2.length = 0;

gdjs.Menu_32SceneCode.eventsList0(runtimeScene);
return;

}

gdjs['Menu_32SceneCode'] = gdjs.Menu_32SceneCode;
