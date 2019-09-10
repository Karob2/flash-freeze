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
    // Use pre-existing level
    bounds.x = level[0].length;
    bounds.y = level.length;

    // Randomly generate new level
    bounds.x = 30;
    bounds.y = 18;
    level = [];
    for (var j = 0; j < bounds.y; j++)
    {
        level[j] = [];
        for (var i = 0; i < bounds.x; i++)
        {
            level[j][i] = 0;
        }
    }

    // Place walls
    var tix = Math.random() * bounds.x;
    var tiy = Math.random() * bounds.y;
    var phi = (Math.sqrt(5) - 1) / 2;
    var tick = 0;
    for (var n = 0; n < 16; n++)
    {
        //var shrink = (32 - n) / 32;
        /*
        var tw = Math.floor(Math.random() * 12 * shrink) + 1;
        var th = Math.floor(Math.random() * 9 * shrink) + 1;
        var tx = Math.floor(Math.random() * (bounds.x - tw));
        var ty = Math.floor(Math.random() * (bounds.y - th));
        */
        if (tick == 0)
        {
            tick = 1;
            tix = (tix + phi * bounds.x);
            if (tix >= bounds.x) tix -= bounds.x;
        }
        else
        {
            tick = 0;
            tiy = (tiy + phi * bounds.y);
            if (tiy >= bounds.y) tiy -= bounds.y;
        }
        //var tw = Math.floor(12 * shrink) + 1;
        //var th = Math.floor(9 * shrink) + 1;
        var tw = Math.floor(Math.random() * 6 + 6) + 1;
        var th = Math.floor(Math.random() * 5 + 5) + 1;
        var tx = Math.floor(tix - tw / 2);
        var ty = Math.floor(tiy - th / 2);
        var rem1 = Math.floor(Math.random() * 4);
        var rem2 = Math.floor(Math.random() * 4);
        if (tx <= 0) rem1 = 1;
        if (tx + tw >= bounds.x) rem1 = 0;
        if (ty <= 0) rem2 = 3;
        if (ty + th >= bounds.y) rem2 = 2;
        for (var j = ty - 1; j < ty + th + 1; j++)
        {
            if (j < 0 || j >= bounds.y) continue;
            var borderY = false;
            var borderYOOB = false;
            if (j == ty || j == ty + th - 1) borderY = true;
            if (j < ty || j > ty + th - 1) borderYOOB = true;
            for (var i = tx - 1; i < tx + tw + 1; i++)
            {
                if (i < 0 || i >= bounds.x) continue;
                var borderX = false;
                var borderXOOB = false;
                if (i == tx || i == tx + tw - 1) borderX = true;
                if (i < tx || i > tx + tw - 1) borderXOOB = true;
                /*
                if (borderXOOB == true || borderYOOB == true)
                {
                    level[j][i] = ids.star;
                }
                */
                if (rem1 != 0 && rem2 != 0 && i == tx - 1 || rem1 != 1 && rem2 != 1 && i == tx + tw || rem1 != 2 && rem2 != 2 && j == ty - 1 || rem1 != 3 && rem2 != 3 && j == ty + tw)
                {
                    level[j][i] = 0;
                }
                else if (rem1 == 0 && i == tx || rem1 == 1 && i == tx + tw - 1 || rem1 == 2 && j == ty || rem1 == 3 && j == ty + th - 1)
                {
                    level[j][i] = 0;
                }
                else if (rem2 == 0 && i == tx || rem2 == 1 && i == tx + tw - 1 || rem2 == 2 && j == ty || rem2 == 3 && j == ty + th - 1)
                {
                    level[j][i] = 0;
                }
                else if ((borderY == true || borderX == true) && borderXOOB == false && borderYOOB == false)
                {
                    if (Math.random() < 0.1) level[j][i] = ids.ice;
                    else level[j][i] = ids.wall;
                }
                else
                {
                    level[j][i] = 0;
                }
            }
        }
    }

    // Place barrels
    var tix = Math.random() * bounds.x;
    var tiy = Math.random() * bounds.y;
    var phi = (Math.sqrt(5) - 1) / 2;
    var tick = 0;
    for (var n = 0; n < 8; n++)
    {
        if (tick == 0)
        {
            tick = 1;
            tix = (tix + phi * bounds.x);
            if (tix >= bounds.x) tix -= bounds.x;
        }
        else
        {
            tick = 0;
            tiy = (tiy + phi * bounds.y);
            if (tiy >= bounds.y) tiy -= bounds.y;
        }
        var tw = Math.floor(Math.random() * 2) + 1;
        var th = Math.floor(Math.random() * 2) + 1;
        if (tw == 2 && th == 2) tw = 1;
        var tx = Math.floor(tix - tw / 2);
        var ty = Math.floor(tiy - th / 2);
        for (var j = ty; j < ty + th; j++)
        {
            if (j < 0 || j >= bounds.y) continue;
            for (var i = tx; i < tx + tw; i++)
            {
                if (i < 0 || i >= bounds.x) continue;
                if (level[j][i] == ids.air)
                    level[j][i] = ids.barrel;
            }
        }
    }

    // Place player base
    {
        var size = Math.random() * 3;
        var tw = Math.floor(6 + size);
        var th = Math.floor(5 + size);
        var tx = Math.floor(bounds.x / 2 - Math.random() * tw);
        var ty = Math.floor(bounds.y / 2 - Math.random() * th);
        for (var j = ty; j < ty + th; j++)
        {
            if (j < 0 || j >= bounds.y) continue;
            for (var i = tx; i < tx + tw; i++)
            {
                if (i < 0 || i >= bounds.x) continue;
                if (i == tx || i == tx + tw - 1 || j == ty || j == ty + th - 1)
                {
                    if (level[j][i] == 0)
                        level[j][i] = ids.ice;
                }
                else
                {
                    level[j][i] = 0;
                }
            }
        }
    }

    // Create visual HTML elements
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
