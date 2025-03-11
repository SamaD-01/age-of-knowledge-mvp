
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("service-worker.js")
            .then((registration) => console.log("Service Worker Registered!", registration))
            .catch((error) => console.log("Service Worker Registration Failed:", error));
    });
}


// ? Load questions from JSON file
let GAME_QUESTIONS;
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        GAME_QUESTIONS = data;
        console.log(GAME_QUESTIONS);
    });

const saveGameState = () => {
    const gameState = {
        player1: game.player1,
        player2: game.player2,
        currentPlayer: game.currentPlayer.name
    };
    localStorage.setItem("gameState", JSON.stringify(gameState));
};

const loadGameState = () => {
    const savedState = localStorage.getItem("gameState");
    if (savedState) {
        const state = JSON.parse(savedState);
        game = new Game(state.player1.name, state.player2.name);
        game.player1.position = state.player1.position;
        game.player2.position = state.player2.position;
        game.currentPlayer = state.currentPlayer === state.player1.name ? game.player1 : game.player2;
        game.initializeGame();
        return true;
    }
    return false;
};

const clearGameState = () => {
    localStorage.removeItem("gameState");
};

const loader = () => {
    const dices = ['fa-solid fa-dice-one', 'fa-solid fa-dice-two', 'fa-solid fa-dice-three', 'fa-solid fa-dice-four', 'fa-solid fa-dice-five', 'fa-solid fa-dice-six'];

    setInterval(() => {
        const dice = document.querySelector('.pre_game_loader i');
        dice.className = dices[Math.floor(Math.random() * dices.length)];
    }
    , 100);
}


const boardCoord = [
  { top: "635px", left: "400px" }, // Square 1 blue start
  { top: "555px", left: "400px" },
  { top: "475px", left: "400px" },
  { top: "400px", left: "400px" },
  { top: "400px", left: "475px" },
  { top: "400px", left: "555px" },
  { top: "400px", left: "635px" },
  { top: "320px", left: "635px" }, // Square 8 red finish
  { top: "242px", left: "635px" }, // Square 9 red start
  { top: "242px", left: "555px" },
  { top: "242px", left: "475px" },
  { top: "242px", left: "400px" },
  { top: "170px", left: "400px" },
  { top: "90px", left: "400px" },
  { top: "10px", left: "400px" },
  { top: "10px", left: "320px" }, // Square 16 yellow finish
  { top: "10px", left: "242px" }, // Square 17 yellow start
  { top: "90px", left: "242px" },
  { top: "170px", left: "242px" },
  { top: "242px", left: "242px" },
  { top: "242px", left: "170px" },
  { top: "242px", left: "90px" },
  { top: "242px", left: "10px" },
  { top: "320px", left: "10px" }, // Square 24 green finish
  { top: "400px", left: "10px" }, // Square 25 green start
  { top: "400px", left: "90px" },
  { top: "400px", left: "170px" },
  { top: "400px", left: "242px" },
  { top: "475px", left: "242px" },
  { top: "555px", left: "242px" },
  { top: "635px", left: "242px" },
  { top: "635px", left: "320px" }, // Square 32 blue finish
];

let game;

function checkAnswer(answerText, questionId) {
    const question = GAME_QUESTIONS.level1[questionId];
    const isCorrect = answerText.trim() === question.correct_answer.trim();

    const answerButtons = document.querySelectorAll('.answer_button');
    answerButtons.forEach(button => {
        const answerText = button.querySelector('.answer').textContent.trim();
        if (answerText === question.correct_answer.trim()) {
            button.classList.add('true');
        } else {
            button.classList.add('false');
        }
        button.style.pointerEvents = 'none';
    });

    setTimeout(() => {
        document.querySelector('.qa_container').remove();
        game.continueAfterQuestion(isCorrect);
    }, 1000);

    return isCorrect;
}

document.querySelector('.new_game').addEventListener('click', () => {
    document.querySelector('.winner_container').style.display = 'none';
    document.querySelector('.container').style.display = 'none';
    document.querySelector('.start_form').style.display = 'flex';
    clearGameState();
});


class Game {
    constructor(player1, player2) {
        this.player1 = {
            name: player1,
            color: 'yellow',
            position: 16,
            token: null
        };
        this.player2 = {
            name: player2,
            color: 'blue',
            position: 0,
            token: null
        };
        this.currentPlayer = this.player1;
        this.boardCoord = boardCoord;
        this.specialSquares = [
            { pos: 5, type: 'CLOVER' },
            { pos: 14, type: 'CLOVER' },
            { pos: 23, type: 'CLOVER' },

            { pos: 8, type: 'SKULL' },
            { pos: 18, type: 'SKULL' },
            { pos: 26, type: 'SKULL' },

            { pos: 10, type: 'ACES' },
            { pos: 20, type: 'ACES' },
            { pos: 30, type: 'ACES' }
        ];
        this.diceRollResult = null;
        this.diceEnabled = true;
    }

