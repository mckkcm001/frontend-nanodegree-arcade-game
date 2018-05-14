/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make
 * writing app.js a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;
        counter = 0;

    canvas.width = cellWidth*numCols;
    canvas.height = cellHeight*numRows + canvasVerticalOffset;
    doc.getElementById('canvas').appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;
        counter += dt;
        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data.
     */
    function update(dt) {
        updateEntities(dt);
        checkEnemyCollisions();
        checkGemCollisions();
        checkWaterCollisions();
    }

    // check for enemy collisions, restart game if collision occurs
    function checkEnemyCollisions() {
        for (var i=0; i < numEnemies; i++){
            if (allEnemies[i].y === player.y){
                if (Math.abs(allEnemies[i].x - player.x) < enemyCollisionDistance){
                    numGems = 3;
                    gameState = 'pickPlayer';
                    init();
                }
            }
        }
    }

    // check for gem collisions in right order
    function checkGemCollisions(){
        // check all gems
        for (var i=0; i < allGems.length; i++){
            // collision test
            if (Math.abs(allGems[i].y - gemVerticalOffset - player.y + playerVerticalOffset) < gemCollisionDistance
                && Math.abs(allGems[i].x -gemHorizontalOffset - player.x) < gemCollisionDistance) {
                // check if this is the first gem in array
                if (i === 0) {
                    // drop the first gem from array
                    allGems.splice(0,1);
                    // check to see if all gems collected
                    if (allGems.length === 0){
                        // if seven gems collected, game is won
                        if (numGems === 7){
                            endGame();
                        }
                        // go to next level (one more gem)
                        else {
                            numGems++;
                            gameState = 'nextLevel';
                            init();
                        }
                    }
                }
                // wrong gem so reset game
                else {
                    numGems = 3;
                    gameState = 'pickPlayer';
                    init();
                }
            }
        }
    }

    // check for player in water
    function checkWaterCollisions() {
        if (player.y < cellHeight + playerVerticalOffset){
            numGems = 3;
            gameState = 'pickPlayer';
            init();
        }
    }

    // called when end of game is reached
    function endGame(){
        alert('YOU WON!!');
        numGems = 3;
        gameState = 'pickPlayer';
        init();
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        // Before drawing, clear existing canvas
        ctx.clearRect(0,0,canvas.width,canvas.height)

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (var row = 0; row < numRows; row++) {
            for (var col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * cellWidth, row * cellHeight);
            }
        }

        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        allGems.forEach(function(gem) {
            gem.render();
        });

        player.render();
    }

    /* Called by init()--if this is the start, or restart, then construct a new
     * player and enemies, and hide the remaining gems. Show the player
     * instructions and icons. Wait for the player to pick an icon, then place
     * the gems. If this is a level up, then reposition the player icon on the grass,
     * construct new enemies, and place the gems.
     */
    function reset() {
        if (gameState === 'pickPlayer') {
            player = new Player();
            placeEnemies();
            allGems.forEach(function(gem) {
                gem.show = false;
            });

            // make and place instructions
            var instructionPar = doc.createElement('p');
            instructionPar.id = 'instructionPar';
            instructionPar.innerHTML =
                "Click on a player icon below to start. " +
                "Use the arrow keys to move player left, right, up, or down. " +
                "Pick up the gems in the order presented. " +
                "Game is over when player hits a bug, goes in the water, or picks the wrong gem. " +
                "To win the game, complete the seven gem challenge (there may be " +
                "unsolvable positions. Just run into any gem or bug and start over.)";
            // control width
            instructionPar.style.maxWidth = (cellWidth*numCols).toString()+'px';
            doc.getElementById('game').appendChild(instructionPar);

            // make and place the player icon choices
            var buttonDiv = doc.createElement('div');
            buttonDiv.id = 'buttonDiv';
            playerImages.forEach(function(image) {
                var button = doc.createElement('button');
                var img = doc.createElement('img');
                img.src = image;
                button.appendChild(img);
                buttonDiv.appendChild(button);
                button.onclick = function(e) {
                    player.sprite = image;
                    gameState = 'placeGems';
                    // when an icon is selected, remove instructions and icons
                    instructionPar.remove();
                    buttonDiv.remove();
                    placeGems();
                };
            });
            // control width
            buttonDiv.style.maxWidth = (cellWidth*numCols).toString()+'px';
            doc.getElementById('game').appendChild(buttonDiv);

            // check for button click every 100 milliseconds
            function wait() {
                if (gameState === 'pickPlayer') {
                    setTimeout(wait,100);
                }
            }
            wait();
        }

        if (gameState === 'nextLevel'){
            // reposition player on grass
            player.initialize();
            placeEnemies();
            placeGems();
        }
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/gem-blue.png',
        'images/gem-orange.png',
        'images/gem-green.png',
        'images/gem-red.png',
        'images/gem-yellow.png',
        'images/gem-gray.png',
        'images/gem-pink.png',
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
