
document.getElementById("board").innerHTML = '<h2>Jewel Match</h2> ' + 
    '<div class="leftBox button" id="newGame"><h3>New Game</h3></div> ' +
    '<div class="leftBox button" id="pause"><h3>Pause</h3></div> ' +
    '<div class="leftBox button" id="quitGame"><h3>Quit Game</h3></div> ' +
    '<div class="leftBox button" id="saveGame"><h3>Save</h3></div> ' +
    '<div class="leftBox button" id="loadGame"><h3>Load</h3></div> ' +
    '<div class="leftBox" id="scoreBox">0</div> ' +
    '<div class="leftBox" id="scoreBubble"></div> ' +
    '<div class="leftBox" id="level">Level 1</div> ' +
    '<div class="grid" id="jewelBoard"></div> ' +
    '<div id="timeMeter"><div id="timeLeft"></div></div> ' +
    '<div id="cover"></div> ' +
    '<div class="leftBox button" id="clearData"><h3>!! Clear Saves !!</h3></div>';


/** the objects of the game board. jo = jewel objects */
var jo = {
    gameBoard: document.getElementById('jewelBoard'),
    pointsBox: document.getElementById('scoreBox'),
    latestPointsBox: document.getElementById('scoreBubble'),
    timeLeft: document.getElementById('timeLeft'),
    cover: document.getElementById('cover'),
    level: document.getElementById('level'),
    pause: document.getElementById('pause')
};
Object.seal(jo);
/** the variables and values of the game board. jv = jewel variables*/
var jv = {
    activeScreen: false,
    activeGems: [],
    totalMatches: [],
    jewelGrid: [], 
    points: 0, lastPoints: 0, 
    time: 0, timeClock: 0,  
    timeDelay: 300,
    gamePaused: false, changing: false,
    switchRedo: true, switchBack: true,
    jewels: ['gem opal', 'gem diamond', 'gem emerald', 'gem ruby', 'gem saphire', 'gem pearl', 'gem rhinestone'],
    saveData: []
};
Object.seal(jv);

/** Fills board with gem pieces for the beggining of the game, and resets the game stats back to defaults. */
var fillBoard = function() {
    jo.gameBoard.innerHTML = '';
    jv.jewelGrid = [];
    for(var row = 0; row < 8; row++) {
        jv.jewelGrid.push([]);
        for(var col = 0; col < 8; col++) {
            var boss = document.body;
            var gemPiece = jo.gameBoard.appendChild(boss.ownerDocument.createElement('canvas'));
            gemPiece.className = jv.jewels[Math.floor(Math.random() * 7)];
            gemPiece.id = 'gem' + col + row; // giving unique id names for anti-duplication purposes.
            gemPiece.style.left = (row * 50 + 3) + 'px';
            gemPiece.style.top = (col * 50 + 3) + 'px';
            gemPiece.x1 = row;
            gemPiece.y1 = col;
            gemPiece.addEventListener('click', function(event) { 
                if(!jv.changing){
                    var self1 = event.target;
                    jv.activeGems.push(self1);
                    jv.switchBack = true;
                    if(jv.activeGems.length === 2) { 
                        jv.changing = true;
                        switchGems();
                    }
                    else { jv.activeGems[0].style.padding = '2px'; } // change to something else!!!!
                }
                event.stopPropagation();
            });
            jv.jewelGrid[row].push(gemPiece);
        }
    }
    while(checkBoard()) {
        removeGems();
        refillBoard();
    }
    setDefaultSettings();
    startTimeClock();
}

var setDefaultSettings = function() {
    jv.points = 0; 
    jv.lastPoints = 0;
    jo.pointsBox.innerHTML = jv.points;
    jo.latestPointsBox.innerHTML = jv.lastPoints;
    jo.level.innerHTML = "Start";
    jv.totalMatches = [];
    jv.timeDelay = 500;
    jv.time = 100;
}

