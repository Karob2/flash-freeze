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

var dir = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
}

var dirs = [ dir.up, dir.down, dir.left, dir.right ];

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
    var direction = null;
    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
        direction = dir.up;
    }
    else if (e.keyCode == '40') {
        // down arrow
        direction = dir.down;
    }
    else if (e.keyCode == '37') {
       // left arrow
       direction = dir.left;
    }
    else if (e.keyCode == '39') {
       // right arrow
       direction = dir.right;
    }

    if (direction != null) updateGame(direction);
}

function updateGame(direction)
{
    var id;

    // Move player
    var tx = player.x + direction.x;
    var ty = player.y + direction.y;
    if (tx >+ 0 && tx < bounds.x && ty >= 0 && ty < bounds.y)
    {
        var doMove = false;
        id = level[ty][tx];
        if (id == 0) doMove = true;
        else if (id == ids.star) doMove = true;
        else if (id == ids.barrel || id == ids.ice)
        {
            var ttx = tx;
            var tty = ty;
            while (true)
            {
                ttx += direction.x;
                tty += direction.y;
                if (ttx < 0 || ttx >= bounds.x) break;
                if (tty < 0 || tty >= bounds.y) break;
                var id2 = level[tty][ttx];
                if (id2 == ids.barrel || id2 == ids.ice) continue;
                if (id2 != 0) break;

                while (true)
                {
                    level[tty][ttx] = level[tty - direction.y][ttx - direction.x];
                    ttx -= direction.x;
                    tty -= direction.y;
                    if (ttx == tx && tty == ty)
                    {
                        level[ty][tx] = 0;
                        doMove = true;
                        break;
                    }
                }
                break;
            }
        }
        if (doMove)
        {
            level[ty][tx] = ids.cirno;
            level[player.y][player.x] = 0;
            player.x = tx;
            player.y = ty;
        }
    }

    // Move frogs
    for (var j = 0; j < bounds.y; j++)
    {
        for (var i = 0; i < bounds.x; i++)
        {
            id = level[j][i];
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

    // Update graphics
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
    var skipWeights = false;
    if (dx > dy)
    {
        if (endX < startX)
            if (startX - 1 > 0 && obstacles[startY][startX - 1] == 0)
                skipWeights = true;
        if (endX > startX)
            if (startX + 1 <= bounds.x && obstacles[startY][startX + 1] == 0)
                skipWeights = true;
    }
    else if (dx < dy)
    {
        if (endY < startY)
            if (startY - 1 > 0 && obstacles[startY - 1][startX] == 0)
                skipWeights = true;
        if (endY > startY)
            if (startY + 1 <= bounds.y && obstacles[startY + 1][startX] == 0)
                skipWeights = true;
    }
    else skipWeights = true;
    if (skipWeights == false)
    {
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
