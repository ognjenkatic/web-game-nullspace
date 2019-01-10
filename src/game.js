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
        ctx.fillStyle = "green";
        ctx.fillRect(x,y,size,size);
    }

}


// Story code
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
        alerted = true;
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



var chat = ["Josh: Jim, help me!","Jim: What is it?","Josh: I can see something outside!","Jim: Josh?","Jim: Josh, are you there???","(I can still see him on radar...maybe i should hack into the cameras there and see whats going on...)"];

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
    mcdraw_lines(2,0);
    progressChat();
    bcdraw_entity(150,140,5,"red");
}



