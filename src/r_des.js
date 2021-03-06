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
            } else if (type =="chair"){
                img = document.getElementById("chairpng");
            }
            else if (type == "console1"){
                img = document.getElementById("cns1png");
                
            } else if (type =="chair"){
                img = document.getElementById("chairpng");
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

            var wh = width;
            var hh = height;

            if (img){
                wh = img.width;
                hh = img.height;
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
                ctx.fillRect(x,y,scale*width,scale*height);
            }
            
    
            if (tag != null)
            {
                if (type == "console2")
                    ctx.fillStyle = "#01800270";
                else
                    ctx.fillStyle = "green";
                ctx.font = (12*scale)+"px Impact";
                ctx.textAlign = "stretch";
                ctx.fillText(tag,x + (wh*scale)+5,y+(hh*scale));
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
    animateEntity(tag,tarx,tary,speed=1){
        for(var i=0;i<this.entities.length;i++){
            if(this.entities[i].tag == tag){
                if(this.entities[i].x != tarx || this.entities[i].y != tary){
                    this.entities[i].x = this.entities[i].x+speed*(Math.sign(tarx - this.entities[i].x));
                    this.entities[i].y = this.entities[i].y+speed*(Math.sign(tary - this.entities[i].y));
                    window.requestAnimationFrame(
                        function(){
                            radar.bcdraw_clear();
                            radar.animateEntity(tag,tarx,tary,speed);
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
                case "planet":
                    this.bcdraw_entity(ent.x,ent.y,ent.width,ent.height,"blue",ent.tag,ent.type,0,ent.scale);
                    break;
                case "sun":
                    this.bcdraw_entity(ent.x,ent.y,ent.width,ent.height,"yellow",ent.tag,ent.type,0,ent.scale);
                    break;
                case "ship":
                    this.bcdraw_entity(ent.x,ent.y,ent.width,ent.height,"green",ent.tag,ent.type,0,ent.scale);
                    break;
                case "junk":
                    this.bcdraw_entity(ent.x,ent.y,ent.width,ent.height,"gray",ent.tag,ent.type,0,ent.scale);
                    break;
                default:
                    this.bcdraw_entity(ent.x,ent.y,ent.width,ent.height,"purple",ent.tag,ent.type,ent.angle,ent.scale);
                    break;
            }
        }
    }
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
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


function playSound(){
    audio.currentTime=0;
    audio.playbackRate = 8;
    audio.play();
}




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

function doAnimations(){
    
    


    radar.animateEntity("Pvt Blake",30,250,0.1);
    radar.animateEntity("Pvt Johnson",30,280);
    radar.animateEntity("Pvt Wyatt",130,280);
    radar.animateEntity("Sgt Whitcomb",120,250);
    setTimeout(()=>{
        radar.animateEntity("Pvt Blake",30,400);
        radar.animateEntity("Pvt Johnson",30,420);
        radar.animateEntity("Pvt Wyatt",130,420);
        radar.animateEntity("Sgt Whitcomb",120,400);
    },5000);
    setTimeout(()=>{
        radar.animateEntity("Pvt Blake",180,400);
        radar.animateEntity("Pvt Johnson",180,420);
        radar.animateEntity("Pvt Wyatt",270,420);
        radar.animateEntity("Sgt Whitcomb",270,400);
    },10000);
    setTimeout(()=>{
        radar.animateEntity("Pvt Blake",350,400);
        radar.animateEntity("Pvt Johnson",350,420);
        radar.animateEntity("Pvt Wyatt",430,420);
        radar.animateEntity("Sgt Whitcomb",430,400);
    },17000);
    setTimeout(()=>{
        radar.animateEntity("Pvt Blake",520,400);
        radar.animateEntity("Pvt Johnson",520,420);
        radar.animateEntity("Pvt Wyatt",590,420);
        radar.animateEntity("Sgt Whitcomb",590,400);
    },21000);
    radar.bcdraw_clear();
    radar.drawEntities();
}

function cnvs(event) {
    var elem = document.getElementById('fg_canvas');
    
    var crds = ftch(elem,event);

    document.getElementById("dump_coords").innerHTML = crds.x+","+crds.y;
}

function ftch(canvas, event) {
    var re = canvas.getBoundingClientRect();

    return {x: event.clientX - re.left, 
            y: event.clientY - re.top};

}

function init(){
    var elem = document.getElementById('fg_canvas'),
    elemLeft = elem.offsetLeft,
    elemTop = elem.offsetTop;
    elem.addEventListener('click', function(event){
        cnvs(event);
    });


    radar = new Radar();
    radar.fcdraw_grid(10);
    radar.mcdraw_lines(3,0);
    radar.bcdraw_clear();
    radar.entities = [
        new RadarEntity(1,390,"bulkhead_closed",null,0,3),
        new RadarEntity(150,390,"bulkhead_closed",null,0,3),
        new RadarEntity(300,390,"bulkhead_closed",null,0,3),
        new RadarEntity(450,390,"bulkhead_closed",null,0,3),
        new RadarEntity(0,0,"bound_wall",null,0,1,30,390),
        new RadarEntity(0,0,"bound_wall",null,0,1,500,200),
        new RadarEntity(350,0,"bound_wall",null,0,1,150,380),
        new RadarEntity(650,0,"bound_wall",null,0,1,150,380),
        new RadarEntity(150,360,"bound_wall",null,0,1,350,30),
        new RadarEntity(0,450,"bound_wall",null,0,1,720,390),
        new RadarEntity(120,400,"sargeant","Sgt Whitcomb",0,1.5),
        new RadarEntity(30,400,"private","Pvt Blake",0,1.5),
        new RadarEntity(130,420,"private","Pvt Wyatt",0,1.5),
        new RadarEntity(30,420,"private","Pvt Johnson",0,1.5),
        new RadarEntity(510,40,"bulkhead_closed",null,270,8),
        new RadarEntity(189,332,"chair",null,0,3),
        new RadarEntity(250,332,"chair",null,0,3),
        new RadarEntity(230,230,"chair",null,180,3),
        new RadarEntity(220,250,"console2","Captains terminal",180,2),
    ];  
    radar.drawEntities();
    doAnimations();
}