    rollDice() {
        if (!this.diceEnabled) return null;
        this.diceEnabled = false;
        return Math.floor(Math.random() * 6) + 1;
    }

    presentQuestion() {
        const questions = GAME_QUESTIONS.level1;
        let randIdx = Math.floor(Math.random() * questions.length);
        let question = questions[randIdx];
    
        const html = `<div class="qa_container">
                <div class="question_card">
                    <div class="question_card_inner">
                        <div class="question_card_front"></div>
                        <div class="question_card_back">
                            <h1>${question.question}</h1>
                        </div>
                    </div>
                </div>
                <div class="answer_container">
                    ${question.options.map((option, i) => `
                        <div class="answer_button" data-answer="${option}" data-id="${randIdx}">
                            <span class="number">${i + 1}</span>
                            <span class="answer">${option}</span>
                        </div>`).join('')}
                </div>
            </div>`;
    
        document.querySelector('body').insertAdjacentHTML('beforeend', html);
    
        // Attach event listeners to answer buttons
        document.querySelectorAll('.answer_button').forEach(button => {
            button.addEventListener('click', function() {
                const selectedAnswer = this.getAttribute('data-answer');
                const questionId = this.getAttribute('data-id');
                checkAnswer(selectedAnswer, questionId);
            });
        });
    
        return true;
    }
    
    

    moveToken(steps) {
        const slide = new Audio('slide.mp3');
        
        let newPosition = this.currentPlayer.position + steps;

        if (newPosition < 0) newPosition = 0;
        if (newPosition >= this.boardCoord.length && this.currentPlayer.color === 'yellow') newPosition = newPosition - this.boardCoord.length;
        if (newPosition >= this.boardCoord.length && this.currentPlayer.color === 'blue') newPosition = this.boardCoord.length - 1;
        
        this.currentPlayer.position = newPosition;
        
        const newCoord = this.boardCoord[this.currentPlayer.position];
        this.currentPlayer.token.style.top = newCoord.top;
        this.currentPlayer.token.style.left = newCoord.left;
        
        slide.play();
        saveGameState();
        
        if ((this.currentPlayer.color === 'yellow' && this.currentPlayer.position === 15) ||
            (this.currentPlayer.color === 'blue' && this.currentPlayer.position === 31)) {
            setTimeout(() => this.announceWinner(), 1000);
            return;
        }
        
        setTimeout(() => {
            this.switchPlayer();
            this.diceEnabled = true;
        }, 1000);
    }

    handleSpecialSquare() {
        const currentSquare = this.currentPlayer.position;
        const specialCase = this.specialSquares.find(square => square.pos === currentSquare);
        
        if (specialCase) {
            const questionPresented = this.presentQuestion();
            if (!questionPresented) {
                this.moveToken(this.diceRollResult);
            }
        } else {
            this.moveToken(this.diceRollResult);
        }
    }

    continueAfterQuestion(isCorrect) {
        const specialCase = this.specialSquares.find(square => square.pos === this.currentPlayer.position).type;
        
        if (isCorrect) {
            switch(specialCase) {
                case 'CLOVER':
                    this.moveToken(this.diceRollResult * 2);
                    break;
                case 'SKULL':
                    this.moveToken(this.diceRollResult);
                    break;
                case 'ACES':
                    this.moveToken(this.diceRollResult + 1);
                    break;
                default:
                    this.moveToken(this.diceRollResult);
            }
        } else {
            switch(specialCase) {
                case 'CLOVER':
                    this.diceEnabled = true;
                    this.switchPlayer();
                    break;
                case 'SKULL':
                    this.moveToken(-4);
                    break;
                case 'ACES':
                    this.moveToken(-1);
                    break;
                default:
                    this.moveToken(this.diceRollResult);
            }
        }
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === this.player1 ? this.player2 : this.player1;
        const current = document.querySelector('.current_player_card');
        
        if (current.classList.contains('yellow')) {
            current.classList.remove('yellow');
            current.classList.add('blue');
        } else {
            current.classList.remove('blue');
            current.classList.add('yellow');
        }
        
        document.querySelector('.current_player_card span').textContent = this.currentPlayer.name;
    }

    announceWinner() {
        clearGameState();
        const winSound = new Audio('winning.mp3');
        document.querySelector('.winner_container').style.display = 'flex';
        document.querySelector('.winner').textContent = this.currentPlayer.name;
        winSound.play();
    }

