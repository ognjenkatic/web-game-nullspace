// OS Code
class FSFile{

    constructor(name,permissions="755",content = null,parentDir=null,owner="root"){
        this.name = name;
        this.owner = owner;        
        this.permissions = permissions;
        this.isDirectory = name.startsWith("#") ? true : false;
        this.content = content;
        this.parentDir = parentDir;
        this.childEntries = [];
        if(this.isDirectory && content != null){
            this.addDefaultChildEntries(content);    
        }
    }

    getPath(){
        if(this.parentDir == null)
            return "";
        else
            return this.parentDir.getPath()+"/"+this.name.replace("#","");
    }

    addDefaultChildEntries(names){
        names.forEach(name => {
            this.childEntries.push(new FSFile(name,"755",null,this));
        });
    }

    getChildEntry(name){
        var retval = null;
        this.childEntries.forEach(element => {
            if(element.name == name)
                retval = element;
        });

        return retval;
    }
}

class FS{
    
    constructor(){
        this.rootDir = new FSFile("#/","755",["#bin","#boot","#dev","#etc","#home","#lib","#lost+found","#misc","#mnt","#net","#opt","#proc","#root","#sbin","#tmp","#usr","#var"]);
        this.cwd = this.rootDir;

        this.rootDir.getChildEntry("#home").addDefaultChildEntries(["#sully"]);
        this.rootDir.getChildEntry("#etc").addDefaultChildEntries(["#default","#rc.d","#sound","#sysconfig"]);
        this.rootDir.getChildEntry("#mnt").addDefaultChildEntries(["#cdrom","#floppy"]);
        this.rootDir.getChildEntry("#usr").addDefaultChildEntries(["#bin","#games","#include","#lib","#local","#man","#sbin","#share","#src"]);
        this.rootDir.getChildEntry("#var").addDefaultChildEntries(["#gdm","#lib","#lock","#run","#log","#spool","#tmp"]);
    }
}


class Machine{

    constructor(){
        this.state = "OK";
        this.fileSystem = new FS();
        this.currentUser = "root";
        this.ip = "192.168.0.5";
        this.cwd = this.fileSystem.rootDir.getChildEntry("#home");
        this.services = [];
        this.programs = [];


    }

    addProgram(program){
        this.programs.push(program);
    }

    runProgram(name,args){
        switch(name){
            case(""):{
                return " ";
            }
            case("help"):{
                var retval = "";
                retval += "help\t\t: shows the programs this machine can run.\n";
                retval += "ls\t\t: lists the contents of the current directory.\n";
                retval += "pwd\t\t: displays the current working directory.\n";
                retval += "ifconfig\t: displays the network configuration of the machine.\n";
                retval += "cd\t\t: changes the current working directory. The first argument is the name of the directory.\n"
                retval += "cls\t\t: clear the screen.\n";

                for(var i=0;i<this.programs.length;i++){
                    retval += this.programs[i].name+"\t\t: "+this.programs[i].description+"\n";
                }

                return retval;
                
            }
            case("ls"):{
                return this.ls();
            }
            case("pwd"):{
                return this.pwd();
            }
            case("ifconfig"):{
                return  "lo\tLink encap:Local Loopback\n"+
                          "\tinet addr:127.0.0.1  Mask:255.0.0.0\n"+
                          "\tinet6 addr: ::1/128 Scope:Host\n"+
                          "\tUP LOOPBACK RUNNING  MTU:16436  Metric:1\n"+
                          "\tRX packets:8 errors:0 dropped:0 overruns:0 frame:0\n"+
                          "\tTX packets:8 errors:0 dropped:0 overruns:0 carrier:0\n"+
                          "\tcollisions:0 txqueuelen:0\n"+
                          "\tRX bytes:480 (480.0 b)  TX bytes:480 (480.0 b)\n\n"+
                "eth0\tLink encap:Ethernet  HWaddr 00:1C:C0:AE:B5:E6\n"+  
                          "\tinet addr:"+this.ip+" Bcast:192.168.0.255  Mask:255.255.255.0\n"+
                          "\tinet6 addr: fe80::21c:c0ff:feae:b5e6/64 Scope:Link\n"+
                          "\tUP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1\n"+
                          "\tRX packets:41620 errors:0 dropped:0 overruns:0 frame:0\n"+
                          "\tTX packets:40231 errors:0 dropped:0 overruns:0 carrier:0\n"+
                          "\tcollisions:0 txqueuelen:1000 \n"+
                          "\tRX bytes:21601203 (20.6 MiB)  TX bytes:6145876 (5.8 MiB)\n"+
                          "\tInterrupt:21 Base address:0xe000\n"
            }
            case("cd"):{
                this.cd(args[1]);
            }
            case("cls"):{
                var content = document.getElementById("display_content");
                if(content){
                    content.innerHTML = "";
                }

                return "";
            }


        }
      
        for(var i=0;i<this.programs.length;i++){
            if (this.programs[i].name == name){
                return this.programs[i].callback(args);
            }
        }

        return "unknown command";
        
    }
    addService(service){
        this.services.push(service);
    }

