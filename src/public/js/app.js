const socket = io();

//constant
const N_C = "N_Castle";
const N_T = "N_Territory";
const R_C = "R_Castle";
const R_T = "R_Territory";
const B_C = "B_Castle";
const B_T = "B_Territory";

//variables
let isRedTurn = true;
let passCnt = 0;
let lastTile = [];
let isGameEnd = false;
let redTerritory = [];
let blueTerritory = [];

//get elements on document
const playBoard = document.getElementById("playBoard");
const topNav = document.getElementById("topNav");
const topRightNav = document.getElementById("topRightNav");
const bottomNav = document.getElementById("bottomNav");
const bottomRightNav = document.getElementById("bottomRightNav");

//create new game board
const playBoardArray = new Array(9);

for (let i = 0; i < playBoardArray.length; i++){
    playBoardArray[i] = new Array(9);
    for (let j = 0; j < playBoardArray[i].length; j++){
        playBoardArray[i][j]= N_T;
    }
}
playBoardArray[4][4] = N_C;

//clickTile
function clickTile(event){
    if(!isGameEnd){
        const source = event.target;
        const row = Number(source.id.slice(4, 5));
        const col = Number(source.id.slice(5, 6));

        if(isRedTurn && checkTerritory(row,col).team == B_T){
            source.classList.add("blockClickBlue");
            const clickSound = new Audio("public/sfx/beep.mp3");
            clickSound.play();
            setTimeout(function() {
                source.classList.remove("blockClickBlue");
            }, 200);
            return;
        } else if(!isRedTurn && checkTerritory(row, col).team == R_T){
            source.classList.add("blockClickRed");
            const clickSound = new Audio("public/sfx/beep.mp3");
            clickSound.play();
            setTimeout(function() {
                source.classList.remove("blockClickRed");
            }, 200);
            return;
        } else {
            if(passCnt != 0){
                const redPassed = topNav.querySelector("#redPassed");
                redPassed.innerText = "";
                const bluePassed = topNav.querySelector("#bluePassed");
                bluePassed.innerText = "";
                passCnt = 0;
            }

            if(source.classList.contains(N_T)){
                source.classList.remove(N_T);
                const currentTurnTile = document.getElementById("currentTurn");
                lastTile.push(`${row}${col}`);
                if(isRedTurn){
                    source.classList.add(R_C);
                    playBoardArray[row][col] = R_C;
                    currentTurnTile.style.backgroundColor = "rgb(17, 17, 124)";
                } else {
                    source.classList.add(B_C);
                    playBoardArray[row][col] = B_C;
                    currentTurnTile.style.backgroundColor = "brown";
                }
                checkBreakCastle(source);
                isRedTurn = !isRedTurn;
                clearBoard();
                const clickSound = new Audio("public/sfx/click.mp3");
                clickSound.play();
                displayBoard();
                return;
            } else {
                return;
            }
        }
    } else {
        return;
    }
}

//clear board
function clearBoard() {
    for(let i = 0; i < playBoardArray.length; i++){
        playBoard.removeChild(playBoard.querySelector(`#row${i}`));
    }
}

//display board
function displayBoard() {
    for(let i = 0; i < playBoardArray.length; i++){
        const row = document.createElement("div");
        row.id = `row${i}`;
        row.classList.add("row");
        for(let j = 0; j < playBoardArray[i].length; j++){
            const tile = document.createElement("div");
            tile.id = `tile${i}${j}`;
            tile.classList.add("tile");
            tile.classList.add(playBoardArray[i][j])
            tile.addEventListener("click", clickTile);
            row.appendChild(tile);
        }
        playBoard.appendChild(row);
    }
}

displayBoard();

//nav button
const newGameBtn = topNav.querySelector("#newGameBtn");
const passBtn = topNav.querySelector("#currentTurn");
const backsiesBtn = bottomRightNav.querySelector("#backsiesBtn");

function setNewGame() {
    const clickSound = new Audio("public/sfx/clickOff.mp3");
    clickSound.play();
    setTimeout(function() {
        window.location.reload();
    },300);
}