/** If lose game occurs, or quit game button pressed, clearBoardEndGame resets values, and clears div elements */
var clearBoardEndGame = function() {
  //  jo.gameBoard.innerHTML = '<div class="end">Game Over</div>';
    clearGrid();
    jo.cover.className = 'grid';
    jo.cover.innerHTML = '<div class="end" id="cover">Game Over</div>';

    jv.points = 0; jv.lastPoints = 0; jv.time = 0;
    jo.timeLeft.width = jv.time + "%";
    jv.jewelGrid = [];
}
/** if two gems are selected, switches position of gems, then -- checkForMatch() */
var switchGems = function() {
    var xdis = jv.activeGems[0].x1 - jv.activeGems[1].x1;
    var ydis = jv.activeGems[0].y1 - jv.activeGems[1].y1;
    jv.activeGems[0].style.padding = '0px';
    if (((xdis === 1 || xdis === -1) && ydis === 0) || (xdis === 0 && (ydis === 1 || ydis === -1))) {
        var zero = jv.activeGems[0].className;
        jv.activeGems[0].className = jv.activeGems[1].className;
        jv.activeGems[1].className = zero;
    }
    if(jv.switchBack) {
        var isMatchA = checkForMatch(jv.activeGems[0]);
        var isMatchB = checkForMatch(jv.activeGems[1]);
        jv.switchBack = false;
        if(isMatchA || isMatchB) { 
            setTimeout(function() {
               // var bonus = 0;
                removeGems(0);
                setTimeout(function() {
                    fallingGems();
                    fallingGems();
                    refillBoard();
                }, 200);
                cascadeAfterSwitch();
            }, 400);
        }
        else {
            setTimeout(function() {
                switchGems();
                jv.changing = false;
                jv.activeGems = [];},  400);
        }
        startTimeClock();
    }
}

var cascadeAfterSwitch = function() {
    var bonus = 0;
    var delay = setInterval(function() {
        if (checkBoard()) {
            bonus += 10;
            removeGems(bonus);
            setTimeout(function() {
                fallingGems();
                fallingGems();
                refillBoard();
            }, 200);
        } else { 
            jo.latestPointsBox.innerHTML = jv.lastPoints;
            jo.pointsBox.innerHTML = jv.points;
            jv.lastPoints = 0;
            jv.changing = false;
            jv.activeGems = [];
            clearInterval(delay);
            delay = null;
            if (noPossibleMatch()) {
                clearGrid();
                refillBoard();
                var savePoints = jv.points, saveTime = jv.time;
                while (checkBoard()) {
                    removeGems();
                    refillBoard();
                }
                jv.points = savePoints;
                jv.time = saveTime;
            } 
        }
    }, 400);
}

/** checks the board for sets of three in a row, by checking the class names. returns true if found three in a row**/
var checkForMatch = function(gem) {
    var matchesX = [], matchesY = [], xPos = gem.x1, yPos = gem.y1, tempGem;
    while (xPos > 0) {
        xPos += -1; tempGem = jv.jewelGrid[xPos][yPos]; 
        if(tempGem.className === gem.className) { matchesX.push(tempGem);}
        else { break; }
    }
    xPos = gem.x1;
    while(7 > xPos) {
        xPos += 1; tempGem = jv.jewelGrid[xPos][yPos]; 
        if(tempGem.className === gem.className) { matchesX.push(tempGem);}
        else { break; }
    }
    xPos = gem.x1;
    while(yPos > 0) {
        yPos += -1; tempGem = jv.jewelGrid[xPos][yPos]; 
        if(tempGem.className === gem.className) { matchesY.push(tempGem);}
        else { break; }
    }
    yPos = gem.y1;
    while(7 > yPos) {
        yPos += 1; tempGem = jv.jewelGrid[xPos][yPos]; 
        if(tempGem.className === gem.className) { matchesY.push(tempGem);}
        else { break; } 
    }
    if(matchesX.length > 1 || matchesY.length > 1) {
        if(notInMatches(gem)) { jv.totalMatches.push(gem); }
        if(matchesX.length > 1) {
            for(var i = 0; i < matchesX.length; i++) {
                if(notInMatches(matchesX[i])) { jv.totalMatches.push(matchesX[i]); }
            }
        } 
        if(matchesY.length > 1) {
            for(var j = 0; j < matchesY.length; j++) {
                if(notInMatches(matchesY[j])) { jv.totalMatches.push(matchesY[j]); }
            }
        }
        return true;
    }
    else { return false; }
}

