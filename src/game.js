// Canvas radar code
var alertRadarStroke = "rgba(200,0,0,0.5)";
var calmRadarStroke = "rgba(0,200,0,0.5)";

var currentRadarStroke = calmRadarStroke;

var alerted = false;

function fcdraw_grid(resolution){
    var cnv = document.getElementById("fg_canvas");
    var ctx = cnv.getContext('2d');

    var cW = cnv.width;
    var cH = cnv.height;
    
    ctx.strokeStyle = "rgba(0,255,0,0.3)";
    ctx.lineWidth = "0.5";

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

function mcdraw_lines(frequency,startPos){
    var cnv = document.getElementById("mg_canvas");
    var ctx = cnv.getContext('2d');

    var cW = cnv.width;
    var cH = cnv.height;
    
    ctx.strokeStyle = currentRadarStroke;
    ctx.lineWidth = "0.5";

    ctx.beginPath();
    ctx.moveTo(startPos,0);
    ctx.lineTo(startPos,cH);
    ctx.stroke();

    if(startPos >= cW){
        ctx.clearRect(0,0,cW,cH);
        startPos=0;
        if(alerted){
            currentRadarStroke = alertRadarStroke;
        }else
        {
            currentRadarStroke = calmRadarStroke;
        }
    }

    window.requestAnimationFrame(function()
    {
        mcdraw_lines(frequency,startPos+frequency);
    });
}

function bcdraw_entity(x,y,size,color){
    var cnv = document.getElementById("bg_canvas");
    var ctx = cnv.getContext('2d');

    var cW = cnv.width;
    var cH = cnv.height;

    if(x > 0 && x < cW && y > 0 && y < cH){
        ctx.fillStyle = color;
        ctx.fillRect(x,y,size,size);
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
    constructor(conditions,conversation,inits){
        this.conditions = conditions;
        this.conversation = conversation;
        this.isComplete = false;
        this.inits = inits;
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
        
        chat = this.conversation;
        chatIndex = 0;

        if(this.inits)
            for(var i =0;i<this.inits.length;i++){
                this.inits[i]();
            }

        progressChat();

        
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

//Init story
var story = new Story(
    [
        new Episode(
            [
                new Scene(
                    [
                        new Condition("open_door"),
                        new Condition("lock_door")
                    ],
                    [
                        "Jim: We need to open this door somehow...","(Maybe i can hack that pannel over there...)"
                    ],
                    [
                        function() {bcdraw_entity(120,120,10,"red");}
                    ]
                ),
                new Scene(
                    [
                        new Condition("enable_oxygen")
                    ],
                    [
                        "Jim: Well done...now we need the oxygen","(Okay that makes sense...)"
                    ],
                    [
                        function(){
                            console.log("Oxyoxy...");
                            bcdraw_entity(200,150,20,"yellow");
                            alerted = true;
                        }
                    ]
                )
            ]
        )
    ]
)



function printMessage(message,speed){
    printingMessage = true;
    var mb = document.getElementById("message_box");

    if (mb == null){
        var scr2 = document.getElementById("screen2");
        mb = document.createElement("div");
        mb.id = "message_box";

        mb.addEventListener("click", progressChat);
        mb.className ="placed";

        scr2.appendChild(mb);
    } else{
        if(mb.firstChild)
            mb.removeChild(mb.firstChild);
    }

    var cd = document.createElement("code");
    
    mb.appendChild(cd);

    intervalPrint(cd,message,speed,function(){
        printingMessage = !printingMessage;
    });
    
}

function closeMessages(){
    var mb = document.getElementById("message_box");
    if(mb != null)
        mb.remove();
}

function progressChat(){
    if (!printingMessage){
        if(chatIndex < chat.length){
            printMessage(chat[chatIndex++],70);
        } else {
            closeMessages();
        }
    }
}

var chat;
var chatIndex=0;
var printingMessage = false;

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






function init(){
    fcdraw_grid(10);
    mcdraw_lines(4,0);
    story.init();
    bcdraw_entity(150,140,5,"red");
}



