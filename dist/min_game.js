class FSFile{constructor(name,permissions="755",content=null,parentDir=null,owner="root"){this.name=name;this.owner=owner;this.permissions=permissions;this.isDirectory=name.startsWith("#")?!0:!1;this.content=content;this.parentDir=parentDir;this.childEntries=[];if(this.isDirectory&&content!=null){this.addDefaultChildEntries(content)}}
getPath(){if(this.parentDir==null)
return"";else return this.parentDir.getPath()+"/"+this.name.replace("#","")}
addDefaultChildEntries(names){names.forEach(name=>{this.childEntries.push(new FSFile(name,"755",null,this))})}
getChildEntry(name){var retval=null;this.childEntries.forEach(element=>{if(element.name==name)
retval=element});return retval}}
class FS{constructor(){this.rootDir=new FSFile("#/","755",["#bin","#boot","#dev","#etc","#home","#lib","#lost+found","#misc","#mnt","#net","#opt","#proc","#root","#sbin","#tmp","#usr","#var"]);this.cwd=this.rootDir;this.rootDir.getChildEntry("#home").addDefaultChildEntries(["#sully"]);this.rootDir.getChildEntry("#etc").addDefaultChildEntries(["#default","#rc.d","#sound","#sysconfig"]);this.rootDir.getChildEntry("#mnt").addDefaultChildEntries(["#cdrom","#floppy"]);this.rootDir.getChildEntry("#usr").addDefaultChildEntries(["#bin","#games","#include","#lib","#local","#man","#sbin","#share","#src"]);this.rootDir.getChildEntry("#var").addDefaultChildEntries(["#gdm","#lib","#lock","#run","#log","#spool","#tmp"])}}
class Machine{constructor(){this.state="OK";this.fileSystem=new FS();this.currentUser="root";this.ip="192.168.0.5";this.cwd=this.fileSystem.rootDir.getChildEntry("#home")}
pwd(){return this.cwd.getPath()}
cd(name){var retval=null;if(name=="..")
retval=this.cwd.parentDir;else retval=this.cwd.getChildEntry("#"+name);if(retval!=null)
this.cwd=retval}
cat(name){var retval=this.cwd.getChildEntry(name);if(retval!=null)
return retval.content}
ls(){var files="";var i=0;for(i;i<this.cwd.childEntries.length;i++){files+=this.cwd.childEntries[i].name.replace("#","")+"\n"}
return files}
touch(name){var newFile=new FSFile(name,"755","Mission briefing",this.fileSystem.cwd);this.cwd.childEntries.push(newFile)}
promptInfo(){return this.currentUser+"@"+this.ip+": "}}
class TypingMinigame{constructor(speed,dictionary,targetHits,maxMisses){this.speed=speed;this.dictionary=dictionary;this.displayedElements=[];this.isRunning=!1;this.hackIndex=0;this.hack=intervalPrint.toString();this.cmplt=!1;this.targetHits=targetHits;this.currentHits=0;this.maxMisses=maxMisses;this.currentMisses=0}
hasPlayerWon(){return(this.currentMisses<this.maxMisses&&this.targetHits<=this.currentHits)}
async writeHack(target,string,indend,delay){if(string.length>this.hackIndex&&this.hackIndex<=indend){target.innerHTML+=string[this.hackIndex++];currentScreen.scrollToEnd();await setTimeout(function()
{currentMinigame.writeHack(target,string,indend,delay)},delay)}else if(string.length<=this.hackIndex)
{this.hackIndex=0;this.cmplt=!0}}
fall(elly){var tpar=parseInt(elly.style.top.replace("px",""))
if(tpar<=900){elly.style.top=(tpar+=currentMinigame.speed)+"px";window.requestAnimationFrame(function(){currentMinigame.fall(elly)})}else{this.failType(elly)}}
failType(elly){for(var i=0;i<this.displayedElements.length;i++){if(this.displayedElements[i].innerHTML==elly.innerHTML){this.displayedElements[i].remove();this.displayedElements.splice(i,1);this.currentMisses++;return}}}
validateInput(input){for(var i=0;i<this.displayedElements.length;i++){if(this.displayedElements[i].innerHTML==input){this.displayedElements[i].remove();this.displayedElements.splice(i,1);this.currentHits++;return!0}}
return!1}
start(){this.isRunning=!0;this.refresh()}
stop(){this.isRunning=!1}
refresh(){if(this.currentHits>=this.targetHits){stop()}
else if(this.currentMisses<this.maxMisses){var wcon=this.dictionary[getRndInteger(0,this.dictionary.length)];var drl=document.createElement("label");drl.className="droppy";drl.style.left=250+getRndInteger(0,800)+"px";drl.style.top=150+getRndInteger(0,200)+"px";drl.style.fontSize=25+getRndInteger(0,30);drl.innerHTML=wcon;document.body.appendChild(drl);this.displayedElements.push(drl);this.fall(drl);setTimeout(function()
{currentMinigame.refresh()},1000)}
else{stop()}}}
class InteractiveScreen{constructor(){this.scr1=document.getElementById("screen1")}
setState(state){var input=document.getElementById("prompt_input");var parent=input.parentNode;if(state=="hacking"){currentMachine.state="hacking";currentMinigame=new TypingMinigame(1,words,20,10);var cln=input.cloneNode();cln.addEventListener("keyup",this.fetchHackInput);parent.replaceChild(cln,input);cln.focus();cln.value="";currentMinigame.start();document.getElementById("screen1").style.backgroundColor="orange"}
else if(state=="OK"){if(currentMinigame){currentMinigame.stop()}
currentMachine.state="OK";var cln=input.cloneNode();cln.addEventListener("keyup",this.fetchCommandInput);parent.replaceChild(cln,input);document.getElementById("screen1").style.backgroundColor="black"}}
scrollToEnd(){var content=document.getElementById("display_content");var containerHeight=content.clientHeight;var contentHeight=content.scrollHeight;content.scrollTop=contentHeight-containerHeight}
fetchHackInput(event){event.preventDefault();var input=document.getElementById("prompt_input");var content=document.getElementById("display_content");var hackContent=document.getElementById("hack_content");if(!hackContent){var hackParent=document.createElement("li");hackContent=document.createElement("pre");hackContent.id="hack_content";hackParent.appendChild(hackContent);content.appendChild(hackContent)}
if(currentMinigame.validateInput(input.value)){currentMinigame.writeHack(hackContent,currentMinigame.hack,currentMinigame.hackIndex+input.value.length*3,20);input.value="";if(currentMinigame.targetHits<=currentMinigame.currentHits){currentScreen.setState("OK")}}}
fetchCommandInput(event){event.preventDefault();if(event.keyCode===13){var input=document.getElementById("prompt_input");var content=document.getElementById("display_content");var input_val=input.value;var result=currentScreen.processCommandInput(input_val);var newInputLine=document.createElement("li");var newInputCode=document.createElement("code");newInputCode.innerHTML=currentMachine.promptInfo()+input_val;newInputLine.appendChild(newInputCode);content.appendChild(newInputLine);var newResultLine=document.createElement("li");var newResultPre=document.createElement("pre");newResultPre.innerHTML=result;newResultLine.appendChild(newResultPre);content.appendChild(newResultLine);input.value="";currentScreen.scrollToEnd()}}
processInput(input){if(currentMachine.state=="hacking"){return processHackInput(input)}
else if(currentMachine.state=="OK"){return processCommandInput(input)}}
processCommandInput(input){if(input=="hack"){currentScreen.setState("hacking")}
else if(input.includes("brfread")){story.completeCondition("briefing_opened");return"Rendering brief..."}
else if(input=="")
return" ";else if(input=="ls")
return currentMachine.ls();else if(input=="help"){return `
        ls  - list directory contents
        pwd - print working directory
        ifconfig - list network interfaces
        brfread - read mission briefing`}
else if(input=="pwd"){return currentMachine.pwd()}
else if(input=="ifconfig"){return `
        lo        Link encap:Local Loopback  
                  inet addr:127.0.0.1  Mask:255.0.0.0
                  inet6 addr: ::1/128 Scope:Host
                  UP LOOPBACK RUNNING  MTU:16436  Metric:1
                  RX packets:8 errors:0 dropped:0 overruns:0 frame:0
                  TX packets:8 errors:0 dropped:0 overruns:0 carrier:0
                  collisions:0 txqueuelen:0 
                  RX bytes:480 (480.0 b)  TX bytes:480 (480.0 b)
        
        p2p1      Link encap:Ethernet  HWaddr 00:1C:C0:AE:B5:E6  
                  inet addr:192.168.0.5  Bcast:192.168.0.255  Mask:255.255.255.0
                  inet6 addr: fe80::21c:c0ff:feae:b5e6/64 Scope:Link
                  UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
                  RX packets:41620 errors:0 dropped:0 overruns:0 frame:0
                  TX packets:40231 errors:0 dropped:0 overruns:0 carrier:0
                  collisions:0 txqueuelen:1000 
                  RX bytes:21601203 (20.6 MiB)  TX bytes:6145876 (5.8 MiB)
                  Interrupt:21 Base address:0xe000 `}
else if(input.includes("cd")){var tar=input.split(" ")[1];currentMachine.cd(tar);return""}else if(input=="cls"){var content=document.getElementById("display_content");if(content){content.innerHTML=""}
return""}
return"Unknown command"}}
class RadarEntity{constructor(x,y,type,tag,angle=0){this.type=type;this.tag=tag;this.x=x;this.y=y;this.angle=angle}}
class Radar{constructor(resolution,lineFreq){this.alerted=!1;this.alertRadarStroke="rgba(200,0,0,0.8)";this.calmRadarStroke="rgba(0,200,0,0.5)";this.alerted=!1;this.currentRadarStroke=this.calmRadarStroke;this.fcdraw_grid(resolution);this.mcdraw_lines(lineFreq,0)}
fcdraw_grid(resolution){var cnv=document.getElementById("fg_canvas");var ctx=cnv.getContext('2d');var cH=cnv.height;var cW=cnv.width;ctx.strokeStyle="rgba(255,255,255,0.2)";ctx.lineWidth="1";for(var i=0;i<=cW;i+=cH/resolution){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,cH);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(cW,i);ctx.stroke()}}
mcdraw_lines(frequency,startPos){var cnv=document.getElementById("mg_canvas");var ctx=cnv.getContext('2d');var cW=cnv.width;var cH=cnv.height;ctx.strokeStyle=this.currentRadarStroke;ctx.lineWidth="0.5";ctx.beginPath();ctx.moveTo(startPos,0);ctx.lineTo(startPos,cH);ctx.stroke();if(startPos>=cW){ctx.clearRect(0,0,cW,cH);startPos=0;if(this.alerted){this.currentRadarStroke=this.alertRadarStroke}else{this.currentRadarStroke=this.calmRadarStroke}}
var ccontext=this;window.requestAnimationFrame(function()
{ccontext.mcdraw_lines(frequency,startPos+frequency)})}
bcdraw_entity(x,y,width,height,color,tag=null,type="unknown",angle=0){var cnv=document.getElementById("bg_canvas");var ctx=cnv.getContext('2d');var cW=cnv.width;var cH=cnv.height;var img;if(x>=0&&x<=cW&&y>=0&&y<=cH){if(type=="sargeant"){img=document.getElementById("sgtpng")}
else if(type=="console1"){img=document.getElementById("cns1png")}
else if(type=="console2"){img=document.getElementById("cns2png")}
else if(type=="private")
{img=document.getElementById("pvtpng")}
if(img){ctx.save();if(angle>0){ctx.translate(x+img.width/2,y+img.height/2);ctx.rotate(angle*Math.PI/180);ctx.drawImage(img,-img.width/2,-img.height/2)}else{ctx.drawImage(img,x,y)}
ctx.restore()}
else{ctx.fillStyle=color;ctx.fillRect(x,y,width,height)}
if(tag!=null)
{ctx.fillStyle="white";ctx.font="bold 12px Courier";ctx.textAlign="stretch";ctx.fillText(tag,x+img.width+5,y+img.height)}}}
bcdraw_clear(){var cnv=document.getElementById("bg_canvas");var ctx=cnv.getContext('2d');var cW=cnv.width;var cH=cnv.height;ctx.clearRect(0,0,cW,cH)}
drawDataURIOnCanvas(x,y){var canvas=document.getElementById("bg_canvas");var img=document.getElementById("timg");canvas.getContext("2d").drawImage(img,x,y)}
drawEntities(entities){var cnv=document.getElementById("bg_canvas");var cW=cnv.width;var cH=cnv.height;for(var i=0;i<entities.length;i++){var ent=entities[i];switch(ent.type){case "up_wall_full":this.bcdraw_entity(ent.x,0,cW-ent.x,ent.y,"#102f10",ent.tag,ent.type,ent.angle);break;case "down_wall_full":this.bcdraw_entity(ent.x,ent.y,cW-ent.x,cH,"#102f10",ent.tag,ent.type,ent.angle);break;case "left_wall_full":this.bcdraw_entity(0,ent.y,ent.x,cH-ent.y,"#102f10",ent.tag,ent.type,ent.angle);break;case "right_wall_full":break;default:this.bcdraw_entity(ent.x,ent.y,5,5,"purple",ent.tag,ent.type,ent.angle);break}}}}
class Condition{constructor(name){this.name=name;this.completed=!1}}
class Scene{constructor(conditions,conversation,inits,entities){this.conditions=conditions;this.conversation=conversation;this.isComplete=!1;this.inits=inits;this.entities=entities}
completeCondition(conditionName){var allConditionsComplete=!0;for(var i=0;i<this.conditions.length;i++){if(this.conditions[i].name==conditionName)
{this.conditions[i].completed=!0}
allConditionsComplete=allConditionsComplete&&this.conditions[i].completed}
this.isComplete=allConditionsComplete}
init(){messageManager.chat=this.conversation;messageManager.chatIndex=0;if(this.inits)
for(var i=0;i<this.inits.length;i++){this.inits[i]()}
radar.drawEntities(this.entities);messageManager.progressChat()}}
class Episode{constructor(scenes){this.scenes=scenes;this.isComplete=!1;this.currSceneIndex=0;this.currScene=this.scenes[this.currSceneIndex]}
completeCondition(conditionName){this.currScene.completeCondition(conditionName);if(this.currScene.isComplete){this.currSceneIndex++;if(this.scenes.length>this.currSceneIndex&&this.currSceneIndex>0){this.currScene=this.scenes[this.currSceneIndex];this.currScene.init()}}}
getConditions(){return this.currScene.conditions}
init(){this.currScene.init()}}
class Story{constructor(episodes){this.episodes=episodes;this.name="Nullspace";this.currEpisodeIndex=0;this.currEpisode=this.episodes[this.currEpisodeIndex]}
completeCondition(conditionName){this.currEpisode.completeCondition(conditionName);if(this.currEpisode.isComplete){this.currEpisodeIndex++;if(this.episodes.length>this.currEpisodeIndex&&this.currEpisodeIndex>0){this.currEpisode=this.episodes[this.currEpisodeIndex];this.currEpisode.init()}}}
getConditions(){return this.currEpisode.getConditions()}
init(){this.currEpisode.init()}}
class MessageManager{constructor(){this.printingMessage=!1;this.scr2=document.getElementById("screen2");this.printSpeed=20;this.chat=[];this.chatIndex=0}
printMessage(message,speed){this.printingMessage=!0;var mb=document.getElementById("message_box");if(mb==null){mb=document.createElement("div");mb.id="message_box";mb.addEventListener("click",this.progressChat);mb.className="placed";this.scr2.appendChild(mb)}else{if(mb.firstChild)
mb.removeChild(mb.firstChild)}
var cd=document.createElement("code");mb.appendChild(cd);intervalPrint(cd,message,speed,function(){messageManager.printingMessage=!messageManager.printingMessage})}
closeMessages(){var mb=document.getElementById("message_box");if(mb!=null)
mb.remove()}
progressChat(){if(!messageManager.printingMessage){if(messageManager.chatIndex<messageManager.chat.length){messageManager.printMessage(messageManager.chat[messageManager.chatIndex++],messageManager.printSpeed)}else{messageManager.closeMessages()}}}}
function intervalPrint(target,message,interval,callback=null){if(target!=null&&message){target.innerHTML+=message[0];if(message.length>1){setTimeout(()=>{intervalPrint(target,message.substring(1,message.length),interval,callback)},interval)}else if(callback!=null){callback()}}}
function focusPrompt(){var prompt=document.getElementById("prompt_input");if(prompt){prompt.focus()}}
function getRndInteger(min,max){return Math.floor(Math.random()*(max-min+1))+min}
function bootstrapStory(){story=new Story([new Episode([new Scene([new Condition("briefing_opened")],["(Sullivan: Man...the academy did not prepare me for the horrible sleeping conditions on these mk.2 ships..)","(Sullivan: I've barely got any sleep)","(Sullivan: Anyway, I should review the mission briefing once more before the start)","(Sullivan: It should be in my home directory under the name gamm2.brf)","(Sullivan: If I remmember correctly these should be opened with the brfread tool, so brfread gamm2.brf)"],[function(){currentMachine.touch("gamm2.brf")}],[]),new Scene([new Condition("open_door"),new Condition("lock_door")],["Greetings mr. Sullivan, as you are most probably aware of by now, an unmarked abandoned space ship has been located at the edge of our solar system.","Its origins are unknown, but technology bears resemblance to our own.","We suspect it belongs to a rogue fraction of human kind but further investigation is needed in order to determine its true origins and its purpose.","For that reason a recon task force has been assigned to search the ship for any survivors or piece of information that could shed light on the whole scenario.","You will be in charge of assisting the deployed team remotely with all the tech related business - override security protocols, bringing ships systems into operational state, hack into data cores, etc.","We cannot give you any precise guidelines as we don't know what to expect, but we count on your adaptability and improvisation skills. You are, after all, one of the finest.","Soldiers are expendable, information is invaluable. make us proud!"],[function(){console.log("act1")}],[]),new Scene([new Condition("open_door")],["Sgt Whitcomb: Hello","Sgt Whitcomb: Hellooooo... tech guy?","Sgt Whitcomb: Don't know if you see me typing or not. I've connected everything following the instructions you provided.","Sgt Whitcomb: You should be hooked with the ships auxiliary terminal.","Sullivan: Affirmative, im in. Great work.","Sullivan: How was the landing?","Sgt Whitcomb: Smooth, we did however puncture a greater hole in the hull than expected, but we managed to seal it off.","Sgt Whitcomb: Once we get the life support up and running, there should be no leaking.","Sullivan: We should get to it then. i believe you air supply is limited and exploring the whole ship is not a short task.","Sgt Whitcomb: Agreed!","Sgt Whitcomb: We are trapped in this ships section though. Tried to pry open this door leading to life support room but its not going anywhere.","Can you try to access the control from your end?","Sullivan: on it. give me a few..."],[function(){console.log("Oxyoxy...");radar.bcdraw_clear()}],[new RadarEntity(0,30,"up_wall_full",null),new RadarEntity(150,150,"down_wall_full",null),new RadarEntity(30,0,"left_wall_full",null),new RadarEntity(50,35,"sargeant","Sgt Black"),new RadarEntity(47,20,"console2","Aux. Terminal"),]),new Scene([new Condition("door_reached")],["Sgt Whitcomb: Im going there now..."],[function(){console.log("Oxyoxy...");radar.bcdraw_clear();moveSgt()}],[]),new Scene([new Condition("escape")],["Sgt Whitcomb: What is that????"],[function(){console.log("Oxyoxy...");radar.bcdraw_clear()}],[new RadarEntity(0,30,"up_wall_full",null),new RadarEntity(150,150,"down_wall_full",null),new RadarEntity(30,0,"left_wall_full",null),new RadarEntity(200,50,"marine","Sgt Black"),new RadarEntity(70,90,"unknown","unknown")])])])}
function endMovement(){story.completeCondition("door_reached")}
function moveSgt(re){radar.bcdraw_clear();if(!re){var re=new RadarEntity(50,50,"marine","Sgt Black")}
re.x++;if(re.x>200){endMovement();return}
radar.drawEntities([re]);window.requestAnimationFrame(function(){moveSgt(re)})}
var radar;var messageManager;var currentMachine;var currentScreen;var currentMinigame;var words=["unknown","continue","buffer","overflow","cross","site","reflection","middle","man","certificate","foreach","interface","dissasemble","working","set","namespace","hack","mysql","injection"];var story;function init(){radar=new Radar(10,2);messageManager=new MessageManager();currentMachine=new Machine();currentScreen=new InteractiveScreen();currentScreen.setState("OK");bootstrapStory();story.init()}