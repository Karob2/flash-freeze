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
    },
    {
        name: "cirno2",
        coll: false,
        push: false
    },
    {
        name: "egg",
        coll: true,
        push: true
    }
    ]

var ids = {
    air: 0,
    wall: 1,
    barrel: 2,
    ice: 3,
    cirno: 4,
    frog: 5,
    star: 6,
    cirno2: 7,
    egg: 8
}

var player = {};

var bounds = {};

var dir = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
    none: { x: 0, y: 0 }
}

var dirs = [ dir.up, dir.down, dir.left, dir.right ];

var timerId;
var restartGame = false;
var dead = false;
var charged = false;
var tickCount = 0;
var difficulty = 1;
var godMode = false;
var alterEgg = 0;

var audio = {
    current: 0,
    list: [
    document.createElement("AUDIO"),
    document.createElement("AUDIO"),
    document.createElement("AUDIO"),
    document.createElement("AUDIO")
    ]
}

function createGame()
{
    // Use pre-existing level
    bounds.x = level[0].length;
    bounds.y = level.length;
    for (var j = 0; j < bounds.y; j++)
    {
        for (var i = 0; i < bounds.x; i++)
        {
            if (level[j][i] == ids.cirno)
            {
                player.x = i;
                player.y = j;
            }
        }
    }

    // Actually, start a new one
    bounds.x = 30;
    bounds.y = 18;

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
            var div = document.createElement("DIV");
            div.style.width = "32px";
            div.style.height = "32px";
            div.style.backgroundImage = "url(sprites.png)";
            /*
            var id = level[j][i];
            var tx = id % 4 * 34 + 1;
            var ty = Math.floor(id / 4) * 34 + 1;
            div.style.backgroundPositionX = -tx + "px";
            div.style.backgroundPositionY = -ty + "px";
            */
            div.style.display = "inline-block";
            row.appendChild(div);
            levelElements[j][i] = div;
        }
        document.getElementById("game").appendChild(row);
    }

    createLevel();
    updateGraphics();
}

function createLevel()
{
    document.getElementById("alerts").style.visibility = "hidden";
    document.getElementById("game").style.opacity = 1;
    tickCount = 0;
    difficulty = 1;
    alterEgg = 0;

    // Randomly generate new level
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
                    if (Math.random() < 0.1) level[j][i] = ids.barrel;
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
        player.x = Math.floor(Math.random() * (tw - 2)) + tx + 1;
        player.y = Math.floor(Math.random() * (th - 2)) + ty + 1;
        level[player.y][player.x] = ids.cirno;

        // Place enemies
        for (var n = 0; n < 2; n++)
        {
            while (true)
            {
                var ex = Math.floor(Math.random() * bounds.x);
                var ey = Math.floor(Math.random() * bounds.y);
                if (ex >= tx && ex < tx + th && ey >= ty && ey < ty + th) continue;
                if (level[ey][ex] != 0) continue;
                level[ey][ex] = ids.frog;
                break;
            }
        }

        spawnItem(ids.star);
    }

    //timerId = setTimeout(gameTick, 1000);
    gameTick();
}

document.onkeydown = checkKey;

function checkKey(e)
{
    var direction = null;
    e = e || window.event;
    //alert(e.keyCode);

    if (e.keyCode == '82') {
        e.preventDefault();
        clearTimeout(timerId);
        playSound("die.wav");
        document.getElementById("game").style.opacity = 0.5;
        createLevel();
        return;
    }

    if (e.keyCode == '67') {
        e.preventDefault();
        document.getElementById("alerts").style.visibility = "hidden";
        document.getElementById("game").style.opacity = 1;
        gameTick();
        return;
    }

    if (e.keyCode == '38' || e.keyCode == '69') {
        if (dead == false) direction = dir.up;
        e.preventDefault();
        footstep();
    }
    else if (e.keyCode == '40' || e.keyCode == '68') {
        if (dead == false) direction = dir.down;
        e.preventDefault();
        footstep();
    }
    else if (e.keyCode == '37' || e.keyCode == '83') {
        if (dead == false) direction = dir.left;
        e.preventDefault();
        footstep();
    }
    else if (e.keyCode == '39' || e.keyCode == '70') {
        if (dead == false) direction = dir.right;
        e.preventDefault();
        footstep();
    }
    if (e.keyCode == '32') {
        e.preventDefault();
        flashFreeze();
    }
    if (direction != null) updateGame(direction);
}