    initializeGame() {
        this.createGameElements();
        
        this.player1.token = document.querySelector('.pawn_yellow');
        this.player1.token.style.top = this.boardCoord[this.player1.position].top;
        this.player1.token.style.left = this.boardCoord[this.player1.position].left;
        
        this.player2.token = document.querySelector('.pawn_blue');
        this.player2.token.style.top = this.boardCoord[this.player2.position].top;
        this.player2.token.style.left = this.boardCoord[this.player2.position].left;
        
        this.setupCurrentPlayerIndicator();
    }
    
    createGameElements() {
        const board = document.querySelector('.board');
        
        if (!document.querySelector('.pawn_yellow')) {
            const yellowPawn = document.createElement('div');
            yellowPawn.className = 'pawn_yellow';
            board.appendChild(yellowPawn);
        }
        
        if (!document.querySelector('.pawn_blue')) {
            const bluePawn = document.createElement('div');
            bluePawn.className = 'pawn_blue';
            board.appendChild(bluePawn);
        }
        
        const cloverHtml = `<img src="clover.png" alt="clover">`;
        const acesHtml = `<img src="aces.png" alt="aces">`;
        const skullHtml = `<img src="skull.png" alt="skull">`;

        this.specialSquares.forEach(square => {
            const specialCase = document.createElement('div');
            specialCase.className = `special_case ${square.type}`;
            specialCase.style.top = this.boardCoord[square.pos].top;
            specialCase.style.left = this.boardCoord[square.pos].left;
            specialCase.innerHTML = square.type === 'CLOVER' ? cloverHtml : square.type === 'ACES' ? acesHtml : skullHtml;
            board.appendChild(specialCase);
        });
    }
    
    setupCurrentPlayerIndicator() {
        const currentPlayerDiv = document.querySelector('.current_player');
        
        if (!document.querySelector('.current_player_card')) {
            const playerCard = document.createElement('div');
            playerCard.className = 'current_player_card yellow';
            
            const playerName = document.createElement('span');
            playerName.textContent = this.player1.name;
            
            const playerInfo = document.createElement('p');
            playerInfo.textContent = 'Current Player';
            
            playerCard.appendChild(playerName);
            playerCard.appendChild(playerInfo);
            currentPlayerDiv.appendChild(playerCard);
        } else {
            const playerCard = document.querySelector('.current_player_card');
            playerCard.className = 'current_player_card yellow';
            playerCard.querySelector('span').textContent = this.player1.name;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {

    if (loadGameState()) {
        document.querySelector('.start_form').style.display = "none";
        document.querySelector('.container').style.display = "flex";

        // Ensure dice event listener is added after loading game
        document.querySelector('.dice').addEventListener('click', () => {
            if (!game.diceEnabled) return;
            
            const diceRoll = game.rollDice();
            if (diceRoll === null) return;
            
            game.diceRollResult = diceRoll;
            updateDiceDisplay(diceRoll);
            
            setTimeout(() => {
                game.handleSpecialSquare();
            }, 2500);
        });
    } else {
        document.getElementById("start").addEventListener("click", () => {
            const p1name = document.getElementById("player1name").value;
            const p2name = document.getElementById("player2name").value;

            if (p1name.trim() === "" || p2name.trim() === "" || p1name === p2name) {
                document.getElementById("error").style.display = "block";
            } else {
                document.getElementById("error").style.display = "none";
                document.querySelector('.start_form').style.display = "none";
                document.querySelector('.pre_game_loader').style.display = "flex";
                loader();
                setTimeout(() => {
                    document.querySelector('.pre_game_loader').style.display = "none";
                    document.querySelector('.container').style.display = "flex";
                    
                    game = new Game(p1name, p2name);
                    game.initializeGame();
                    saveGameState();

                    document.querySelector('.dice').addEventListener('click', () => {
                        if (!game.diceEnabled) return;
                        
                        const diceRoll = game.rollDice();
                        if (diceRoll === null) return;
                        
                        game.diceRollResult = diceRoll;
                        updateDiceDisplay(diceRoll);
                        
                        setTimeout(() => {
                            game.handleSpecialSquare();
                        }, 2500);
                    });
                }, 3000);
            }
        });
    }

    function updateDiceDisplay(diceNumber) {
        const diceImg = document.querySelector('.dice img');
        const diceFaces = ['DICE-1.png', 'DICE-2.png', 'DICE-3.png', 'DICE-4.png', 'DICE-5.png', 'DICE-6.png'];
        let currentFace = 0;
        const interval = setInterval(() => {
            diceImg.src = diceFaces[currentFace];
            currentFace = (currentFace + 1) % diceFaces.length;
        }, 200);

        setTimeout(() => {
            clearInterval(interval);
            diceImg.src = `DICE-${diceNumber}.png`;
        }, 2000);
    }
});