"use strict"

var level = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 5, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]

var live = [];

var levelElements = [];

var tiles = [
    "air",
    "wall",
    "barrel",
    "ice",
    "cirno",
    "frog",
    "star"
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
                tx = i;
                ty = j;
                var dir = Math.floor(Math.random() * 4);
                if (dir == 0) ty--;
                if (dir == 1) ty++;
                if (dir == 2) tx--;
                if (dir == 3) tx++;
                if (tx >= 0 && tx < bounds.x
                    && ty >= 0 && ty < bounds.y)
                {
                    if (level[ty][tx] == 0)
                    {
                        level[j][i] = 0;
                        level[ty][tx] = ids.frog;
                        live[ty][tx] = false;
                    }
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

