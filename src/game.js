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

    constructor(terminalColor,ip="0.0.0.0",mac="00:00:00:00:00"){
        this.state = "OK";
        this.fileSystem = new FS();
        this.currentUser = "root";
        this.ip = ip;
        this.cwd = this.fileSystem.rootDir.getChildEntry("#home");
        this.mac = mac;
        this.services = [];
        this.programs = [];
        this.commandStack = [];
        this.commandStackIndex = 0;
        this.terminalColor = terminalColor;
    }

    addProgram(program){
        this.programs.push(program);
    }

    updateProgram(name,callback){
        for(var i=0;i<this.programs.length;i++){
            if(this.programs[i].name == name){
                this.programs[i].callback = callback;
            }
        }

        this.addProgram(new Program(name,"No description",callback));
    }

    pushHistory(command){
        this.commandStack.push(command);
        this.commandStackIndex = this.commandStack.length;
    }

    history(command,direction){
        if (this.commandStack.length == 0)
            return command;
        if (direction == "up") {
            if ( this.commandStackIndex > 0){
                this.commandStackIndex--;
            }

        }
        else if (direction == "down") {
            if (this.commandStackIndex < this.commandStack.length-1){
                this.commandStackIndex++;
            } else {
                return "";
            }
        }
        return this.commandStack[this.commandStackIndex];
    }

    runProgram(name,args=""){
        console.log("gm");
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
            case("logread"):{
                return this.logread(args[0]);
            }
            case("tunnel"):{
                return this.tunnel(args[0]);
            }
            case("netscan"):{
                return this.netscan();
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
                this.cd(args[0]);
                return "";
            }
            case("cls"):{
                return this.cls();
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

    cls(){
        var content = document.getElementById("display_content");
        if(content){
            content.innerHTML = "";
        }

        return "";
    }
    netscan(){
        var retval = "IP                 MAC\n"+
                     "--------------------------------------\n";
        var padding ="       ";

        for(var i=0;i<network.machines.length;i++){
            retval += network.machines[i].ip+padding+network.machines[i].mac+"\n";
        }

        return retval;
    }

    logread(name){
        var logEntry = this.cwd.getChildEntry(name);
        if (logEntry && logEntry.name.endsWith(".log")){
            messageManager.chat = logEntry.content;
            messageManager.chatIndex = 0;
            messageManager.progressChat();

            return "Displaying log."
        }
        
        return "File not found.";
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

    tunnel(address){
        for(var i=0;i<network.machines.length;i++){
            if (network.machines[i].ip == address){
                connectToMachine(network.machines[i]);
            }
        }

        return this.cls();
    }

    ls(){
        var files = "";
        var i=0;
        for(i;i<this.cwd.childEntries.length;i++){
            files += this.cwd.childEntries[i].name.replace("#","")+"\n";
        }

        return files;
    }

    touch(name,content = ""){
        var newFile = new FSFile(name,"755",content,this.fileSystem.cwd);
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
    constructor(machines=[]){
        this.machines = machines;
    }

    scan(){
        return this.machines;
    }
}

class HUD{
    constructor(){
        this.HUD = null;
    }

    drawHUD(){
        var scr2 = document.getElementById("screen2");
        this.HUD = document.createElement("div");
        this.HUD.id = "HUD";
        scr2.appendChild(this.HUD);
    }

    showHUD(){
        this.HUD.style.display = "block";
    }

    hideHUD(){
        this.HUD.style.display = "none";
    }
}
class TypingMinigame{
    constructor(speed,dictionary,targetHits,maxMisses,successCallback,failCallback){
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
        this.percent = 0;
        this.streakCount = 0;
        this.successCallback = successCallback;
        this.failCallback = failCallback;
        this.hackingSpeed = 0;
        this.lastHitTime = 0;
        this.gameStartTime = 0;
    }


    reset(){
        this.hackIndex = 0;
        this.hack = intervalPrint.toString();
        this.cmplt = false;
        this.currentHits = 0;
        this.currentMisses = 0;
        this.percent =0;
        this.streakCount=0;
    }
    drawProgressHUD(){
        var hpc = document.createElement("div");
        var hpb = document.createElement("div");
        var heb = document.createElement("div");
        var spd = document.createElement("div");

        hpc.id = "HUD_progress_container";
        hpb.id = "HUD_progress_bar";
        heb.id = "HUD_misses_bar";
        spd.id = "HUD_speed_bar";

        hpc.appendChild(hpb);
        hpc.appendChild(heb);
        hpc.appendChild(spd);

        var HUD = document.getElementById("HUD");

        HUD.appendChild(hpc);
    }

    updateProgressHUD(){
        var hpb = document.getElementById("HUD_progress_bar");
        var spd = document.getElementById("HUD_speed_bar");

        var heb = document.getElementById("HUD_misses_bar");
        var mss = (this.currentMisses / this.maxMisses)*100;

        var wdt = (this.currentHits / this.targetHits)*100;
        var speed = 60*this.currentHits / ((Date.now() - this.gameStartTime)/1000);
        if (heb){
            heb.style.width = mss+"%";
            heb.setAttribute("data-content","Countermeasures "+Math.round(mss)+"% deployed");
        }
        if (spd){
            spd.style.width = (speed /60)*100 +"%";
            spd.setAttribute("data-content",Math.round(speed)+" instructions per minute");
            spd.style.backgroundColor = "rgb("+154*(Math.round(speed)/60)+", 18,179)";
        }
        if (hpb){
            hpb.setAttribute("data-content","Exploit "+Math.round(wdt)+"% complete");
            hpb.style.width = wdt+"%";
        }
        
        
        
        
    }



    destroyHUD(){

        var hpc = document.getElementById("HUD_progress_container");
        if (hpc){
            hpc.remove();
        }
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

    triggerSuccess(){
        var content = document.getElementById("display_content");
        var hc = document.getElementById("hack_content");
        if (hc){
            var mss = (this.currentMisses / this.maxMisses)*100;
            var speed = 60*this.currentHits / ((Date.now() - this.gameStartTime)/1000);
            var lic = document.createElement("li");
            var pr = document.createElement("pre");
            pr.innerHTML += "\n\nExploitation successfull\nCountermeasures stopped at "+Math.round(mss)+"%\nCoded at "+Math.round(speed)+" instructions per minute\n\n";
            lic.appendChild(pr);
            content.appendChild(lic);
            hc.id = "hack_content_old";
        }
        this.successCallback();
    }

    triggerFailure(){
        this.displayedElements.splice(0,this.displayedElements.length);
        this.failCallback();
        currentScreen.setState("OK");
        var hc = document.getElementById("hack_content");
        if (hc){
            hc.innerHTML += "\n\nError: 0x6e6572640a detected!\nExiting environment\n\n"
            hc.id = "hack_content_old";
        }
        console.log("GAME OVER MAN");
    }

    fall(elly){
        var tpar = parseInt(elly.style.top.replace("px",""))
        if(!this.isRunning){
            elly.remove();
        }
        else if(tpar <= 768){
            
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
                this.animateFailure();
                this.currentMisses++;
                this.streakCount = 0;
                return;
            }
        }
    }

    validateInput(input){
        for(var i=0;i<this.displayedElements.length;i++){
            if(this.displayedElements[i].innerHTML == input){
                this.displayedElements[i].style.opacity = 1;
                this.animateSuccess(this.displayedElements[i]);
                this.displayedElements.splice(i,1);
                this.currentHits++;
                this.streakCount++;
                this.lastHitTime = Date.now();
                this.hackingSpeed = this.currentHits / (Date.now() - this.gameStartTime);
                
                return true;
            }
        }
        return false;
    }

    animateFailure(){
        if (!this.isRunning){
            return;
        }
        if (this.percent < 100){
            var bk = document.getElementById("screen1");
            //bk.style.background = "linear-gradient(to bottom, red 0%,red "+this.percent+"%,orange 0%)";
            this.percent+=10;
            window.requestAnimationFrame(
                function(){
                    currentMinigame.animateFailure();
                }
            )
        }else{
            this.percent = 0;
            var bk = document.getElementById("screen1");
            //bk.style.background = "orange";
        }
        

    }
    animateSuccess(elly){
        if (!this.isRunning){
            return;
        }
        var fs =parseInt(window.getComputedStyle(elly).getPropertyValue("font-size"));
        if (fs > 120){
            elly.remove();
        }else{
            fs+=1;
            elly.style.fontSize = fs+"px";
            elly.style.opacity-=0.01;
            window.requestAnimationFrame(
                function(){
                    currentMinigame.animateSuccess(elly);
                }
            );
        }
    }

    start(){
        this.isRunning = true;
        hud.showHUD();
        this.drawProgressHUD();
        this.refresh();
        this.gameStartTime = Date.now();
    }

    stop(){
        this.isRunning = false;
        this.destroyHUD();
        hud.hideHUD();
    }

    
    refresh(){
        this.updateProgressHUD();
        if (this.currentHits >= this.targetHits){
            stop();
            this.triggerSuccess();
        }
        else if (this.currentMisses < this.maxMisses){
            var wcon = this.dictionary[getRndInteger(0,this.dictionary.length)];
            var drl = document.createElement("label");
            drl.className = "droppy";
            drl.style.left = 100 + getRndInteger(0,800)+"px";
            drl.style.top = "0px";
            drl.style.fontSize = 25 + getRndInteger(0,30);
            drl.innerHTML = wcon;
            document.getElementById("fall_container").appendChild(drl);
            
            
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
            this.triggerFailure();
        }
    }

}

class InteractiveScreen{
    constructor(){
        this.scr1 = document.getElementById("screen1");
        this.clear();
    }

    setColor(color){
        this.scr1.style.backgroundColor = color;
    }
    updatePromptInfo(){
        var pinfo = document.getElementById("prompt_info");
        pinfo.innerHTML = currentMachine.promptInfo();
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


        if(state == "hacking" && currentMinigame){
            currentMachine.state = "hacking";
            currentMinigame.reset();
            var cln = input.cloneNode();
            cln.addEventListener("keyup",this.fetchHackInput);
            parent.replaceChild(cln,input);
            cln.focus();
            cln.value = "";
            currentMinigame.start();
            document.getElementById("screen1").style.backgroundColor = "rgb(40,0,0)";
            document.getElementById("display_content").style.opacity = "0.5";
            document.getElementById("prompt").style.opacity = "0.5";
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
            document.getElementById("display_content").style.opacity = "1";
            document.getElementById("prompt").style.opacity = "1";
            cln.focus();
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
            hackContent = document.createElement("code");
            hackContent.id = "hack_content";
            hackParent.appendChild(hackContent);
            content.appendChild(hackContent);
        }

        if (currentMinigame.validateInput(input.value)){
            currentMinigame.writeHack(hackContent,currentMinigame.hack,currentMinigame.hackIndex+input.value.length*4,40);
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

        var input = document.getElementById("prompt_input");
        var content = document.getElementById("display_content");

        var input_val = input.value;

        if (event.keyCode == 27){
            currentScreen.hide();
            menu.display();
        } else if (event.keyCode == 38){
            input.value = currentMachine.history(input_val,"up");
        } else if (event.keyCode == 40){
            input.value = currentMachine.history(input_val,"down");
        }
        else if(event.keyCode === 13 )
        {
            

            var result = currentScreen.processCommandInput(input_val);
            if (input_val != "")
                currentMachine.pushHistory(input_val);

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
            return "Starting RFE exploitation framework!\n\nSpawning new interactive shell...\nAccessing proxy...\nWaiting for instructions...\n\n";
        } else
        {
            return currentMachine.runProgram(cmnd,args);
            
        }
    }

    clear(){
        document.getElementById("display_content").innerHTML = "";
    }

    hide(){
        document.getElementById("display").style.display = "none";
        document.getElementById("prompt").style.display = "none";
    }

    display(){
        document.getElementById("display").style.display = "block";
        document.getElementById("prompt").style.display = "block";
    }

    
}

// Canvas radar code
class RadarEntity{
    constructor(x,y,type,tag,angle=0,scale=1,width=10,height=10){
        this.type = type;
        this.tag = tag;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.scale = scale;
        this.width = width;
        this.height = height;
    }
}

class Radar{
    constructor(resolution,lineFreq,entities = null){

    
        this.alerted = false;
        this.alertRadarStroke = "rgba(200,0,0,0.8)";
        this.calmRadarStroke = "rgba(0,200,0,0.5)";
        this.stopped = false;
        this.currentRadarStroke = this.calmRadarStroke;
        this.entities = entities;

        this.bcdraw_clear();
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
            if(!ccontext.stopped)
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
                if (type == "console2")
                    ctx.fillStyle = "#01800270";
                else
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

    appendEntity(entity){
        this.entities.push(entity);
    }

    prependEntity(entity){
        this.entities.unshift(entity);
    }

    removeEntity(tag){
        for(var i=0;i<this.entities.length;i++){
            if(this.entities[i].tag == tag){
                this.entities.splice(i,1);
                return;
            }
        }
    }
    animateEntity(tag,tarx,tary){
        for(var i=0;i<this.entities.length;i++){
            if(this.entities[i].tag == tag){
                if(this.entities[i].x != tarx || this.entities[i].y != tary){
                    this.entities[i].x += Math.sign(tarx - this.entities[i].x);
                    this.entities[i].y += Math.sign(tary - this.entities[i].y);
                    window.requestAnimationFrame(
                        function(){
                            radar.bcdraw_clear();
                            radar.animateEntity(tag,tarx,tary);
                            radar.drawEntities();
                        }
                    );
                }
            }
        }
    }

    drawEntities(entities = null){
        this.bcdraw_clear();

        var cnv = document.getElementById("bg_canvas");
        var cW = cnv.width;
        var cH = cnv.height;

        for(var i=0;i<this.entities.length;i++){
            var ent = this.entities[i];
            switch (ent.type) {
                case "bound_wall":
                    this.bcdraw_entity(ent.x,ent.y,ent.width,ent.height,"#102f10",ent.tag,ent.type,ent.angle,ent.scale);
                    break;
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

        if (this.entities.length > 0)
            radar.entities = this.entities;
    

        for(var i=0;i<this.conditions.left;i++){
            this.conditions[i].completed  =false;
        }
        if(this.inits)
            for(var i =0;i<this.inits.length;i++){
                this.inits[i]();
            }
        messageManager.chat = this.conversation;
        messageManager.chatIndex = 0;
        messageManager.progressChat();


    }
}

class Episode{
    constructor(scenes,title,code){
        this.scenes = scenes;
        this.isComplete = false;
        this.currSceneIndex = 0;
        this.currScene = this.scenes[this.currSceneIndex];
        this.title = title;
        this.code = code;
        
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

    reset(){
        this.currSceneIndex = 0;
        this.isComplete = false;
        this.currScene = this.scenes[this.currSceneIndex];
        //this.init();
    }

    getConditions(){
        return this.currScene.conditions;
    }

    init(){

        if(radar){
            radar.bcdraw_clear();
        }
        radar = new Radar(10,2);
        hud = new HUD();
        hud.drawHUD();
        messageManager = new MessageManager();
        currentMachine = new Machine();
        currentScreen = new InteractiveScreen();
        currentScreen.setState("OK");
        this.currScene.init();
        document.title = this.title;      
    }
}

class Story{
    constructor(episodes){
        this.episodes = episodes;
        this.name = "Nullspace";
        this.currEpisodeIndex = 0;
        this.currEpisode = null;
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

    loadEpisode(index,code){
        if (this.episodes.length > index){
            if (index == 0 || this.episodes[index].code == code){
                this.currEpisode = this.episodes[index];
                this.currEpisode.reset();
                console.log("loaded "+this.episodes[index].title);
                return true;
            }
        }
        return false;
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
        this.forceComplete = false;
        this.callback = null;
    }

    setCallback(callback){
        this.callback = callback;
    }
    printMessage(message,speed){
        this.printingMessage = true;
        var mb = document.getElementById("message_box");
        

        if (mb == null){

            mb = document.createElement("div");
            mb.id = "message_box";
    
            var mbt = document.createElement("div");
            mbt.innerHTML = "{click}";
            mbt.id = "message_box_tooltip";

            mb.appendChild(mbt);

            mb.addEventListener("click", this.progressChat);
            mb.className ="placed";
    
            this.scr2.appendChild(mb);
        } else{
            var cnod = mb.childNodes[1];

            if(cnod)
                mb.removeChild(cnod);
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
                if (messageManager.callback){
                    messageManager.callback();
                    messageManager.callback = null;
                }
            }
        } else
            messageManager.forceComplete = true;
    }
}

class Menu{
    constructor(){

    }

    display(){

        if (!story || !story.currEpisode)
        {
            document.getElementById("exit_menu_button").style.display = "none";
        }else
        {
            document.getElementById("exit_menu_button").style.display = "block";
        }
        document.getElementById("menu").style.display = "block";
    }

    hide(){
        document.getElementById("menu").style.display = "none";
    }


}

// Helper code
function intervalPrint(target,message,interval,callback = null){
    if(target != null && message){
        if (messageManager.forceComplete){
            target.innerHTML += message;
            callback();
            messageManager.forceComplete =false;
        } else{
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

                                var starter = new Machine("rgb(27, 24, 26)","192.168.0.12","AA:AA:AA:AA:AA");
                                network = new Network();
                                network.machines =
                                [
                                    starter,
                                    new Machine("rgb(53, 17, 39)","192.168.0.10","FF:FF:FF:FF:FF")
                                ];
                                connectToMachine(starter);
                                
                                
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
                            "(Sullivan: The command should be tunnel T19 if i remember the address correctly)"
                        ],
                        [
                            function(){
                                console.log("setting up scene 2");
                                currentMachine.addProgram(
                                    new Program("tunnel","creates a terminal to remote hardware",
                                    function(args){
                                        if (args == "T19"){
                                            currentScreen.setInputBlocking(true);
                                            setTimeout(
                                                function(){
                                                    currentMachine.runProgram("cls");
                                                    currentScreen.appendCommandResult("Success: Connection Established!");
                                                    story.completeCondition("establish_remote_connection");
                                                    currentScreen.setInputBlocking(false);
                                                },3000
                                            )
                                            
                                            return "Attempting to connect to T19...";
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
                            new Condition("hack_t19")
                        ],
                        [
                            "<<CONNECTED TO T19>>",
                            "Sgt Whitcomb: Hello?",
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
                            "Sullivan: I'm on it. give me a few..."

                        ],
                        [
                            function(){
                                currentMachine.touch("sully_064.log",
                                [
                                    "(Sullivan: Brush up on MK41 carriers for mission"
                                ]);
                                currentMachine.addProgram(
                                    new Program(
                                        "arp", "Recover the arp table",
                                        function(){
                                            return "Interface: 169.254.80.80 --- 0x5\n"+
                                              "Internet Address      Network ID            Type\n"+
                                              "169.254.255.255       ff-ff-ff-ff-ff-ff     static\n"+ 
                                              "224.0.0.7             01-00-5e-00-00-07     static\n"+    
                                              "224.0.0.22            01-00-5e-00-00-16     static\n"+    
                                              "224.0.0.251           01-00-5e-00-00-fb     static\n"+    
                                              "224.0.0.252           01-00-5e-00-00-fc     static\n"+    
                                              "239.0.0.250           01-00-5e-00-00-fa     static\n"+    
                                              "239.255.255.250       01-00-5e-7f-ff-fa     static\n";
                                        }

                                    )
                                )
                                console.log("Setting up scene 3");
                                console.log("Setting up typing minigame");
                                currentMinigame = new TypingMinigame(1,words,10,10,
                                    function(){
                                        story.completeCondition("hack_t19");
                                    },
                                    function(){
                                        console.log("Hack failed");
                                    });
                                // TO-DO when reloading level it doesnt wipe old 
                                radar.bcdraw_clear();
                                radar.drawEntities();
                            }
                        ],
                        [
                            new RadarEntity(0,30,"up_wall_full",null),
                            new RadarEntity(90,90,"bound_wall",null,0,1,200,400),
                            new RadarEntity(30,0,"left_wall_full",null),
                            new RadarEntity(35,32,"console2","Bulkhead Termina (T19)",0,1.5),
                            new RadarEntity(250,37,"bulkhead_closed","Bulkhead",0,2.5),
                            new RadarEntity(35,55,"sargeant","Sgt Whitcomb",0,1.5),
                        ]
                    ),
                    new Scene(
                        [
                            new Condition("door_reached")
                        ],
                        [
                            "Sgt Whitcomb: Alright, were through, moving on to the life support systems room.",
                        ],
                        [
                            function(){
                                console.log("Setting up scene 4");
                                setTimeout(
                                    function(){
                                        story.completeCondition("door_reached")
                                    }, 6500
                                );
                            },
                            function(){
                                console.log("Clearing radar entries");
                                radar.removeEntity("Bulkhead");
                                radar.prependEntity(
                                    new RadarEntity(250,37,"bulkhead_open",null,0,2.5)
                                );
                                radar.prependEntity(
                                    new RadarEntity(405,32,"console2","Air Terminal (T14)",0,1.5),
                                )
                                radar.prependEntity(
                                    new RadarEntity(290,110,"console2","Turret Terminal (T13)",270,1.5),
                                )
                                radar.drawEntities();
                                radar.animateEntity("Sgt Whitcomb",405,55);
                            }
                        ],
                        [
                            
                        ]
                    ),
                    new Scene(
                        [
                            new Condition("reset_system")
                        ],
                        [
                            "<<CONNECTED TO T14>>",
                            "Sgt Whitcomb: ... this one is on the network as well.",
                            "Sullivan: Excellent work sarge. Whats the status?",
                            "Sgt Whitcomb: Well, it aint a pretty site but nothing is damaged as far as I can see.",
                            "Sullivan: Whats the status of the life support systems?",
                            "Sgt Whitcomb: Both air conditioning and onboard temperature systems are not operational. Everything is flashing red.",
                            "Sullivan: Is there anything on the diagnostics screen? Any specific error message?",
                            "Sgt Whitcomb: Well, temp system has this:",
                            "AIR CONDITIONING SYSTEM OFFLINE; COIL TEMPERATURE CRITICAL; EXITING INSTANCE CALLED; DETERMINING AIR CONDITIONING STATUS...",
                            "Sullivan: Its just a failsafe shutdown. Whats going on with air systems?",
                            "Sgt Whitcomb: It has some blue screen with a bunch of numbers. Want me to read them to you?",
                            "Sullivan: Don't be silly. No need for that. It probably failed on switching from main power to battery backup.",
                            "Sullivan: Listen carefully now, write it down if you have to. I need you to disconnect that machine from the power source completely.",
                            "Sullivan: Find the red button labeled reset somewhere on the control board. Hit that button aproximatly ten times. Connect it back to power and turn it on.",
                            "Sgt Whitcomb: Oh man, the power connection is on the back, we have to move the whole goddamn thing to access it.",
                            "Sullivan: Get to it then. Let me know when you're done",
                            "(Sullivan: nothing to do but sit back and wait now...)"

                        ],
                        [
                            function(){
                                
                                currentMachine.runProgram("cls");
                                messageManager.setCallback(
                                    function(){
                                        
                                        setTimeout(()=>{
                                            story.completeCondition("reset_system");
                                        },8000);
                                        radar.animateEntity("Sgt Whitcomb", 405,85);
                                        radar.animateEntity("Air Terminal (T14)", 405,62);
                                        setTimeout(() => {
                                            radar.animateEntity("Sgt Whitcomb", 390,85);
                                        }, (1000));
                                        setTimeout(() => {
                                            radar.animateEntity("Sgt Whitcomb", 390,32);
                                        }, (2000));
                                        setTimeout(() => {
                                            radar.animateEntity("Sgt Whitcomb", 390,85);
                                        }, (5000));
                                        setTimeout(() => {
                                            radar.animateEntity("Sgt Whitcomb", 405,85);
                                        }, (6000));
                                        setTimeout(() => {
                                            radar.animateEntity("Air Terminal (T14)", 405,32);
                                        }, (7000));
                                        setTimeout(() => {
                                            radar.animateEntity("Sgt Whitcomb",405,55);
                                        }, (7000));
                                        console.log("moving on");
                                    })
                                
                                
                            }
                        ],
                        [
                           
                        ]
                    ),
                    new Scene(
                        [
                            new Condition("connect_to_console")
                        ],
                        [
                            "Sgt Whitcomb: OK, we managed. But it's still not booting up, it's stuck on some sort of recovery screen.",
                            "Sullivan: You did your part. The console is on the network now and i can take over.",
                            "(Sullivan: Right. The schematics show this terminal as named T14, so i should use the tunnel command again to connect to it.)"

                        ],
                        [
                            function(){
                                
                                currentMachine.updateProgram(
                                    "tunnel",
                                    function(args){
                                        if (args == "T14"){
                                            currentScreen.setInputBlocking(true);
                                            setTimeout(
                                                function(){
                                                    currentMachine.runProgram("cls");
                                                    currentScreen.appendCommandResult("Success: Connection Established!");
                                                    currentScreen.appendCommandResult("Warning: System in recovery mode!");
                                                    currentScreen.appendCommandResult("Warning: Unable to restore point, using defaults!");
                                                    currentScreen.appendCommandResult("Warning: Resources partially unavailable!");
                                                    currentScreen.appendCommandResult("Error: No recovery instructions present! Error code 5003.");
                                                    story.completeCondition("connect_to_console");
                                                    currentScreen.setInputBlocking(false);
                                                },3000
                                            )
                                            
                                            return "Attempting to connect to T14...";
                                        } else{
                                            return "no such device available";
                                        }
                                    }); 
                            }
                        ],
                        [
                            
                        ]
                    ),
                    new Scene(
                        [
                            new Condition("hack_t19")
                        ],
                        [
                            "(Sullivan: It seems the system is having problems recovering...)",
                            "(Sullivan: Thankfully that error code indicates theres a problem with one of the auxiliary systems.)",
                            "(Sullivan: As those systems are not critical i can hack to code to bypass them entirely.)"

                        ],
                        [
                            function(){
                                currentMinigame = new TypingMinigame(1,words,20,10,
                                    function(){
                                        story.completeCondition("hack_t19");
                                    },
                                    function(){
                                        console.log("Hack failed");
                                    });
                            }
                        ],
                        [
                            
                        ]
                    ),
                    new Scene(
                        [
                            new Condition("wait_for_air_systems")
                        ],
                        [
                            "Sgt Whitcomb: OK Boss i see you did your thing. Our sensors are picking up oxygen.",
                            "Sgt Whitcomb: The temperature is however, still showing too low.",
                            "Sullivan: Just go and reset the temperature console. It should automatically start up once it sees the air system is up and running.",
                            "(Sullivan: once again...nothing for me to do.)"

                        ],
                        [
                            function(){
                                setTimeout(
                                    function(){
                                        story.completeCondition("wait_for_air_systems");
                                    }, 5000);
                            }
                        ],
                        [
                            
                        ]
                    ),
                    new Scene(
                        [
                            new Condition("unknown")
                        ],
                        [
                            "Sgt Whitcomb: Yeah, i did a reset and now it's asking for some configuration stuff.",
                            "Sullivan: Hm...let me connect and take a look.",
                            "<<END OF DEMO>>"

                        ],
                        [
                            
                        ],
                        [
                            
                        ]
                    ),
                ], "Introductions", ""
            ),
            new Episode(
                [
                    new Scene(
                        [
                            new Condition("test1")
                        ],
                        [
                            "Taljo: Ovo nam je bila bas dobra ideja!",
                            "Kina: Da!"
                        ],
                        [

                        ],
                        [

                        ]
                    )
                ], "PLACEHOLDER", "65699"
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

function toggleMenu()
{
    return false;
}

function enterMenu(){
    if(!menu){
        menu = new Menu();
    }
    menu.display();

}
function exitMenu(){
    if (currentScreen){
        menu.hide();
        currentScreen.display();
    }
}
function loadEpisode(index){
    var code = (index == 0)? "episo1" : prompt("Please enter the episode code:", "");
    var hash = code.hashCode();
    if (story.loadEpisode(index,hash)){
        menu.hide();
        story.init();
        currentScreen.display();
    }
}

function playSound(){
    audio.currentTime=0;
    audio.playbackRate = 8;
    audio.play();
}

function connectToMachine(machine){
    currentMachine = machine;
    if (currentScreen){
        currentScreen.setColor(machine.terminalColor);
        currentScreen.updatePromptInfo();
    }
}

// found online
String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash;
  };


// Globals
var hud;
var radar;
var messageManager;
var currentMachine;
var currentScreen;
var currentMinigame;
var words = ["unknown","continue","buffer","overflow","cross","site","reflection","middle","man","certificate","foreach","interface","dissasemble","working","set","namespace","hack","mysql","injection"];
var story;
var menu;
var currentNetwork;
//var audio = new Audio('type.ogg');
// Main
function init(){
    enterMenu();
    bootstrapStory();
    

}



