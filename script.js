"use strict"

var level = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 0, 1, 5, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 3, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 5, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 6, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]

var live = [];

var levelElements = [];

var obstacles = [];

var tileTypes = [
    {
        name: "air",
        coll: false,
        push: false
    },
    {
        name: "wall",
        coll: true,
        push: false
    },
    {
        name: "barrel",
        coll: true,
        push: true
    },
    {
        name: "ice",
        coll: true,
        push: true
    },
    {
        name: "cirno",
        coll: false,
        push: false
    },
    {
        name: "frog",
        coll: true,
        push: false
    },
    {
        name: "star",
        coll: false,
        push: false
    }
    ]

var ids = {
    air: 0,
    wall: 1,
    barrel: 2,
    ice: 3,
    cirno: 4,
    frog: 5,
    star: 6
}

var player = {};

var bounds = {};

function createGame()
{
    bounds.x = level[0].length;
    bounds.y = level.length;

    document.getElementById("game").style.width = bounds.x * 32;
    var img = document.createElement("IMG");
    img.src = "sprites.png";
    for (var j = 0; j < bounds.y; j++)
    {
        live[j] = [];
        obstacles[j] = [];

        levelElements[j] = [];
        var row = document.createElement("DIV");
        for (var i = 0; i < bounds.x; i++)
        {
            live[j][i] = true;

            var div = document.createElement("DIV");
            div.style.width = "32px";
            div.style.height = "32px";
            div.style.backgroundImage = "url(sprites.png)";
            var id = level[j][i];
            var tx = id % 4 * 34 + 1;
            var ty = Math.floor(id / 4) * 34 + 1;
            div.style.backgroundPositionX = -tx + "px";
            div.style.backgroundPositionY = -ty + "px";
            div.style.display = "inline-block";
            row.appendChild(div);
            levelElements[j][i] = div;

            if (id == ids.cirno)
            {
                player.x = i;
                player.y = j;
            }
        }
        document.getElementById("game").appendChild(row);
    }
}

document.onkeydown = checkKey;

function checkKey(e)
{
    var direction = "";
    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
        direction = "up";
    }
    else if (e.keyCode == '40') {
        // down arrow
        direction = "down";
    }
    else if (e.keyCode == '37') {
       // left arrow
       direction = "left";
    }
    else if (e.keyCode == '39') {
       // right arrow
       direction = "right";
    }

    if (direction != "") updateGame(direction);
}

function updateGame(direction)
{
    var tx = player.x;
    var ty = player.y;
    if (direction == "up") ty--;
    if (direction == "down") ty++;
    if (direction == "left") tx--;
    if (direction == "right") tx++;
    level[ty][tx] = ids.cirno;
    level[player.y][player.x] = 0;
    player.x = tx;
    player.y = ty;

    for (var j = 0; j < bounds.y; j++)
    {
        for (var i = 0; i < bounds.x; i++)
        {
            var id = level[j][i];
            if (id == ids.frog && live[j][i] == true)
            {
                var result = findPath(i, j, player.x, player.y);
                if (result.length > 0 && (result.length <= 10 || Math.abs(player.x - i) + Math.abs(player.y - j) < 5))
                {
                    moveTo(i, j, result[0].y, result[0].x);
                }
                else
                {
                    tx = i;
                    ty = j;
                    var dir = Math.floor(Math.random() * 4);
                    if (dir == 0) ty--;
                    if (dir == 1) ty++;
                    if (dir == 2) tx--;
                    if (dir == 3) tx++;
                    moveTo(i, j, tx, ty);
                }
            }
        }
    }

    for (var j = 0; j < bounds.y; j++)
    {
        for (var i = 0; i < bounds.x; i++)
        {
            var div = levelElements[j][i];
            var id = level[j][i];
            var tx = id % 4 * 34 + 1;
            var ty = Math.floor(id / 4) * 34 + 1;
            div.style.backgroundPositionX = -tx + "px";
            div.style.backgroundPositionY = -ty + "px";

            live[j][i] = true;
        }
    }
}

function findPath(startX, startY, endX, endY)
{
    for (var j = 0; j < bounds.y; j++)
    {
        for (var i = 0; i < bounds.x; i++)
        {
            if (tileTypes[level[j][i]].coll)
                obstacles[j][i] = 0;
            else
                obstacles[j][i] = 1;
        }
    }

    var dx = Math.abs(endX - startX);
    var dy = Math.abs(endY - startY);
    var weightCases = [
        [startX - 1, startY, dx, dy],
        [startX + 1, startY, dx, dy],
        [startX, startY - 1, dy, dx],
        [startX, startY + 1, dy, dx]
        ]
    for (var n = 0; n < 4; n++)
    {
        var tx = weightCases[n][0];
        var ty = weightCases[n][1];
        var d1 = weightCases[n][2];
        var d2 = weightCases[n][3];
        if (tx < 0 || tx >= bounds.x || ty < 0 || ty >= bounds.y) continue;
        if (obstacles[ty][tx] == 0) continue;
        if (d1 < d2) obstacles[ty][tx] = 5;
    }

    var graph = new Graph(obstacles);
    var start = graph.grid[startY][startX];
    var end = graph.grid[endY][endX];
    var result = astar.search(graph, start, end);
    //debugger;
    return result;
}

function moveTo(startX, startY, endX, endY)
{
    var id = level[startY][startX];
    if (endX < 0 || endX >= bounds.x || endY < 0 || endY >= bounds.y) return;
    if (level[endY][endX] == 0)
    {
        level[startY][startX] = 0;
        level[endY][endX] = id;
        live[endY][endX] = false;
    }
}
