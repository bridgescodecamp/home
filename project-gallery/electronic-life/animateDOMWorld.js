// Alrighty then, now I wish my world had less life in it...
//Information Block
var infoDiv = elt("div");
infoDiv.setAttribute("id","info");
document.body.appendChild(infoDiv);
var playfield = elt("div");
playfield.setAttribute("id","playfield");
document.body.appendChild(playfield);
var infoSpan = elt("span");
var iterStr = ""
var turnTimeStr = "";
var tableDrawTimeStr = "";
var tableDrawTime = 0;
infoDiv.appendChild(infoSpan);
//Creating many elements, some with classes.
function elt(name, className){
    var elt = document.createElement(name);
    if (className) elt.className = className;
    return elt;
}
function DOMDisplay (parent, world){
    this.wrap = parent.appendChild(elt("div", "game"));
    this.world = world;
    this.actorLayer = null;
}
var scale = 10;
DOMDisplay.prototype.drawWorld = function() {
    var startTableDraw = Date.now();
    var table = elt("table", "background");
    // var grid = this.world.grid;
    var worldString = this.world.toString();
    var worldArray = worldString.split("\n");
    table.style.width = scale * worldArray[0].length;
    table.style.height = scale * worldArray.length;
    for (var y = 0; y < worldArray.length; y++) {
        var row = elt("tr", "row: " + y);
        for (var x = 0; x < worldArray[y].length; x++){
            var element = worldArray[y].charAt(x);
            var td = elt("td");
            td.style.width = scale + "px";
            td.style.height = scale + "px";
            // td.innerText = element;
            td.className = element;
            td.setAttribute("location", ""+x+","+y);
            row.appendChild(td);
        }
        table.appendChild(row);
    }
    var endTableDraw = Date.now();
    tableDrawTime = endTableDraw - startTableDraw;
    this.worldTable = table;
    document.getElementById('playfield').appendChild(table);
}
DOMDisplay.prototype.updateWorld = function(){
    var startTurn = Date.now();
    this.world.turn();
    // var cellCollection = document.querySelectorAll("td");
    // var grid = this.world.grid;
    var worldArray = this.world.toString().split("\n");    
    var displayedTable = document.querySelector(".background");
    for (var y = 0; y < worldArray.length; y++) {
        var row = displayedTable.rows[y];
        for (var x = 0; x < worldArray[y].length; x++){
            var cell = row.cells[x];
            if (cell.className != worldArray[y].charAt(x)){
                cell.className = worldArray[y].charAt(x);
                // cell.innerText = worldArray[y].charAt(x);
            }
        }
    }
    var endTurn = Date.now();
    turnTimeStr = "TurnTime: " + (endTurn - startTurn) +"ms";
}
var iterations = 0;
function runAnimation() {
    var lastTime = null;
    function frame(time) {
      var stop = false;
      if (lastTime != null) {
        this.life.updateWorld();
        iterations++;
        iterStr = "Iterations: " + iterations;
        tableDrawTimeStr = "TableDrawTime: " + tableDrawTime + "ms";
        infoSpan.innerText = iterStr + " " + turnTimeStr + " " + tableDrawTimeStr;
      }
      lastTime = time;
      if (!stop)
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}
window.runGame = function (world) {
    var playField = document.getElementById("playfield");
    this.life = new DOMDisplay(playField, world);
    this.life.drawWorld();
    runAnimation();
};