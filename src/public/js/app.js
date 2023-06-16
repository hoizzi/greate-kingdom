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

//get elements on document
const playBoard = document.getElementById("playBoard");

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
    const source = event.target;
    if(source.classList.contains(N_T)){
        source.classList.remove(N_T);
        const row = Number(source.id.slice(4, 5));
        const col = Number(source.id.slice(5, 6));
        if(isRedTurn){
            source.classList.add(R_C);
            playBoardArray[row][col] = R_C;
        } else {
            source.classList.add(B_C);
            playBoardArray[row][col] = B_C;
        }
        isRedTurn = !isRedTurn;
        clearBoard();
        displayBoard();
        return;
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

//satrt game
