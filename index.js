//MIT license, Arnav Nagpure
const mainArea = document.getElementById('mainArea');
const mainBall = document.getElementById("mainBall");
const radian = 0.0174533;

//initialise main ball
const mainBallRadius = 14;
const mainBallBorder = 4;
const maxDragDistance = 200;
const arrow = document.getElementById("arrow");
const arrowDot = document.getElementById("arrowDot");
const hole = document.getElementById("hole");
const userHits = document.getElementById("userHits");
const gameEnd = document.getElementById("gameEnd");
gameEnd.style.display = "none";
let mainBallPositionX;
let mainBallPositionY;
let mainBallMomentum = 0;
let mainBallMomentumDirection = 0;
let holepos = [0,0];
let hits = 0
let frictionC = 0.95;
var walls = []
mainBallMomentumDirection%=360;

mainBall.style.width = (mainBallRadius)*2+"px";
mainBall.style.height = (mainBallRadius)*2+"px";
mainBall.style.position = "absolute";

let isMouseDown = false;
let startX = 0;
let startY = 0;

let currentLevel = 0
const levels = [
    {
        "ball":[200,500],
        "hole":[600,100],
        "walls":[[100,0,50,600],[700,50,50,500],[156,550,594,50],[100,0,650,50]],
        "portalPairs":[]
    },
    {
        "ball":[200,90],
        "hole":[1035,500],
        "walls":[[100,0,50,200],[1100,50,50,550],[156,150,800,50],[100,0,1050,50],[956,150,50,470],[1012,570,138,50]],
        "portalPairs":[]
    },
    {
        "ball":[1000,500],
        "hole":[200,100],
        "walls":[[100,0,50,600],[700,50,50,400],[1200,50,50,550],[850,150,50,400],[156,550,1092,50],[100,0,1150,50]],
        "portalPairs":[]
    },
    {
        "ball":[200,500],
        "hole":[600,100],
        "walls":[[100,0,50,600],[700,50,50,500],[156,550,594,50],[100,0,650,50], [250,250,50,350], [250,250,350,50], [450,150,50,50], [350,350,50,50]],
        "portalPairs":[]
    },
    {
        "ball":[200,500],
        "hole":[600,100],
        "walls":[[500,0,50,600],[100,0,50,600],[700,50,50,500],[156,550,594,50],[100,0,650,50]],
        "portalPairs":[[250, 250, 630, 400]]
    }
    
]

function detectMouseDrag(event) {
  if (event.type === 'mousedown') {
    isMouseDown = true;
  } else if (event.type === 'mouseup' && isMouseDown) {
    isMouseDown = false;
    hits++;
    userHits.innerHTML = `HITS: ${hits}`
    arrow.style.display = 'none';
    arrowDot.style.display = 'none';
    const endX = event.clientX;
    const endY = event.clientY;
    const deltaX = endX - mainBallPositionX-mainBallBorder-mainBallRadius;
    const deltaY = endY - mainBallPositionY-mainBallBorder-mainBallRadius;
    const distance = Math.min(Math.hypot(deltaX, deltaY),maxDragDistance)
    const angle = ((Math.atan2(deltaY, deltaX) * 180 / Math.PI) + 450)%360;
    //take angle in opposite direction
    mainBallMomentumDirection = (angle+180)%360
    mainBallMomentum = distance/5
  } else if (event.type === 'mousemove' && isMouseDown) {
    const ballCenterX = mainBallPositionX+mainBallBorder+mainBallRadius;
    const ballCenterY = mainBallPositionY+mainBallBorder+mainBallRadius;
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const deltaX = mouseX - ballCenterX;
    const deltaY = mouseY - ballCenterY;
    const distance = Math.min(Math.hypot(deltaX, deltaY),maxDragDistance)
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

    colour = interpolateColor([0,255,0], [255,0,0], (distance/250))
    arrow.style.borderColor = `rgb(${colour[0]},${colour[1]},${colour[2]})`
    arrowDot.style.borderColor = `rgb(${colour[0]},${colour[1]},${colour[2]})`

    arrow.style.display = 'block';
    arrow.style.left = ballCenterX + 'px';
    arrow.style.top = ballCenterY-6 + 'px';
    arrow.style.width = distance + 'px';
    arrow.style.transform = `rotate(${angle}deg)`;
    arrowDot.style.display = 'block';
    arrowDot.style.left = ballCenterX-8 + 'px';
    arrowDot.style.top = ballCenterY-8 + 'px';
  }
}

mainBall.addEventListener('mousedown', detectMouseDrag);
document.addEventListener('mouseup', detectMouseDrag);
document.addEventListener('mousemove', detectMouseDrag);

