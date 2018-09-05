// Here we create... LIFE!
//Vectors are two dimentional. Yo.
function Vector(x,y){
    this.x = x;
    this.y = y;
}
Vector.prototype.plus = function(other) {
    return new Vector(this.x + other.x, this.y + other.y);
};
// grid is one dimentional [x*y]
function Grid (width, height){
    this.space = new Array(width * height);
    this.width = width;
    this.height = height;
}
Grid.prototype.isInside = function(vector){
    return  vector.x >= 0 && vector.x < this.width &&
            vector.y >= 0 && vector.y < this.height;
    };
Grid.prototype.get = function (vector) {
    return this.space[vector.x + this.width * vector.y];
    };
Grid.prototype.set = function (vector, value) {
    this.space[vector.x + this.width * vector.y] = value;
    };
Grid.prototype.forEach = function(f, context) {
    for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
        var value = this.space[x + y * this.width];
        if (value != null)
            f.call(context, value, new Vector(x, y));
        }
    }
    };    
// Some cardinal directions, vectorized.
var directions = {
    "n" : new Vector( 0,-1),
    "ne": new Vector( 1,-1),
    "e" : new Vector( 1, 0),
    "se": new Vector( 1, 1),
    "s" : new Vector( 0, 1),
    "sw": new Vector(-1, 1),
    "w" : new Vector(-1, 0),
    "nw": new Vector(-1,-1)
};
var directionNames = "n ne e se s sw w nw".split(" ");
function randomElement (array) {
    return array[Math.floor(Math.random() * array.length)];
}
// Viewing things, and stuff...
function View(world, vector){
    this.world = world;
    this.vector = vector;
}
View.prototype.look = function(dir) {
    var target = this.vector.plus(directions[dir]);
    if (this.world.grid.isInside(target))
      return charFromElement(this.world.grid.get(target));
    else
      return "#";
  };
View.prototype.findAll = function(ch) {
    var found = [];
    for (var dir in directions)
      if (this.look(dir) == ch)
        found.push(dir);
    return found;
  };
View.prototype.find = function(ch) {
    var found = this.findAll(ch);
    if (found.length == 0) return null;
    return randomElement(found);
  };
View.prototype.findEach = function(array) {
    var found = [];
    for (var dir in directions)
        if (array.includes(this.look(dir)))
            found.push(dir);
    return found;
}
// Critters
// *
function Plant(){
    this.energy = 3 + Math.random() * 4;
}
Plant.prototype.act = function (view){
    if (this.energy > 10) {
        var space = view.find(" ");
        if (space)
            return {type:"reproduce", direction: space};
    }
    return {type: "grow"};
}
// x
function Weed () {
    this.energy = 1 + Math.random() * 3;
}
Weed.prototype.act = function (view){
    if (this.energy >= 11)
        this.energy = -1;
    if (this.energy > 10){
        var space = view.find(" ");
        if (space)
            return {type:"reproduce", direction:space};
    }
    var plant = view.find("*");
    if (plant){
        return {type:"sapEnergy", direction:plant};
    }
    if (this.energy < 10){
        return {type:"grow"};
    }
}
// .
function Bunny (){
    this.energy = 5;
}
Bunny.prototype.act = function (view){
    var space = view.find(" ");
    if (this.energy > 10 && space)
        return {type:"reproduce", direction:space};
    var weed = view.find("x");
    if (weed)
        return {type:"eat",direction: weed};
    var critter = view.findEach(["*","o","@","$","%"]);
    if (critter.length >= 1)
        return {type:"sapEnergy", direction:critter}
    if (space)
        return {type:"move", direction:space};
}
// o
function Herbivore(){
    this.energy = 40;
}
Herbivore.prototype.act = function (view){
    var space = view.find(" ");
    if (this.energy > 50 && space)
        return {type:"reproduce", direction: space};
    var plant = view.findEach(["*","x"]);
    if (plant.length >= 1)
        var eatMe = randomElement(plant);
        return {type:"eat", direction: eatMe};
    if (space)
        return {type:"move", direction: space};
};
// @
function Carnivore(){
    this.energy = 80;
}
Carnivore.prototype.act = function (view){
    var space = view.find(" ");
    if (this.energy > 100 && space)
        return {type:"reproduce", direction:space};
    var prey = view.findEach([".","o","%","$"]);
    if (prey.length >= 1)
        var eatMe = randomElement(prey);
        return {type:"eat", direction:eatMe};
    if (space)
        return {type:"move", direction:space};
}
// %
function FirstOmnivore(){
    this.energy = 60;
}
FirstOmnivore.prototype.act = function(view){
    var space = view.find(" ");
    if (this.energy > 70 && space)
        return {type:"reproduce", direction:space};
    var food = view.findEach(["*","@","x",".","$"]);
    if (food.length >= 1){
        var eatMe = randomElement(food)
        return {type:"eat", direction:eatMe};}
    if (space)
        return {type:"move", direction:space};
}
// $
function AnotherOmnivore(){
    this.energy = 60;
}
AnotherOmnivore.prototype.act = function(view){
    var space = view.find(" ");
    if (this.energy > 70 && space)
        return {type:"reproduce", direction:space};
    var food = view.findEach(["o","*","@","%"]);
    if (food.includes("x") && space && this.energy > 63)
        return {type:"generateCritter",direction:space};
    if (food.length >= 1){
        var eatMe = randomElement(food)
        return {type:"eat", direction:eatMe};}
    if (space)
        return {type:"move", direction:space};
}
//Action handlers
var actionTypes = Object.create(null);
actionTypes.grow = function (critter){
    critter.energy += 0.5;
    return true;
};
actionTypes.move = function (critter, vector, action) {
    var dest = this.checkDestination(action, vector);
    if (dest == null ||
        critter.energy <= 0.1 ||
        this.grid.get(dest) != null)
        return false;
    critter.energy -= 1;
    this.grid.set(vector, null);
    this.grid.set(dest, critter);
    return true;
};
actionTypes.eat = function(critter, vector, action) {
    var dest = this.checkDestination(action, vector);
    var atDest = dest != null && this.grid.get(dest);
    if (!atDest || atDest.energy == null)
        return false;
    critter.energy += atDest.energy;
    this.grid.set(dest, null);
    return true;
};
actionTypes.reproduce = function(critter, vector, action){
    var baby = elementFromChar(this.legend, critter.originChar);
    var dest = this.checkDestination(action, vector);
    if (dest == null || critter.energy <= 2 * baby.energy ||
        this.grid.get(dest) != null)
        return false;
    critter.energy -= 2*baby.energy;
    this.grid.set(dest, baby);
    return true;
};