/** Removes Gems in the totalMatches gem list. */
var removeGems = function(bonus) {
    jv.lastPoints += (jv.totalMatches.length * 20) - 15 + bonus;
    jv.points += (jv.totalMatches.length * 20) - 15 + bonus;
    jv.time += jv.totalMatches.length + (Math.floor(jv.points/4000));
    if(jv.time > 100) { jv.time = 100; }
    for(var h = 0; h < jv.totalMatches.length; h++) {
        jv.totalMatches[h].className = 'gem clear';
        jv.totalMatches[h].style.padding = '0px';
    }
    jv.totalMatches = [];
    jv.activeGems = [];
}

var checkBoard = function() {
    var foundMatch = false;
    for(var x = 0; x < jv.jewelGrid.length; x++) {
        for(var y = 0; y < jv.jewelGrid[x].length; y++) {
            var tempGem = jv.jewelGrid[x][y];
            if((tempGem.className != 'gem clear') && checkForMatch(tempGem)) {
                foundMatch = true;
            }
        }
    }
    return foundMatch;
}

var notInMatches = function(gem) {
    var noMatch = true;
    for(var i = 0; i < jv.totalMatches.length; i++) {
        if(jv.totalMatches[i].id === gem.id) { noMatch = false; break; }
    } return noMatch;
}

var fallingGems = function() {
    jv.activeGems = [];
    for(var x = 0; x < jv.jewelGrid.length; x++) {
        for(var y = jv.jewelGrid[x].length - 1; y > 0; y--) {
            if(jv.jewelGrid[x][y].className === 'gem clear' && y > 0) {
                var n = y - 1;
                while(n >= 0 && jv.jewelGrid[x][n].className === 'gem clear') { n--; }
                while(n >= 0) {
                    jv.jewelGrid[x][y].className = jv.jewelGrid[x][n].className; 
                    jv.jewelGrid[x][n].className = 'gem clear';
                    n--; y--;
                }
            }
        }
    }
}

var clearGrid = function() {
    for(var x = 0; x < jv.jewelGrid.length; x++) {
        for(var y = 0; y < jv.jewelGrid[x].length; y++) {
            jv.jewelGrid[x][y].className = 'gem clear';
        }
    }
}

var refillBoard = function() {
    var filled = false;
    for(var x = 0; x < jv.jewelGrid.length; x++) {
        for(var y = 0; y < jv.jewelGrid[x].length; y++) {
            jv.jewelGrid[x][y].style.padding = '0px';
            if(jv.jewelGrid[x][y].className === 'gem clear') { 
                jv.jewelGrid[x][y].className = jv.jewels[Math.floor(Math.random() * 7)];
                filled = true;
            }
        }
    }
    return filled;
}

var noPossibleMatch = function() {
    var r, c, matchedForSwap = true;
    for (r = 0; r < 8; r++) {
        for (c = 0; c < 8; c++) {
            if (c < 7 && jv.jewelGrid[c][r].className != jv.jewelGrid[c+1][r].className && swapCheckHorizontal(c, r)) { return false; }
            else if (r < 7 && jv.jewelGrid[c][r].className != jv.jewelGrid[c][r+1].className && swapCheckVertical(c, r)) { return false; }
    }   }
    return true;
}