    removeService(name){
        for(var i=0;i<this.services.length;i++){
            if(this.services[i].name == name){
                this.services.splice(i,1);
                return;
            }
        }
    }

    setServiceState(name,running){
        for(var i=0;i<this.services.length;i++){
            if(this.services[i].name == name){
                this.services[i].running = running;
                return;
            }
        }
    }
    
    pwd(){
        return this.cwd.getPath();
    }

    cd(name){
        var retval = null;
        if(name == "..")
            retval = this.cwd.parentDir;
        else
            retval = this.cwd.getChildEntry("#"+name);

        if(retval != null)
            this.cwd = retval;
    }

    cat(name){
        var retval = this.cwd.getChildEntry(name);
        if(retval != null)
            return retval.content;
    }

    ls(){
        var files = "";
        var i=0;
        for(i;i<this.cwd.childEntries.length;i++){
            files += this.cwd.childEntries[i].name.replace("#","")+"\n";
        }

        return files;
    }

    touch(name){
        var newFile = new FSFile(name,"755","Mission briefing",this.fileSystem.cwd);
        this.cwd.childEntries.push(newFile);
    }
    promptInfo(){
        return this.currentUser+"@"+this.ip+": ";
    }
}

class Program{
    constructor(name,description,callback){
        this.name = name;
        this.description = description;
        this.callback = callback;
    }

    execute(args){
        return this.callback(args);
    }
}
class Service{
    constructor(port,name,running,callback){
        this.port = port;
        this.name = name;
        this.running = running;
        this.callback = callback;
    }

    call(args){
        if(this.running){
            return this.callback(args);
        }
    }
}
class Network{
    constructor(subnet,netmask,machines){
        this.subnet = subnet;
        this.netmask = netmask;
        this.machines = machines;
    }

    scan(){
        return this.machines;
    }
}
class TypingMinigame{
    constructor(speed,dictionary,targetHits,maxMisses){
        this.speed = speed;
        this.dictionary = dictionary;
        this.displayedElements = [];
        this.isRunning = false;
        this.hackIndex = 0;
        this.hack = intervalPrint.toString();
        this.cmplt = false;
        this.targetHits = targetHits;
        this.currentHits = 0;
        this.maxMisses = maxMisses;
        this.currentMisses = 0;
        
    }

    hasPlayerWon(){
        return (this.currentMisses < this.maxMisses && this.targetHits <= this.currentHits)
    }

    async writeHack(target,string,indend,delay){

        if (string.length > this.hackIndex && this.hackIndex <= indend) {
            target.innerHTML += string[this.hackIndex++];
            
            currentScreen.scrollToEnd();
            //playSound();
            await setTimeout(
                function() 
                {
                    currentMinigame.writeHack(target, string,indend, delay);
                }, delay);
            
        } else if ( string.length <= this.hackIndex)
        {
            this.hackIndex= 0;
            this.cmplt = true;
        }
        
    }

    fall(elly){
        var tpar = parseInt(elly.style.top.replace("px",""))
        if(tpar <= 900){
            
            elly.style.top = (tpar+=currentMinigame.speed)+"px";
            window.requestAnimationFrame(function(){currentMinigame.fall(elly);});
            //setTimeout(function(){fall(elly);},50);
        } else{
            this.failType(elly);
        }
    }

    failType(elly){
        for(var i=0;i<this.displayedElements.length;i++){
            if(this.displayedElements[i].innerHTML == elly.innerHTML){
                this.displayedElements[i].remove();
                this.displayedElements.splice(i,1);
                this.currentMisses++;
                return;
            }
        }
    }