function gameTick()
{
    //playSound("p.wav");
    dead = false;
    updateGame(dir.none);
}

function updateGame(direction)
{
    clearTimeout(timerId);
    timerId = setTimeout(gameTick, 1000);
    tickCount++;

    var id;
    var newStar = false;

    // Move player
    var tx = player.x + direction.x;
    var ty = player.y + direction.y;
    if (tx >= 0 && tx < bounds.x && ty >= 0 && ty < bounds.y)
    {
        var doMove = false;
        id = level[ty][tx];
        if (id == 0) doMove = true;
        else if (id == ids.star)
        {
            playSound("tap2.wav");
            //document.getElementById("game").style.opacity = 0.5;
            //setTimeout(endFlash, 200);
            charged = true;
            level[player.y][player.x] = ids.cirno2;
            doMove = true;
            //newStar = true;
        }
        else if (tileTypes[id].push == true)
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
                if (tileTypes[id2].push == true) continue;
                if (id2 != 0) break;

                playSound("drag.wav");
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
            if (charged) level[ty][tx] = ids.cirno2;
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
                    if (moveTo(i, j, result[0].y, result[0].x) == ids.star) newStar = true;
                }
                else
                {
                    tx = i;
                    ty = j;
                    var d = Math.floor(Math.random() * 4);
                    var res = moveTo(i, j, tx + dirs[d].x, ty + dirs[d].y);
                    if (res == ids.wall)
                    {
                        d++;
                        if (d > 3) d -= 4;
                        res = moveTo(i, j, tx + dirs[d].x, ty + dirs[d].y);
                    }
                    if (res == ids.wall)
                    {
                        d++;
                        if (d > 3) d -= 4;
                        res = moveTo(i, j, tx + dirs[d].x, ty + dirs[d].y);
                    }
                    if (res == ids.wall)
                    {
                        d++;
                        if (d > 3) d -= 4;
                        res = moveTo(i, j, tx + dirs[d].x, ty + dirs[d].y);
                    }
                    if (res == ids.star) newStar = true;
                }
            }
        }
    }

    if (newStar)
    {
        spawnItem(ids.star);
    }

    if (tickCount > 30)
    {
        tickCount = 0;
        var frogCount = 0;
        var starCount = 0;
        var iceCount = 0;
        for (var j = 0; j < bounds.y; j++)
        {
            for (var i = 0; i < bounds.x; i++)
            {
                id = level[j][i];
                if (id == ids.egg)
                {
                    playSound("p.wav");
                    level[j][i] = ids.frog;
                    frogCount++;
                }
                if (id == ids.frog) frogCount++;
                if (id == ids.star) starCount++;
                if (id == ids.ice) iceCount++;
            }
        }
        //if (frogCount < difficulty + 1) spawnItem(ids.egg);
        if (starCount < Math.min(Math.floor(difficulty / 2 + 1), 5) && starCount < frogCount) spawnItem(ids.star);

        frogCount = Math.min(difficulty + 1 - frogCount, 2);
        for (var n = 0; n < frogCount; n++) spawnItem(ids.egg);

        /*
        if (iceCount > 30)
        {
            var chosen = Math.floor(Math.random() * iceCount) + 1;
            for (var j = 0; j < bounds.y; j++)
            {
                for (var i = 0; i < bounds.x; i++)
                {
                    id = level[j][i];
                    if (id == ids.ice) chosen--;
                    if (chosen == 0)
                    {
                        level[j][i] = ids.egg;
                        break;
                    }
                }
                if (chosen == 0) break;
            }
        }
        */
    }

    updateGraphics();

    if (restartGame == true)
    {
        restartGame = false;
        clearTimeout(timerId);
        setTimeout(createLevel, 2000);
        document.getElementById("game").style.opacity = 0.5;
    }
}

function updateGraphics()
{
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

    document.getElementById("score").innerHTML = "Level: " + difficulty + "/25";
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
    return result;
}

