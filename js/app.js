/* This is a memory game frogger style. The player
*  chooses a character icon to start the game.
*  Then 3 different colored gems are placed randomly
*  on the stone cells. After the stones are placed,
*  the player must retrieve them in the same order.
*  Touching a bug, the water, or the wrong gem restarts the
*  game. If all gems are collected, the number of gems
*  increases by one, and play continues. A player wins the
*  game by successfully collecting seven gems. The state of the game
*  is controlled with the gameState variable and can be in the
*  'pickPlayer', 'placeGems', or 'nextLevel' states.
*  The somewhat adjustable parameters for the game are below.
*/
var cellWidth = 101;
var cellHeight = 83;
var numCols = 5;
var numRows = 6;
var numWaterRows = 1;
var numStoneRows = 3;
var numGrassRows = 2;
var canvasVerticalOffset = 60;
var rowImages = [
    'images/water-block.png',   // Top row is water
    'images/stone-block.png',   // Row 1 of 3 of stone
    'images/stone-block.png',   // Row 2 of 3 of stone
    'images/stone-block.png',   // Row 3 of 3 of stone
    'images/grass-block.png',   // Row 1 of 2 of grass
    'images/grass-block.png',    // Row 2 of 2 of grass
];

var allGems = [];
var numGems = 3;
var gemCollisionDistance = 5;
var gemVerticalOffset = 60;
var gemHorizontalOffset = 25;
var gemImages = [
    'images/gem-blue.png',
    'images/gem-green.png',
    'images/gem-orange.png',
    'images/gem-yellow.png',
    'images/gem-red.png',
    'images/gem-pink.png',
    'images/gem-gray.png',
];

var player;
var playerVerticalOffset = -20;
var playerImages = [
    'images/char-boy.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
];

var allEnemies = [];
var enemyVerticalOffset = -20;
var enemyMaxSpeed = 250;
var enemyMinSpeed = 40;
var numEnemies = 3;
var enemyCollisionDistance = 70;
var enemyImages = [
    'images/enemy-bug.png',
];

var gameState = 'pickPlayer';  //starting state of game
var showTime = 1000;  // time to place each gem in milliseconds

/* Shuffle function from http://stackoverflow.com/a/2450976.
 * Called in restart.
 */
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

/* Enemy constructor--bugs moving at various speeds that player must avoid
*/
var Enemy = function() {
    this.sprite = enemyImages[0];
    this.initialize();
};

/* Initalize x so enemy is offscreen one or two cells to the left
*  Initialize y so enemy is centered on a stone row
*  Initialize speed between minimum and maximum speeds
*/
Enemy.prototype.initialize = function() {
    this.x = Math.floor(Math.random() - 2)*cellWidth;
    this.y = Math.floor(Math.random()*numStoneRows + numWaterRows)*cellHeight + enemyVerticalOffset;
    this.speed = Math.floor(Math.random()*(enemyMaxSpeed - enemyMinSpeed)) + enemyMinSpeed;
};

/* Update the enemy's position, required method for game
*  Parameter: dt, a time delta between ticks
*  update x position--every dt changes x position by speed times time interval
*  if enemy goes offscreen to right, re-initialize enemy
*/
Enemy.prototype.update = function(dt) {
    this.x += this.speed*dt;
    if (this.x > (numCols + 1)*cellWidth){
        this.initialize();
    }
};

/* Draw the enemy on the screen, required method for game
*/
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/* Called by reset()--makes a new array of enemies used for starting or resetting game
*/
function placeEnemies() {
    allEnemies = [];
    for (var i=0; i<numEnemies; i++){
        allEnemies.push(new Enemy());
    }
}

/* Player constructor--character controlled by arrow keys
*/
var Player = function() {
    // default image
    this.sprite = 'images/char-horn-girl.png';
    this.initialize();
};

/* Initalize x and y so player is on a grass cell
*/
Player.prototype.initialize = function() {
    this.x = Math.floor(Math.random()*numCols)*cellWidth;
    this.y = Math.floor(Math.random()*numGrassRows + numStoneRows + numWaterRows)*cellHeight + playerVerticalOffset;
};

/* Draw the player on the screen, required method for game
*/
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/* Called by keyboard listener--changes player coordinates based on arrow key input.
*  Function logic keeps the player on the board.
*  */
Player.prototype.handleInput = function(key) {
    if (gameState === 'playGame') {
        if (key === 'up' && this.y > playerVerticalOffset){
            this.y -= cellHeight;
        }
        else if (key === 'down' && this.y < cellHeight*(numRows-1) + playerVerticalOffset){
            this.y += cellHeight;
        }
        else if (key === 'left' && this.x > 0){
            this.x -= cellWidth;
        }
        else if (key === 'right' && this.x < cellWidth*(numCols-1)){
            this.x += cellWidth;
        }
    }
};

/* gem constructor--player tries to pick up gems in order placed
*/
var Gem = function(n) {
    this.sprite = gemImages[n];
    // gems are drawn during when gamestate =  'placeGems'
    this.show = false;
    // Initalize x and y so gems are on different stone cells
    done = false;
    while (!done){
        done = true;
        this.x = Math.floor(Math.random()*numCols)*cellWidth + gemHorizontalOffset;
        this.y = Math.floor(Math.random()*numStoneRows + numWaterRows)*cellHeight + gemVerticalOffset;
        for (var i=0; i < allGems.length; i++){
              if (this.x === allGems[i].x && this.y === allGems[i].y){
                  done = false;
              }
        }
    }
};

/* rebuild a gem array and show the gems in order one per second
*/
function placeGems() {
    allGems = [];
    for (var i=0; i < gemImages.length; i++){
        allGems.push(new Gem(i));
    }
    allGems = shuffle(allGems).slice(0,numGems);
    console.log(allGems);  // uncomment this for extra help in console
    allGems.forEach(function(gem) {
        setTimeout(function() {
            // change show property to render gem
            gem.show = true;
            // set timeout interval based on position in array
        }, showTime*(allGems.indexOf(gem)+1));
    });
    // after all gems are placed, change game state to 'playGame'
    // after an additional showTime
    setTimeout(function() {
      gameState = 'playGame';
    }, showTime*allGems.length);
};

/* Draw the gem on the screen, required method for game
*/
Gem.prototype.render = function() {
    if (this.show) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y, cellWidth/2, cellHeight/2);
    }
};

/* This listens for key presses and sends the keys to your
*  Player.handleInput() method. You don't need to modify this.
*/
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