    validateInput(input){
        for(var i=0;i<this.displayedElements.length;i++){
            if(this.displayedElements[i].innerHTML == input){
                this.displayedElements[i].remove();
                this.displayedElements.splice(i,1);


                this.currentHits++;
                return true;
            }
        }
        return false;
    }

    start(){
        this.isRunning = true;
        this.refresh();
    }

    stop(){
        this.isRunning = false;
    }

    refresh(){
        if (this.currentHits >= this.targetHits){
            stop();
        }
        else if (this.currentMisses < this.maxMisses){
            var wcon = this.dictionary[getRndInteger(0,this.dictionary.length)];
            var drl = document.createElement("label");
            drl.className = "droppy";
            drl.style.left = 250 + getRndInteger(0,800)+"px";
            drl.style.top = 150 + getRndInteger(0,200)+"px";
            drl.style.fontSize = 25 + getRndInteger(0,30);
            drl.innerHTML = wcon;
            document.body.appendChild(drl);
            
            this.displayedElements.push(drl);

            this.fall(drl);
            setTimeout(
                function()
                {
                    currentMinigame.refresh();
                },1000
                );
        }
        else{
            stop();
        }
    }

}

class InteractiveScreen{
    constructor(){
        this.scr1 = document.getElementById("screen1");
    
    }

    setInputBlocking(block){
        var input = document.getElementById("prompt");
        if(block){
            input.style.display = "none";
        } else
        {
            input.style.display = "block";
        }
    }

    setState(state){
        var input = document.getElementById("prompt_input");
        var parent = input.parentNode;


        if(state == "hacking"){
            currentMachine.state = "hacking";
            currentMinigame = new TypingMinigame(1,words,20,10);
            var cln = input.cloneNode();
            cln.addEventListener("keyup",this.fetchHackInput);
            parent.replaceChild(cln,input);
            cln.focus();
            cln.value = "";
            currentMinigame.start();
            document.getElementById("screen1").style.backgroundColor = "orange";
        }
        else if (state == "OK"){
            if(currentMinigame){
                currentMinigame.stop();
            }
            currentMachine.state = "OK";
            var cln = input.cloneNode();
            cln.addEventListener("keyup",this.fetchCommandInput);
            parent.replaceChild(cln,input);
            document.getElementById("screen1").style.backgroundColor = "black";
        }
    }

    scrollToEnd(){
        var content = document.getElementById("display_content");

        var containerHeight = content.clientHeight;
        var contentHeight = content.scrollHeight;

        content.scrollTop = contentHeight - containerHeight;
    }

    fetchHackInput(event){
        event.preventDefault();
        var input = document.getElementById("prompt_input");
        var content = document.getElementById("display_content");
        var hackContent = document.getElementById("hack_content");

        if(!hackContent){
            var hackParent = document.createElement("li");
            hackContent = document.createElement("pre");
            hackContent.id = "hack_content";
            hackParent.appendChild(hackContent);
            content.appendChild(hackContent);
        }

        if (currentMinigame.validateInput(input.value)){
            currentMinigame.writeHack(hackContent,currentMinigame.hack,currentMinigame.hackIndex+input.value.length*3,20);
            input.value = "";

            if (currentMinigame.targetHits<=currentMinigame.currentHits) {
               
                currentScreen.setState("OK");
            }
        }
    }


    appendCommandResult(result){
        var content = document.getElementById("display_content");
        var newCode = document.createElement("pre");
        newCode.innerHTML = result;
        content.appendChild(newCode);
        currentScreen.scrollToEnd();
    }

    fetchCommandInput(event){
        event.preventDefault();

        // Enter pressed
        if(event.keyCode === 13 ){
            var input = document.getElementById("prompt_input");
            var content = document.getElementById("display_content");

            var input_val = input.value;

            var result = currentScreen.processCommandInput(input_val);

            if (result != ""){
                var newInputLine = document.createElement("li");
                var newInputCode = document.createElement("code");

                newInputCode.innerHTML = currentMachine.promptInfo()+input_val;

                newInputLine.appendChild(newInputCode);
                content.appendChild(newInputLine);

                if (result != " "){
                    var newResultLine = document.createElement("li");
                    var newResultPre = document.createElement("pre");

                    newResultPre.innerHTML = result;

                    newResultLine.appendChild(newResultPre);
                    content.appendChild(newResultLine);
                }
                currentScreen.scrollToEnd();
            }
            input.value = "";
            
        }
    }

