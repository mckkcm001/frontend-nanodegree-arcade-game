// set parameters for game
var cellWidth = 101;
var cellHeight = 83;
var numCols = 5;
var numRows = 6;
var numWaterRows = 1;
var numStoneRows = 3;
var numGrassRows = 2;
var enemyVerticalOffset = 60;
var playerVerticalOffset = 60;
var enemyMaxSpeed = 250;
var enemyMinSpeed = 40;
var numEnemies = 3;
var collisionDistance = 70;
var allEnemies;
var player;

// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.initialize();
};

Enemy.prototype.initialize = function() {
    // Initalize x so enemy is offscreen one or two cells to the left
    // Initialize y so enemy is centered on a stone row
    // Initialize speed between minimum and maximum speeds
    this.x = Math.floor(Math.random() - 2)*cellWidth;
    this.y = Math.floor(Math.random()*numStoneRows)*cellHeight + enemyVerticalOffset;
    this.speed = Math.floor(Math.random()*(enemyMaxSpeed - enemyMinSpeed)) + enemyMinSpeed;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // update x position--every dt changes x position by speed times time interval
    // if enemy goes offscreen to right, re-initialize enemy
    this.x += this.speed*dt;
    if (this.x > (numCols + 1)*cellWidth){
        this.initialize();
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.sprite = 'images/char-boy.png';
    this.initialize();
};

Player.prototype.initialize = function() {
    // Initalize x and y so player is on a grass cell
    this.x = Math.floor(Math.random()*numCols)*cellWidth;
    this.y = Math.floor(Math.random()*numGrassRows + numStoneRows)*cellHeight + playerVerticalOffset;
};

Player.prototype.update = function(dt) {

};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function(key) {
    if (key === 'up' && this.y > 0){
        this.y -= cellHeight;
    }
    else if (key === 'down' && this.y < cellHeight*(numRows-2)){
        this.y += cellHeight;
    }
    else if (key === 'left' && this.x > 0){
        this.x -= cellWidth;
    }
    else if (key === 'right' && this.x < cellWidth*(numCols-1)){
        this.x += cellWidth;
    }
};
// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player



// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