var swapCheckHorizontal = function(c, r) {
    var leftGem = jv.jewelGrid[c][r].className, rightGem = jv.jewelGrid[c+1][r].className;
    /** checking the three sides of the left gem for a match to the right gem */
    if (c > 1 && rightGem == jv.jewelGrid[c-1][r].className && rightGem == jv.jewelGrid[c-2][r].className)      { return true; } 
    else if (r > 1 && rightGem == jv.jewelGrid[c][r-1].className && rightGem == jv.jewelGrid[c][r-2].className) { return true; }
    else if (r < 6 && rightGem == jv.jewelGrid[c][r+1].className && rightGem == jv.jewelGrid[c][r+2].className) { return true; }
    else if (r > 0 && r < 7 && rightGem == jv.jewelGrid[c][r+1].className && rightGem == jv.jewelGrid[c][r-1].className) { return true; }
    /** checking the three sides of the right gem for a match to the left gem */
    else if (c < 5 && leftGem == jv.jewelGrid[c+2][r].className && leftGem == jv.jewelGrid[c+3][r].className)     { return true; }
    else if (r > 1 && leftGem == jv.jewelGrid[c+1][r-1].className && leftGem == jv.jewelGrid[c+1][r-2].className) { return true; }
    else if (r < 6 && leftGem == jv.jewelGrid[c+1][r+1].className && leftGem == jv.jewelGrid[c+1][r+2].className) { return true; }
    else if (r > 0 && r < 7 && leftGem == jv.jewelGrid[c+1][r-1].className && leftGem == jv.jewelGrid[c+1][r+1].className) { return true; }
    else { return false; }
}

var swapCheckVertical = function(c, r) {
    var topGem = jv.jewelGrid[c][r].className, bottomGem = jv.jewelGrid[c][r+1].className;
    /** checking the three sides of the top gem for a match to the bottom gem */
    if (r > 1 && bottomGem == jv.jewelGrid[c][r-1].className && bottomGem == jv.jewelGrid[c][r-2].className)      { return true; } 
    else if (c > 1 && bottomGem == jv.jewelGrid[c-1][r].className && bottomGem == jv.jewelGrid[c-2][r].className) { return true; }
    else if (c < 6 && bottomGem == jv.jewelGrid[c+1][r].className && bottomGem == jv.jewelGrid[c+2][r].className) { return true; }
    else if (c > 0 && c < 7 && bottomGem == jv.jewelGrid[c+1][r].className && bottomGem == jv.jewelGrid[c-1][r].className) { return true; }
    /** checking the three sides of the bottom gem for a match to the top gem */
    else if (r < 5 && topGem == jv.jewelGrid[c][r+2].className && topGem == jv.jewelGrid[c][r+3].className)     { return true; }
    else if (c > 1 && topGem == jv.jewelGrid[c-1][r+1].className && topGem == jv.jewelGrid[c-2][r+1].className) { return true; }
    else if (c < 6 && topGem == jv.jewelGrid[c+1][r+1].className && topGem == jv.jewelGrid[c+2][r+1].className) { return true; }
    else if (c > 0 && c < 7 && topGem == jv.jewelGrid[c-1][r+1].className && topGem == jv.jewelGrid[c+1][r+1].className) { return true; }
    else { return false; }
}

var startTimeClock = function() {
    if(jv.timeClock) { clearInterval(jv.timeClock); jv.timeClock = null; }
    jo.timeLeft.style.width = jv.time + '%';
    jv.timeDelay = 500 - (Math.floor(jv.points / 1000) * 25); 
    if (jv.timeDelay < 80) { jv.timeDelay = 80; }
    jo.level.innerHTML = "Level " + (Math.floor(jv.points / 1000));
    jv.timeClock = setInterval(function() {
        jv.time -= .25;
        jo.timeLeft.style.width = jv.time + '%';
        if (jv.time <= 0) { clearBoardEndGame(); clearInterval(jv.timeClock); jv.timeClock = null; }
    }, jv.timeDelay);
}
/** Allows for time interval to be cleared, and restarted. along with a cover for the board. */
var gamePauseResume = function() {
    if(jv.gamePaused && !jv.timeClock) { 
        jo.cover.innerHTML = '';
        jo.cover.className = '';
        startTimeClock();
        jo.pause.innerHTML = '<h3>Pause</h3>';
        jv.gamePaused = false;
    }
    else { 
        jv.activeGems = [];
        jo.cover.className = 'grid';
        jo.cover.innerHTML = '<div class="end" id="cover">Paused</div>';
        clearInterval(jv.timeClock);
        jv.timeClock = null;
        jo.pause.innerHTML = '<h3>Resume</h3>';
        jv.gamePaused = true;
    }
}