    processInput(input){
        if (currentMachine.state == "hacking"){
            return processHackInput(input);
        }
        else if (currentMachine.state == "OK"){
            return processCommandInput(input);
        }
        
    }

    processCommandInput(input){
        var splitInput = input.split(" ");
        var cmnd = splitInput.slice(0,1)[0];
        var args = splitInput.slice(1);

        if(cmnd == "hack"){
            currentScreen.setState("hacking");
        } else
        {
            return currentMachine.runProgram(cmnd,args);
        }
    }

    
}

// Canvas radar code
class RadarEntity{
    constructor(x,y,type,tag,angle=0,scale){
        this.type = type;
        this.tag = tag;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.scale = scale;
    }
}

class Radar{
    constructor(resolution,lineFreq){
        this.alerted = false;
        this.alertRadarStroke = "rgba(200,0,0,0.8)";
        this.calmRadarStroke = "rgba(0,200,0,0.5)";
        this.alerted = false;
        this.currentRadarStroke = this.calmRadarStroke;

        this.fcdraw_grid(resolution);
        this.mcdraw_lines(lineFreq,0);
    }

    fcdraw_grid(resolution){

        var cnv = document.getElementById("fg_canvas");
        var ctx = cnv.getContext('2d');

        var cH = cnv.height;
        var cW = cnv.width;

        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = "1";
    
        for(var i=0;i<=cW;i+=cH/resolution){
            ctx.beginPath();
            ctx.moveTo(i,0);
            ctx.lineTo(i,cH);
            ctx.stroke();
    
            ctx.beginPath();
            ctx.moveTo(0,i);
            ctx.lineTo(cW,i);
            ctx.stroke();
        }
    }

    mcdraw_lines(frequency,startPos){
        var cnv = document.getElementById("mg_canvas");
        var ctx = cnv.getContext('2d');
    
        var cW = cnv.width;
        var cH = cnv.height;
        
        ctx.strokeStyle = this.currentRadarStroke;
        ctx.lineWidth = "0.5";
    
        ctx.beginPath();
        ctx.moveTo(startPos,0);
        ctx.lineTo(startPos,cH);
        ctx.stroke();
    
        if(startPos >= cW){
            ctx.clearRect(0,0,cW,cH);
            startPos=0;
            if(this.alerted){
                this.currentRadarStroke = this.alertRadarStroke;
            }else
            {
                this.currentRadarStroke = this.calmRadarStroke;
            }
        }
    
        var ccontext = this;
        window.requestAnimationFrame(function()
        {
            ccontext.mcdraw_lines(frequency,startPos+frequency);
        });
    }

    bcdraw_entity(x,y,width,height,color,tag = null,type="unknown",angle=0,scale=1){
        var cnv = document.getElementById("bg_canvas");
        var ctx = cnv.getContext('2d');
    
        var cW = cnv.width;
        var cH = cnv.height;
    
        var img;
        if(x >= 0 && x <= cW && y >= 0 && y <= cH){
            if(type == "sargeant"){
                img = document.getElementById("sgtpng");
            } 
            else if (type == "console1"){
                img = document.getElementById("cns1png");
                
            }
            else if (type == "console2"){
                img = document.getElementById("cns2png");
                
            }
            else if (type == "private")
            {
                img = document.getElementById("pvtpng");
            } else if (type == "bulkhead_open")
            {
                img = document.getElementById("blkhdo");
            } else if (type == "bulkhead_closed")
            {
                img = document.getElementById("blkhdc");
            }

            if (img){
                ctx.save();
                if (angle > 0 ) {
                    ctx.translate(x+img.width/2,y+img.height/2);
                    ctx.rotate(angle* Math.PI / 180);
                    ctx.drawImage(img,-img.width/2,-img.height/2,img.width*scale,img.height*scale);
                } else
                {
                    ctx.drawImage(img,x,y,img.width*scale,img.height*scale);
                }
                ctx.restore();
            }
            else{
                ctx.fillStyle = color;
                ctx.fillRect(x,y,width,height);
            }
            
    
            if (tag != null)
            {
                ctx.fillStyle = "green";
                ctx.font = (12*scale)+"px Impact";
                ctx.textAlign = "stretch";
                ctx.fillText(tag,x + (img.width*scale)+5,y+(img.height*scale));
            }
            
        }
    }