function changeMainBallPos(){
    if (mainBallMomentum>0.5){
        hyp = mainBallMomentum;
        mainBallMomentumDirection%=360;
        theta = mainBallMomentumDirection;
        if(theta < 90){
            changeY = -hyp*Math.sin((90-theta%90)*radian);
            changeX = hyp*Math.cos((90-theta%90)*radian);
        } else if(theta < 180){
            changeY = hyp*Math.sin((theta%90)*radian);
            changeX = hyp*Math.cos((theta%90)*radian);
        } else if(theta < 270){
            changeY = hyp*Math.sin((90-theta%90)*radian);
            changeX = -hyp*Math.cos((90-theta%90)*radian);
        } else if(theta < 360){
            changeY = -hyp*Math.sin((theta%90)*radian);
            changeX = -hyp*Math.cos((theta%90)*radian);
        }

        for(let i = 0; i < collisionLines.length; i++){
            endPoints = collisionLines[i];
            if( intersects(endPoints[0][0], endPoints[0][1], endPoints[1][0], endPoints[1][1], mainBallPositionX, mainBallPositionY, mainBallPositionX+changeX, mainBallPositionY+changeY) ){
                let intersectionPoint = line_intersect(endPoints[0][0], endPoints[0][1], endPoints[1][0], endPoints[1][1], mainBallPositionX, mainBallPositionY, mainBallPositionX+changeX, mainBallPositionY+changeY);
                changeX = changeY = 0;
                mainBallPositionX = intersectionPoint[0];
                mainBallPositionY = intersectionPoint[1];
                theta1 = endPoints[0][1]==endPoints[1][1] ? 540 : 360;
                mainBallMomentumDirection = theta1-mainBallMomentumDirection;
            }
        }

        for(let i = 0; i < portalPairs.length; i++){
            portal = portalPairs[i]
            let portalDist = Math.hypot(mainBallPositionX-portal[0],mainBallPositionY-portal[1])
            if(portalDist<30){
                console.log(mainBallPositionX)
                mainBallPositionX = portal[2];
                mainBallPositionY = portal[3];
            }
        }

        let holeDist = Math.hypot(mainBallPositionX-holepos[0],mainBallPositionY-holepos[1])
        if(holeDist<20){
            changeX = changeY = 0;
            loadLevel(levels[currentLevel]);
            currentLevel++
        }

        let portalDist = Math.hypot(mainBallPositionX-holepos[0],mainBallPositionY-holepos[1])
        if(portalDist<20){
            changeX = changeY = 0;
            loadLevel(levels[currentLevel]);
            currentLevel++
        }

        mainBallPositionX += changeX;
        mainBallPositionY += changeY;
        mainBallMomentum=mainBallMomentum*frictionC;

    } else {

    }
    mainBall.style.marginLeft = mainBallPositionX+"px";
    mainBall.style.marginTop = mainBallPositionY+"px";
}

function interpolateColor(c1, c2, perc){
    newC = []
    for(let i=0; i<3; i++){
        diff = c2[i]-c1[i]
        newC.push( Math.round(c1[i]+diff*perc) )
    }
    return newC
}

function line_intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    var ua, ub, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
    if (denom == 0) {return null;}
    ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
    ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom;
    return [
        x1 + ua * (x2 - x1),
        y1 + ua * (y2 - y1),
    ];
}

function intersects(a,b,c,d,p,q,r,s) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
      return false;
    } else {
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
      return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
};

function createHitboxes(levelElements){
    let levelWalls = [];
    for (let i = 0; i < levelElements.length; i++) {
        let coords = levelElements[i].getBoundingClientRect();
        coords.x -= mainBallRadius*2+mainBallBorder*2;
        coords.y -= mainBallRadius*2+mainBallBorder*2;
        coords.width += mainBallRadius*2+mainBallBorder*2;
        coords.height += mainBallRadius*2+mainBallBorder*2;
        c1 = [coords.x, coords.y];
        c2 = [coords.x+coords.width, coords.y];
        c3 = [coords.x, coords.y+coords.height];
        c4 = [coords.x+coords.width, coords.y+coords.height];
        levelWalls.push([c1, c2]);
        levelWalls.push([c2, c4]);
        levelWalls.push([c4, c3]);
        levelWalls.push([c3, c1]);
    }
    return levelWalls;
}

function loadLevel(level){
    if(level){
        mainBallMomentum = 0;
        hits = 0
        userHits.innerHTML = `HITS: ${hits}`
        mainBallPositionX = level["ball"][0];
        mainBallPositionY = level["ball"][1];
        holepos = [level["hole"][0], level["hole"][1]];
        hole.style.marginLeft = level["hole"][0]+"px";
        hole.style.marginTop = level["hole"][1]+"px";

        walls.forEach(function(wall){
            wall.remove();
        })
        walls = [];

        for (let i = 0; i < level["walls"].length; i++){
            let wallData = level["walls"][i];
            let wall = document.createElement("div");
            wall.classList.add("wall");
            console.log(wallData);
            wall.style.marginLeft = `${wallData[0]}px`;
            wall.style.marginTop = `${wallData[1]}px`;
            wall.style.width = `${wallData[2]}px`;
            wall.style.height = `${wallData[3]}px`;
            mainArea.appendChild(wall);

            walls.push(wall);
        }

        collisionLines = createHitboxes(walls);

        portalPairs = level["portalPairs"]
        for (let i = 0; i < portalPairs.length; i++){
            let portalA = document.createElement("div");
            let portalB = document.createElement("div");

            portalA.style.marginLeft = `${portalPairs[i][0]}px`;
            portalA.style.marginTop = `${portalPairs[i][1]}px`;
            portalA.classList.add("portal")
            portalB.style.marginLeft = `${portalPairs[i][2]}px`;
            portalB.style.marginTop = `${portalPairs[i][3]}px`;
            portalB.classList.add("portal")

            mainArea.appendChild(portalA);
            mainArea.appendChild(portalB);
        }
    } else {
        mainBall.style.display = 'none';
        gameEnd.style.display = "block";
    }
}

function touches(div1, div2) {
    var rect1 = div1.getBoundingClientRect();
    var rect2 = div2.getBoundingClientRect();
  
    if (rect1.bottom == rect2.top) {
        return true;
    }
  }

function resetLvl(){
    loadLevel(levels[currentLevel-1])
}

loadLevel(levels[currentLevel]);
currentLevel++

window.requestAnimationFrame(mainLoop);
function mainLoop() {
    changeMainBallPos();
    window.requestAnimationFrame(mainLoop);
}