var getClassNames = function() {
    var classNames = [];
    for(var x = 0; x < jv.jewelGrid.length; x++) {
        classNames.push([]);
        for(var y = 0; y < jv.jewelGrid[x].length; y++) {
            classNames[x].push(jv.jewelGrid[x][y].className);
        }
    }
    return classNames;
}

var setClassNames = function(classNames) {
    for(var x = 0; x < jv.jewelGrid.length; x++) {
        for(var y = 0; y < jv.jewelGrid[x].length; y++) {
            jv.jewelGrid[x][y].className = classNames[x][y];
        }
    }
}

var saveGame = function() {
    if(jv.jewelGrid.length === 8) { 
        jv.saveData = JSON.parse(localStorage.getItem("jewelSaveData")) || {};
        var currentSaveNames = "Save Names Used: "
        for(var n in jv.saveData) { currentSaveNames += n + ": " + jv.saveData[n].currentPoints + ", "; }
        var saveName = prompt(currentSaveNames, "");

        if (saveName && saveName !== "" && saveName !== null) {
            var saveFile = {
                currentPoints: jv.points,
                currentTime: jv.time,
                currentBoard: getClassNames()
            }
            jv.saveData[saveName] = saveFile;
            localStorage.setItem("jewelSaveData", JSON.stringify(jv.saveData));
        }
        else { 
            jo.pointsBox.innerHTML = "Need a name!!";
         }
    } else {
        jo.pointsBox.innerHTML = "Can't save!!";
    }
}

var loadGame = function() {
    jv.saveData = JSON.parse(localStorage.getItem("jewelSaveData")) || {};
    if(jv.saveData) {
        var currentSaveNames = "Load Names Available: ";
        for(var n in jv.saveData) { currentSaveNames += n + ": " + jv.saveData[n].currentPoints + ", "; }
        var loadName = prompt(currentSaveNames, "");
        if(!jv.saveData[loadName] || loadName === "" || loadName === null) { jo.pointsBox.innerHTML = "No Save for " + loadName; } 
        else {
            var loadData = jv.saveData[loadName];
            jo.cover.innerHTML = '';
            jo.cover.className = '';
            if(jv.gamePaused) { pauseGameResume(); }
            if(jv.jewelGrid.length < 8) { fillBoard(); }
            jv.points = loadData.currentPoints;
            jv.time = loadData.currentTime;
            setClassNames(loadData.currentBoard);
            jo.latestPointsBox.innerHTML = jv.lastPoints;
            jo.pointsBox.innerHTML = jv.points;
            startTimeClock();
        }
    } else {jo.pointsBox.innerHTML = "No Save Data!"}
}


/** game function buttons for New Game, Quit Game, and Pause. */
document.getElementById('newGame').addEventListener('click', function() { 
    if(jv.gamePaused) { gamePauseResume(); } 
    clearBoardEndGame(); 
    if(jv.jewelGrid.length < 8) { fillBoard(); } 
    else refillBoard();  
    jo.cover.innerHTML = '';
    jo.cover.className = '';
});

document.getElementById('quitGame').addEventListener('click', function() { 
    if(jv.gamePaused) { gamePauseResume(); } clearBoardEndGame();});

jo.pause.addEventListener('click', function() { 
    gamePauseResume(); });

document.getElementById('saveGame').addEventListener('click', function() {
    saveGame(); });

document.getElementById('loadGame').addEventListener('click', function() {
    if(jv.gamePaused) { gamePauseResume(); } loadGame(); });

document.getElementById('clearData').addEventListener('click', function() {
    localStorage.clear();
});