    bcdraw_clear(){
        var cnv = document.getElementById("bg_canvas");
        var ctx = cnv.getContext('2d');

        var cW = cnv.width;
        var cH = cnv.height;

        ctx.clearRect(0,0,cW,cH);
    }

    drawDataURIOnCanvas(x,y) {

        var canvas = document.getElementById("bg_canvas");
        var img = document.getElementById("timg");
        canvas.getContext("2d").drawImage(img, x, y);
    }

    drawEntities(entities){
        var cnv = document.getElementById("bg_canvas");

        var cW = cnv.width;
        var cH = cnv.height;

        for(var i=0;i<entities.length;i++){
            var ent = entities[i];
            switch (ent.type) {
                case "up_wall_full":
                    this.bcdraw_entity(ent.x,0,cW-ent.x,ent.y,"#102f10",ent.tag,ent.type,ent.angle,ent.scale);
                    break;
                case "down_wall_full":
                    this.bcdraw_entity(ent.x,ent.y,cW-ent.x,cH,"#102f10",ent.tag,ent.type,ent.angle,ent.scale);
                    break;
                case "left_wall_full":
                    this.bcdraw_entity(0,ent.y,ent.x,cH-ent.y,"#102f10",ent.tag,ent.type,ent.angle,ent.scale);
                    break;
                case "right_wall_full":
                    break;
                default:
                    this.bcdraw_entity(ent.x,ent.y,5,5,"purple",ent.tag,ent.type,ent.angle,ent.scale);
                    break;
            }
        }
    }
}

// Story code
class Condition{
    constructor(name){
        this.name = name;
        this.completed = false;
    }
}

class Scene{
    constructor(conditions,conversation,inits,entities){
        this.conditions = conditions;
        this.conversation = conversation;
        this.isComplete = false;
        this.inits = inits;
        this.entities = entities;
    }

    completeCondition(conditionName){
        var allConditionsComplete = true;
        for(var i =0;i<this.conditions.length;i++){
            if(this.conditions[i].name == conditionName)
            {
                this.conditions[i].completed = true;
            }

            allConditionsComplete = allConditionsComplete && this.conditions[i].completed;
        }

        this.isComplete = allConditionsComplete;
    }

    init(){
        
        messageManager.chat = this.conversation;
        messageManager.chatIndex = 0;

        
        if(this.inits)
            for(var i =0;i<this.inits.length;i++){
                this.inits[i]();
            }

        radar.drawEntities(this.entities);
        messageManager.progressChat();

        
    }
}

class Episode{
    constructor(scenes){
        this.scenes = scenes;
        this.isComplete = false;
        this.currSceneIndex = 0;
        this.currScene = this.scenes[this.currSceneIndex];
        
    }

    completeCondition(conditionName){
        this.currScene.completeCondition(conditionName);
        if(this.currScene.isComplete){
            this.currSceneIndex++;
            if(this.scenes.length > this.currSceneIndex && this.currSceneIndex > 0) {
                this.currScene = this.scenes[this.currSceneIndex];
                this.currScene.init();
            }
        }
    }

    getConditions(){
        return this.currScene.conditions;
    }

    init(){
        this.currScene.init();        
    }
}

class Story{
    constructor(episodes){
        this.episodes = episodes;
        this.name = "Nullspace";
        this.currEpisodeIndex = 0;
        this.currEpisode = this.episodes[this.currEpisodeIndex];
    }

    completeCondition(conditionName){
        this.currEpisode.completeCondition(conditionName);
        if(this.currEpisode.isComplete){
            this.currEpisodeIndex++;
            if(this.episodes.length > this.currEpisodeIndex && this.currEpisodeIndex > 0) {
                this.currEpisode = this.episodes[this.currEpisodeIndex];
                this.currEpisode.init();
            }

            
        }
    }

    getConditions(){
        return this.currEpisode.getConditions();
    }

    init(){
        this.currEpisode.init();
    }

}



class MessageManager{

    constructor(){
        this.printingMessage = false;
        this.scr2 = document.getElementById("screen2");
        this.printSpeed = 20;
        this.chat = [];
        this.chatIndex=0;
    }
    printMessage(message,speed){
        this.printingMessage = true;
        var mb = document.getElementById("message_box");
    
        if (mb == null){

            mb = document.createElement("div");
            mb.id = "message_box";
    
            mb.addEventListener("click", this.progressChat);
            mb.className ="placed";
    
            this.scr2.appendChild(mb);
        } else{
            if(mb.firstChild)
                mb.removeChild(mb.firstChild);
        }
    
        var cd = document.createElement("code");
        
        mb.appendChild(cd);
    
        intervalPrint(cd,message,speed,function(){
            messageManager.printingMessage = !messageManager.printingMessage;
        });
        
    }

