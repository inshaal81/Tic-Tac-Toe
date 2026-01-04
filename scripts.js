function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];

    // Create a 2d array of 3x3 for the game board
    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
        board[i].push(Cell());
        }
    }

    // get the entire board that our UI will eventually need to render it.
    const getBoard = () => board;

    //  change that cell's value to the player number
    const appendToken = (row, column, player) => {
        // check if the cell is empty
        if (board[row][column].getValue() !== "") return;
        // add the token if empty
        board[row][column].addToken(player);
        return true;
    };

    // application to interact with the board
    return { getBoard, appendToken };
}

/*
** A Cell represents one "square" on the board and can have one of
** "": no token is in the square,
** X: Player One's token,
** O: Player 2's token
*/

function Cell() {
  let value = "";

    // Accept a player's token to change the value of the cell
    const addToken = (player) => {
        value = player;
    };

    // How we will retrieve the current value of this cell through closure
    const getValue = () => value;

    return {
        addToken,
        getValue
    };
}

// checkWin will be resoponsible for indentifying if a game has been won
function checkWin(board) {
    const cells = board.flat().map(cell => cell.getValue());
    
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  // columns
        [0, 4, 8], [2, 4, 6]              // diagonals
    ];
    
    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (cells[a] !== "" && cells[a] === cells[b] && cells[b] === cells[c]) {
            return "win";
        }
    }
    
    // Check for tie
    if (cells.every(cell => cell !== "")) {
        return "tie";
    }
}

/* 
** The GameController will be responsible for controlling the 
** flow and state of the game's turns, as well as whether
** anybody has won the game
*/
function GameController(
    playerOneName = "Player One",
    playerTwoName = "Player Two"
    ) {
    const board = Gameboard();
    let gameOver = false;

    const players = [
        {
        name: playerOneName,
        token: "X"
        },
        {
        name: playerTwoName,
        token: "O"
        }
    ];

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        const container = document.getElementById('activePlayerContainer');
        container.innerHTML = ''; // Clear previous round
        const activePlayerDiv = document.createElement('div');
        activePlayerDiv.classList.add("activePlayer");
        activePlayerDiv.innerHTML = `<p>${getActivePlayer().name}'s turn.</p>`;
        container.appendChild(activePlayerDiv);
    };

    const playRound = (row, column) => {
        if (gameOver) return;
        // Append a token for the current player
        const ifAdded = board.appendToken(row, column, getActivePlayer().token)
        if (ifAdded) {
            //check for a win
            const result = checkWin(board.getBoard());
            
            if (result == 'win') {
                const popupOverlay = document.getElementById('popupOverlay');
                popupOverlay.style.display = 'flex';
            
                const container = document.querySelector('.gameMessage');
                container.innerHTML = `<p>${getActivePlayer().name} Wins!</p>`;
                gameOver = true;
            }

            //check for a tie
            else if (result == 'tie') {
                const popupOverlay = document.getElementById('popupOverlay');
                popupOverlay.style.display = 'flex';
            
                const container = document.querySelector('.gameMessage');
                container.innerHTML = `<p>It's a Tie!</p>`;
                gameOver = true;
            }

            // no win or tie, continue
            else {
                switchPlayerTurn();
                printNewRound();
            }
        };
    };

    // Initial play game message
    printNewRound();

    // getActivePlayer for the UI
    return {
        playRound,
        getActivePlayer,
        getBoard: board.getBoard
    };
};

document.addEventListener('DOMContentLoaded', function() {
    const game = GameController();
    const gridItems = document.querySelectorAll('.gridItem');
    const popupOverlay = document.getElementById('popupOverlay');
    
    document.body.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            popupOverlay.style.display = 'none';
        }
    });

    gridItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            const row = Math.floor(index / 3);
            const column = index % 3;
            
            // Play the round
            game.playRound(row, column);
            
            // Update the display
            const board = game.getBoard();
            gridItems.forEach((gridItem, i) => {
                const row = Math.floor(i / 3);
                const col = i % 3;
                const cell = board[row][col].getValue();
                gridItem.textContent = cell;
            });
        });
    });
});