function passTurn() {
    if(!isGameEnd){
        const currentTurnTile = document.getElementById("currentTurn");
        if(isRedTurn){
            currentTurnTile.style.backgroundColor = "rgb(17, 17, 124)";
            const redPassed = topNav.querySelector("#redPassed");
            redPassed.innerText = "PASS";
        } else {
            currentTurnTile.style.backgroundColor = "brown";
            const bluePassed = topNav.querySelector("#bluePassed");
            bluePassed.innerText = "PASS";
        }
        passCnt ++;
        const clickSound = new Audio("public/sfx/click.mp3");
        clickSound.play();
        if(passCnt == 2){
            const redPoint = countTerritory().redPoint;
            const bluePoint = countTerritory().bluePoint;
            const redPointText = bottomNav.querySelector("#redPoint");
            const bluePointText = bottomNav.querySelector("#bluePoint");
            redPointText.innerText = redPoint;
            bluePointText.innerText = bluePoint;
            
            if(redPoint > bluePoint+3){
                redWin();
            } else if(redPoint < bluePoint+3){
                blueWin();
            } else {
                draw();
            }
        }
        isRedTurn = !isRedTurn;
    } else {
        return;
    }
}

function backsies() {
    try {
        const currentTile = lastTile.pop()
        const row = currentTile.slice(0, 1);
        const col = currentTile.slice(1, 2);
        playBoardArray[row][col] = N_T;

        const currentTurnTile = document.getElementById("currentTurn");
        if(isRedTurn){
            currentTurnTile.style.backgroundColor = "rgb(17, 17, 124)";
        } else {
            currentTurnTile.style.backgroundColor = "brown";
        }

        const winText = topRightNav.querySelector("#winText");
        winText.innerText = "";
        winText.style.backgroundColor = "";

        const redPointText = bottomNav.querySelector("#redPoint");
        const bluePointText = bottomNav.querySelector("#bluePoint");
        redPointText.innerText = "";
        bluePointText.innerText = "";
    
        isGameEnd = false;
        isRedTurn = !isRedTurn;
        clearBoard();
        const clickSound = new Audio("public/sfx/clickOff.mp3");
        clickSound.play();
        displayBoard();
    } catch {}
}

newGameBtn.addEventListener("click", setNewGame);
passBtn.addEventListener("click", passTurn);
backsiesBtn.addEventListener("click", backsies);

//start game
function isSafe(sourceRow, sourceCol, sourceTeam){
    const queue = [];
    const visited = [];
    const isSafe = -1;

    queue.push([sourceRow, sourceCol]);
    
    if (sourceTeam == B_C){
        while(queue.length!=0){
            let currentCastle = queue.shift();
            let currentRow = currentCastle[0];
            let currentCol = currentCastle[1];

            try {
                if((playBoardArray[currentRow-1][currentCol] == R_C) && !visited.includes(`${currentRow-1}${currentCol}`)){
                    queue.push([currentRow-1, currentCol]);
                } else if(playBoardArray[currentRow-1][currentCol] == N_T || playBoardArray[currentRow-1][currentCol] == R_T){
                    return 1;
                }
            } catch {}
            try {
                if((playBoardArray[currentRow][currentCol-1] == R_C)  && !visited.includes(`${currentRow}${currentCol-1}`)){
                    queue.push([currentRow, currentCol-1]);
                } else if(playBoardArray[currentRow][currentCol-1] == N_T || playBoardArray[currentRow][currentCol-1] == R_T){
                    return 1;
                }
            } catch {}
            try {
                if((playBoardArray[currentRow+1][currentCol] == R_C)  && !visited.includes(`${currentRow+1}${currentCol}`)){
                    queue.push([currentRow+1, currentCol]);
                } else if(playBoardArray[currentRow+1][currentCol] == N_T || playBoardArray[currentRow+1][currentCol] == R_T){
                    return 1;
                }
            } catch {}   
            try {
                if((playBoardArray[currentRow][currentCol+1] == R_C)  && !visited.includes(`${currentRow}${currentCol+1}`)){
                    queue.push([currentRow, currentCol+1]);
                } else if(playBoardArray[currentRow][currentCol+1] == N_T || playBoardArray[currentRow][currentCol+1] == R_T){
                    return 1;
                }
            } catch {}
            if(!visited.includes(`${currentRow}${currentCol}`)){
                visited.push(`${currentRow}${currentCol}`);
            }
        }
    } else if (sourceTeam == R_C){
        while(queue.length!=0){
            let currentCastle = queue.shift();
            let currentRow = currentCastle[0];
            let currentCol = currentCastle[1];

            try {
                if((playBoardArray[currentRow-1][currentCol] == B_C) && !visited.includes(`${currentRow-1}${currentCol}`)){
                    queue.push([currentRow-1, currentCol]);
                } else if(playBoardArray[currentRow-1][currentCol] == N_T || playBoardArray[currentRow-1][currentCol] == B_T){
                    return 1;
                }
            } catch {}
            try {
                if((playBoardArray[currentRow][currentCol-1] == B_C)  && !visited.includes(`${currentRow}${currentCol-1}`)){
                    queue.push([currentRow, currentCol-1]);
                } else if(playBoardArray[currentRow][currentCol-1] == N_T || playBoardArray[currentRow][currentCol-1] == B_T){
                    return 1;
                }
            } catch {}
            try {
                if((playBoardArray[currentRow+1][currentCol] == B_C)  && !visited.includes(`${currentRow+1}${currentCol}`)){
                    queue.push([currentRow+1, currentCol]);
                } else if(playBoardArray[currentRow+1][currentCol] == N_T || playBoardArray[currentRow+1][currentCol] == B_T){
                    return 1;
                }
            } catch {}   
            try {
                if((playBoardArray[currentRow][currentCol+1] == B_C)  && !visited.includes(`${currentRow}${currentCol+1}`)){
                    queue.push([currentRow, currentCol+1]);
                } else if(playBoardArray[currentRow][currentCol+1] == N_T || playBoardArray[currentRow][currentCol+1] == B_T){
                    return 1;
                }
            } catch {}
            if(!visited.includes(`${currentRow}${currentCol}`)){
               visited.push(`${currentRow}${currentCol}`);
            }
        }
    }

    if(isSafe == -1 && visited.length != 0){
        return 0;
    } else {
        return 1;
    }
}