    closeMessages(){
        var mb = document.getElementById("message_box");
        if(mb != null)
            mb.remove();
    }

    progressChat(){
        if (!messageManager.printingMessage){
            if(messageManager.chatIndex < messageManager.chat.length){
                messageManager.printMessage(messageManager.chat[messageManager.chatIndex++],messageManager.printSpeed);
            } else {
                messageManager.closeMessages();
            }
        }
    }
}



// Helper code
function intervalPrint(target,message,interval,callback = null){
    if(target != null && message){
        target.innerHTML += message[0];
        if(message.length > 1){
            setTimeout(() => {
                intervalPrint(target,message.substring(1,message.length),interval,callback)
            }, interval);
        } else if (callback != null){
            callback();
        }
    }
}

function focusPrompt(){
    var prompt = document.getElementById("prompt_input");
    if(prompt){
        prompt.focus();
    }
}
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}





function bootstrapStory(){

    story = new Story(
        [
            new Episode(
                [
                    
                    new Scene(
                        [
                            new Condition("briefing_opened")
                        ],
                        [
                            "(Sullivan: ...)",
                            "(Sullivan: This starship coffee is horrible... and I've barely gotten any sleep)",
                            "(Sullivan: Anyway, I should review the mission briefing once more before the start)",
                            "(Sullivan: It should be in my home directory under the name gamm2.brf)",
                            "(Sullivan: If I remmember correctly these should be opened with the brfread tool, so i need to enter brfread gamm2.brf into the terminal)"
                        ],
                        [
                            function() {
                                console.log("setting up scene 1");
                                console.log("setting up machine filesystem");
                                currentMachine.touch("gamm2.brf");
                                console.log("setting up machine programs");
                                currentMachine.addProgram(
                                    new Program("brfread","render the briefing.",
                                    function(args){
                                        if (!args || args.length == 0)
                                            return "file name not supplied, enter: brfread filename"; 
                                        if (args && args[0] == "gamm2.brf"){
                                            story.completeCondition("briefing_opened");
                                            return "Rendering briefing...";
                                        }
                                        return "File not found!";
                                    })
                                );
                            }
                        ],
                        [

                        ]
                    ),
                    new Scene(
                        [
                            new Condition("establish_remote_connection")
                        ],
                        [
                            "HIGH COMMAND: Greetings mr. Sullivan, as you are most probably aware of by now, an unmarked abandoned space ship has been located at the edge of our solar system.",
                            "HIGH COMMAND: Its origins are unknown, but technology bears resemblance to our own.",
                            "HIGH COMMAND: We suspect it belongs to a rogue fraction of human kind but further investigation is needed in order to determine its true origins and its purpose.",
                            "HIGH COMMAND: For that reason a recon task force has been assigned to search the ship for any survivors or piece of information that could shed light on the whole scenario.",
                            "HIGH COMMAND: You will be in charge of assisting the deployed team remotely with all the tech related business - override security protocols, bringing ships systems into operational state, hack into data cores, etc.",
                            "HIGH COMMAND: We cannot give you any precise guidelines as we don't know what to expect, but we count on your adaptability and improvisation skills. You are, after all, one of the finest.",
                            "HIGH COMMAND: Soldiers are expendable, information is invaluable. make us proud!",
                            "(Sullivan: Well that sounded as cheerfull as can be...)",
                            "(Sullivan: The marines should be done setting up the remote access box by now. If so i should be able to access it using the tunnel command)",
                            "(Sullivan: The command should be tunnel auxterm if i remember the address correctly)"
                        ],
                        [
                            function(){
                                console.log("setting up scene 2");
                                currentMachine.addProgram(
                                    new Program("tunnel","creates a terminal to remote hardware",
                                    function(args){
                                        if (args == "auxterm"){
                                            currentScreen.setInputBlocking(true);
                                            setTimeout(
                                                function(){
                                                    currentScreen.appendCommandResult("Success: Connection Established!");
                                                    story.completeCondition("establish_remote_connection");
                                                    currentScreen.setInputBlocking(false);
                                                },3000
                                            )
                                            
                                            return "Attempting to connect to auxterm...";
                                        } else{
                                            return "no such device available";
                                        }
                                    })
                                );
                            }  
                        ],
                        [

                        ]
                    ),
                    new Scene(
                        [
                            new Condition("open_door")
                        ],
                        [
                            "Sgt Whitcomb: Hello",
                            "Sgt Whitcomb: Hellooooo... tech guy?",
                            "Sgt Whitcomb: Don't know if you see me typing or not. I've connected everything following the instructions you provided.",
                            "Sgt Whitcomb: You should be hooked with the ships auxiliary terminal.",
                            "Sullivan: Affirmative, im in. Great work.",
                            "Sullivan: How was the landing?",
                            "Sgt Whitcomb: Smooth, we did however puncture a greater hole in the hull than expected, but we managed to seal it off.",
                            "Sgt Whitcomb: Once we get the life support up and running, there should be no leaking.",
                            "Sullivan: We should get to it then. i believe you air supply is limited and exploring the whole ship is not a short task.", 
                            "Sgt Whitcomb: Agreed!",
                            "Sgt Whitcomb: We are trapped in this ships section though. Tried to pry open this door leading to life support room but its not going anywhere.",
                            "Can you try to access the control from your end?",
                            "Sullivan: on it. give me a few..."

                        ],
                        [
                            function(){
                                console.log("Oxyoxy...");
                                radar.bcdraw_clear();
                            }
                        ],
                        [
                            new RadarEntity(0,30,"up_wall_full",null),
                            new RadarEntity(90,90,"down_wall_full",null),
                            new RadarEntity(30,0,"left_wall_full",null),
                            new RadarEntity(35,55,"sargeant","Sgt Whitcomb",0,1.5),
                            new RadarEntity(35,32,"console2","Terminal",0,1.5),
                            new RadarEntity(180,37,"bulkhead_closed","Bulkhead",0,2.5),
                        ]
                    ),
                    new Scene(
                        [
                            new Condition("door_reached")
                        ],
                        [
                            "Sgt Whitcomb: Im going there now..."

                        ],
                        [
                            function(){
                                console.log("Oxyoxy...");
                                radar.bcdraw_clear();
                            }
                        ],
                        [
                            new RadarEntity(0,30,"up_wall_full",null),
                            new RadarEntity(90,90,"down_wall_full",null),
                            new RadarEntity(30,0,"left_wall_full",null),
                            new RadarEntity(35,55,"sargeant","Sgt Whitcomb",0,1.5),
                            new RadarEntity(35,32,"console2","Terminal",0,1.5),
                            new RadarEntity(180,37,"bulkhead_open",null,0,2.5),
                        ]
                    ),
                    new Scene(
                        [
                            new Condition("escape")
                        ],
                        [
                            "Sgt Whitcomb: What is that????"

                        ],
                        [
                            function(){
                                console.log("Oxyoxy...");
                                radar.bcdraw_clear();
                            }
                        ],
                        [
                            new RadarEntity(0,30,"up_wall_full",null),
                            new RadarEntity(150,150,"down_wall_full",null),
                            new RadarEntity(30,0,"left_wall_full",null),
                            new RadarEntity(200,50,"marine","Sgt Black"),
                            new RadarEntity(70,90,"unknown","unknown")
                        ]
                    )
                ]
            )
        ]
    )
}

function endMovement(){
    story.completeCondition("door_reached");
}
function moveSgt(re){
    radar.bcdraw_clear();
    if(!re){
        var re = new RadarEntity(50,50,"marine","Sgt Black");
    }

    re.x++;
    if(re.x > 200){
        endMovement();
        return;
    }
    radar.drawEntities([re]);
    window.requestAnimationFrame(
        function(){
            moveSgt(re);
        }
    )
}


// Globals
var radar;
var messageManager;
var currentMachine;
var currentScreen;
var currentMinigame;
var words = ["unknown","continue","buffer","overflow","cross","site","reflection","middle","man","certificate","foreach","interface","dissasemble","working","set","namespace","hack","mysql","injection"];
var story;
// Main
function init(){
    radar = new Radar(10,2);
    messageManager = new MessageManager();
    currentMachine = new Machine();
    currentScreen = new InteractiveScreen();
    currentScreen.setState("OK");
    bootstrapStory();
    story.init();
    
}