actionTypes.sapEnergy = function(critter, vector, action){
    var dest = this.checkDestination(action, vector);
    var atDest = dest != null && this.grid.get(dest);
    if (!atDest || atDest.energy == null)
        return false;
    var sappedEnergy = atDest.energy/5;
    critter.energy += sappedEnergy;
    atDest.energy -= sappedEnergy;
    return true;
};

actionTypes.generateCritter = function(critter, vector, action){
    var spawn = new Bunny();
    var dest = this.checkDestination(action, vector);
    if (dest == null || critter.energy <= 2*spawn.energy || this.grid.get(dest) != null)
        return false;
    critter.energy -= spawn.energy;
    this.grid.set(dest, spawn);
    return true;
}
actionTypes.evolve = function(critter){
    //change one step up the food chain.
    critter = new Carnivore;
}


// Our first "world"

function elementFromChar (legend, ch) {
    if (ch == " ") return null;
    var element = new legend[ch]();
    element.originChar = ch;
    return element;
}

function charFromElement(element) {
    if (element == null) 
        return " ";
    else 
        return element.originChar;
}

function World (map, legend) {
    var grid = new Grid(map[0].length, map.length);
    this.grid = grid;
    this.legend = legend;

    map.forEach(function(line, y) {
        for (var x = 0; x<line.length; x++){
            grid.set(new Vector(x,y),
                elementFromChar(legend, line[x]));
        }
    });
}

World.prototype.toString = function() {
    var output = "";
    for (var y = 0; y< this.grid.height; y++){
        for (var x = 0; x < this.grid.width; x++){
            var element = this.grid.get(new Vector(x,y));
            output += charFromElement(element);
        }
        output += "\n";
    }
    return output;
};

World.prototype.turn = function() {
    var acted = [];
    this.grid.forEach(function(critter, vector) {
        if (critter.act && acted.indexOf(critter) == -1){
            acted.push(critter);
            this.letAct(critter, vector);
        }
    }, this);
};

World.prototype.letAct = function (critter, vector){
    var action = critter.act(new View(this, vector));
    if (action && action.type == "move") {
        var dest = this.checkDestination(action, vector);
        if (dest && this.grid.get(dest) == null) {
            this.grid.set(vector, null);
            this.grid.set(dest, critter);
        }
    }
};
World.prototype.checkDestination = function (action, vector) {
    if (directions.hasOwnProperty(action.direction)) {
        var dest = vector.plus(directions[action.direction]);
        if (this.grid.isInside(dest))
            return dest;
    }
};
function Wall() {}; //Another brick in the...
function LifelikeWorld(map, legend) {
    World.call(this, map, legend);
}
LifelikeWorld.prototype = Object.create(World.prototype);


LifelikeWorld.prototype.letAct = function (critter, vector){
    var action = critter.act(new View(this, vector));
    var handled = action &&
        action.type in actionTypes &&
        actionTypes[action.type].call(this, critter, 
                                        vector, action);
    if (!handled){
        critter.energy -= 0.2;
        if (critter.energy <= 0){
            this.grid.set(vector, null);
        }
    }
};

function randomPlan(width, height, legend){
    var randomness = [];
    var players = [" "," "," "," "];
    var wall = drawWidthWall(width);
    for (key in legend){
        players.push(key);
    }
    function drawWidthWall (width){
        var output = "";
        for (var i=0;i<width;i++){
            output += "#"
        }
        return output;
    }
    for (var h = 0; h < height - 2; h++){
        var row = "#";
        for (var w = 0; w < width - 2; w++){
            row += randomElement(players);
        }
        row += "#";
        randomness.push(row);
    }
    randomness.push(wall);
    randomness.unshift(wall);
    return randomness;
}

var legend = 
        {"#": Wall,
        "o": Herbivore,
        ".": Bunny,
        "*": Plant,
        "x":Weed,
        "@":Carnivore,
        "%":FirstOmnivore,
        "$":AnotherOmnivore};
var chaosPlan = randomPlan(240, 60, legend);
var world = new LifelikeWorld(chaosPlan, legend);
//console.log("behold, life!");