function checkBreakCastle(source) {
    const sourceRow = Number(source.id.slice(4, 5));
    const sourceCol = Number(source.id.slice(5, 6));
    const sourceTeam = playBoardArray[sourceRow][sourceCol];
    
    if(sourceTeam == R_C){
        try {
            if(playBoardArray[sourceRow-1][sourceCol] == B_C){
                if(isSafe(sourceRow-1, sourceCol, R_C) == 0){
                    redWin();
                }
            }
        } catch {}
        try {
            if (playBoardArray[sourceRow][sourceCol-1] == B_C){
                if(isSafe(sourceRow, sourceCol-1, R_C) == 0){
                    redWin();
                };
            }
        } catch {}
        try {
            if (playBoardArray[sourceRow+1][sourceCol] == B_C){
                if(isSafe(sourceRow+1, sourceCol, R_C) == 0){
                    redWin();
                };
            }
        } catch {}   
        try {
            if (playBoardArray[sourceRow][sourceCol+1] == B_C){
                if(isSafe(sourceRow, sourceCol+1, R_C) == 0){
                    redWin();
                }
            }
        } catch {}
    } else if(sourceTeam == B_C){
        try {
            if(playBoardArray[sourceRow-1][sourceCol] == R_C){
                if(isSafe(sourceRow-1, sourceCol, B_C) == 0){
                    blueWin();
                }
            }
        } catch {}
        try {
            if (playBoardArray[sourceRow][sourceCol-1] == R_C){
                if(isSafe(sourceRow, sourceCol-1, B_C) == 0){
                    blueWin();
                };
            }
        } catch {}
        try {
            if (playBoardArray[sourceRow+1][sourceCol] == R_C){
                if(isSafe(sourceRow+1, sourceCol, B_C) == 0){
                    blueWin();
                };
            }
        } catch {}   
        try {
            if (playBoardArray[sourceRow][sourceCol+1] == R_C){
                if(isSafe(sourceRow, sourceCol+1, B_C) == 0){
                    blueWin();
                }
            }
        } catch {}
    }
}

function redWin(){
    const winText = topRightNav.querySelector("#winText");
    winText.innerText = "RED WIN";
    winText.style.backgroundColor = "brown";
    endGame();
}

function blueWin(){
    const winText = topRightNav.querySelector("#winText");
    winText.innerText = "BLUE WIN";
    winText.style.backgroundColor = "rgb(17, 17, 124)";
    endGame();
}