function moveTo(startX, startY, endX, endY)
{
    var id = level[startY][startX];
    if (endX < 0 || endX >= bounds.x || endY < 0 || endY >= bounds.y) return ids.wall;
    var id2 = level[endY][endX];
    if (id2 == 0 || id2 == ids.star)
    {
        level[startY][startX] = 0;
        level[endY][endX] = id;
        live[endY][endX] = false;
        return id2;
    }
    if (id2 == ids.cirno || id2 == ids.cirno2)
    {
        if (charged) flashFreeze();
        else if (godMode == false)
        {
            playSound("die.wav");
            restartGame = true;
            dead = true;
            clearTimeout(timerId);
            return ids.cirno;
        }
    }
    return ids.wall;
}

function endFlash()
{
    document.getElementById("game").style.opacity = 1;
}

function spawnItem(type)
{
    while (true)
    {
        var ex = Math.floor(Math.random() * bounds.x);
        var ey = Math.floor(Math.random() * bounds.y);
        if (level[ey][ex] != 0) continue;
        level[ey][ex] = type;
        break;
    }
}

function spawnIceItem(type)
{
    var iceCount = 0;
    var id;
    for (var j = 0; j < bounds.y; j++)
    {
        for (var i = 0; i < bounds.x; i++)
        {
            id = level[j][i];
            if (id == ids.ice) iceCount++;
        }
    }

    var chosen = Math.floor(Math.random() * iceCount) + 1;
    for (var j = 0; j < bounds.y; j++)
    {
        for (var i = 0; i < bounds.x; i++)
        {
            id = level[j][i];
            if (id == ids.ice) chosen--;
            if (chosen == 0)
            {
                level[j][i] = type;
                break;
            }
        }
        if (chosen == 0) break;
    }
}

function flashFreeze()
{
    if (dead == true) return;
    if (!charged && !godMode) return;

    playSound("ender.wav");

    var oldDifficulty = difficulty;
    for (var j = player.y - 2; j <= player.y + 2; j++)
    {
        if (j < 0 || j >= bounds.y) continue;
        for (var i = player.x - 2; i <= player.x + 2; i++)
        {
            if (i < 0 || i >= bounds.x) continue;
            if (level[j][i] == ids.frog || level[j][i] == ids.egg)
            {
                playSound("mischit.wav");
                level[j][i] = ids.ice;
                var div = levelElements[j][i];
                var id = ids.ice;
                var tx = id % 4 * 34 + 1;
                var ty = Math.floor(id / 4) * 34 + 1;
                div.style.backgroundPositionX = -tx + "px";
                div.style.backgroundPositionY = -ty + "px";
                difficulty++;
                if (difficulty == 25)
                {
                    updateGraphics();
                    document.getElementById("alerts").style.visibility = "visible";
                    document.getElementById("game").style.opacity = 0.5;
                    dead = true;
                    clearTimeout(timerId);
                }
            }
            if (level[j][i] == 0)
            {
                var div = levelElements[j][i];
                var id = ids.star;
                var tx = id % 4 * 34 + 1;
                var ty = Math.floor(id / 4) * 34 + 1;
                div.style.backgroundPositionX = -tx + "px";
                div.style.backgroundPositionY = -ty + "px";
            }
        }
    }
    document.getElementById("game").style.opacity = 0.5;
    setTimeout(endFlash, 200);
    charged = false;
    level[player.y][player.x] = ids.cirno;
    if (difficulty != oldDifficulty && difficulty >= 10)
    {
        tickCount = 0;
        alterEgg++;
        if (alterEgg > 1) alterEgg = 0;
        //if (alterEgg == 0) spawnIceItem(ids.barrel);
        if (alterEgg <= 1) spawnIceItem(ids.egg);
    }
}

var footAlter = 0;

function footstep()
{
    footAlter++;
    if (footAlter > 1) footAlter = 0;
    if (footAlter == 0) playSound("pat.wav");
    else playSound("pat3.wav");
}

function playSound(filename)
{
    audio.list[audio.current].src = "sfx/" + filename;
    audio.list[audio.current].play();
    audio.current++;
    if (audio.current >= audio.list.length)
        audio.current = 0;
}