function draw(){
    const winText = topRightNav.querySelector("#winText");
    winText.innerText = "DRAW";
    winText.style.backgroundColor = "rgb(70, 70, 70)";
    endGame();
}

function endGame(){
    isGameEnd = true;
}

function countTerritory() {
    visited = [];
    redCnt = 0;
    blueCnt = 0;

    for(let i = 0; i<playBoardArray.length; i++){
        for(let j = 0; j<playBoardArray[i].length; j++){
            if(playBoardArray[i][j] != R_C && playBoardArray[i][j] != B_C && playBoardArray[i][j] != N_C && !visited.includes(`${i}${j}`)){
                let currentTerritory = checkTerritory(i,j).territory;
                let currentTeam = checkTerritory(i,j).team;

                if(currentTeam == R_T){
                    redCnt += currentTerritory.length;
                } else if (currentTeam == B_T){
                    blueCnt += currentTerritory.length;
                } else {

                }

                for(let k = 0; k<currentTerritory.length; k++){
                    if(!visited.includes(currentTerritory[k])){
                        visited.push(currentTerritory[k]);
                    }
                }
            }
        }
    }
    return {redPoint: redCnt, bluePoint: blueCnt};
}

function checkTerritory(sourceRow, sourceCol){
    const queue = [];
    const visited = [];
    const queued = [];
    
    let facingRed = false;
    let facingBlue = false;

    let facingTop = false;
    let facingLeft = false;
    let facingBottom = false;
    let facingRight = false;
    
    queue.push(`${sourceRow}${sourceCol}`);
    
    while(queue.length!=0){
        let currentTerritory = queue.shift();
        let currentRow = Number(currentTerritory.slice(0,1));
        let currentCol = Number(currentTerritory.slice(1,2));

        try {
            if(playBoardArray[currentRow-1][currentCol] == N_T && !visited.includes(`${currentRow-1}${currentCol}`)){
                queue.push(`${currentRow-1}${currentCol}`);
            } else if(playBoardArray[currentRow-1][currentCol] == R_C){
                facingRed = true;
            } else if(playBoardArray[currentRow-1][currentCol] == B_C){
                facingBlue = true;
            }
        } catch {}
        try {
            if(playBoardArray[currentRow][currentCol-1] == N_T && !visited.includes(`${currentRow}${currentCol-1}`)){
                queue.push(`${currentRow}${currentCol-1}`);
            } else if(playBoardArray[currentRow][currentCol-1] == R_C){
                facingRed = true;
            } else if(playBoardArray[currentRow][currentCol-1] == B_C){
                facingBlue = true;
            }
        } catch {}
        try {
            if(playBoardArray[currentRow+1][currentCol] == N_T && !visited.includes(`${currentRow+1}${currentCol}`)){
                queue.push(`${currentRow+1}${currentCol}`);
            } else if(playBoardArray[currentRow+1][currentCol] == R_C){
                facingRed = true;
            } else if(playBoardArray[currentRow+1][currentCol] == B_C){
                facingBlue = true;
            }
        } catch {}  
        try {
            if(playBoardArray[currentRow][currentCol+1] == N_T && !visited.includes(`${currentRow}${currentCol+1}`)){
                queue.push(`${currentRow}${currentCol+1}`);
            } else if(playBoardArray[currentRow][currentCol+1] == R_C){
                facingRed = true;
            } else if(playBoardArray[currentRow][currentCol+1] == B_C){
                facingBlue = true;
            }
        } catch {}

        if(!visited.includes(`${currentRow}${currentCol}`)){
            visited.push(`${currentRow}${currentCol}`);
        }
    }

    for(let i =  0; i < visited.length; i++){
        if(visited[i][0] == 0){
            facingTop = true;
        }
        if(visited[i][0] == 8){
            facingBottom = true;
        }
        if(visited[i][1] == 0){
            facingLeft = true;
        }
        if(visited[i][1] == 8){
            facingRight = true;
        }
    }

    if(facingRed != facingBlue){
        if(!(facingTop == true && facingLeft == true && facingBottom == true && facingRight == true)){
            if(facingRed){
                return {team: R_T, territory: visited};
            } else if(facingBlue){
                return {team: B_T, territory: visited};
            }
        } else {
            return {team: N_T, territory: visited};
        }
    } else {
        return {team: N_T, territory: visited};
    }
}