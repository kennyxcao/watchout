// start slingin' some d3 here.
(function() {

  var gameSetup = {
    height: 1000,
    width: 1000,
    radius: 25,
    enemyCount: 20,
    //padding: 20
  };

  var gameStats = {
    score: 0,
    highScore: 0,
    collisions: 0,
    prevCollision: null
  };


  var gameBoard = d3.select('.board').append('svg:svg').attr('width', gameSetup.width).attr('height', gameSetup.height);


  var axes = {
    x: d3.scale.linear().domain([0, 100]).range([0, gameSetup.width]),
    y: d3.scale.linear().domain([0, 100]).range([0, gameSetup.height])
  };


  var createPlayer = function() {
    var xPos = gameSetup.height / 2;
    var yPos = gameSetup.width / 2;
    var playerData = {
        id: 100,
        x: xPos,
        y: yPos      
    };

    var drag = d3.behavior.drag()
        .origin(function(d) { return d; })
        .on("dragstart", dragstarted)
        .on("drag", dragged)
        .on("dragend", dragended);

    var player = gameBoard.selectAll('circle.player').data([playerData], function(d) {
      return d.id;
    });

    player.enter().append('svg:circle').attr('class', 'player').attr('cx', function(d) {
      return d.x;
    }).attr('cy', function(d) {
      return d.y;
    }).attr('r', gameSetup.radius)
    .call(drag);

    function dragstarted(d) {
      d3.event.sourceEvent.stopPropagation();
      d3.select(this).classed("dragging", true);
    }

    function dragged(d) {
      d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    }

    function dragended(d) {
      d3.select(this).classed("dragging", false);
    }
  };


  var createEnemies = function() {
    return _.range(0, gameSetup.enemyCount).map(function(i) {
      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100
      };
    });
  };

 
  var renderEnemies = function(enemyData) {
    var enemies = gameBoard.selectAll('circle.enemy').data(enemyData, function(d) {
      return d.id; 
    });

    enemies.enter().append('svg:circle').attr('class', 'enemy').attr('cx', function(d) {
      return axes.x(d.x);
    }).attr('cy', function(d) {
      return axes.y(d.y);
    }).attr('r', gameSetup.radius);

    enemies.transition().duration(2000)
          .attr('cx', function(d) { return axes.x(d.x); })
          .attr('cy', function(d) { return axes.y(d.y); })
          .tween('collision', tweenCollsionDetection);

    enemies.exit().remove();


    function tweenCollsionDetection(endData) {
      var enemy = d3.select(this);
      var startPos = {
        x: parseFloat(enemy.attr('cx')),
        y: parseFloat(enemy.attr('cy')),
      };
      var endPos = {
        x: axes.x(endData.x),
        y: axes.y(endData.y)
      };
      var dx = d3.interpolateRound(startPos.x, endPos.x);    
      var dy = d3.interpolateRound(startPos.y, endPos.y);    
      
      return function(t) {
        var currentPos = {
          x: dx(t),
          y: dy(t),
        };
        checkCollision(currentPos, onCollision, enemy);
      };
    }

    function checkCollision(currentPos, collisionCallback, enemy) {
      var playerPos = {
        x: parseFloat(d3.select('circle.player').attr('cx')),
        y: parseFloat(d3.select('circle.player').attr('cy')),
      };

      var rSum = gameSetup.radius * 2;
      var xDiff = playerPos.x - currentPos.x;
      var yDiff = playerPos.y - currentPos.y;
      var distance = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

      if (distance < rSum) {
        return onCollision(enemy);
      }
    }

    function onCollision(enemy) {
      if (gameStats.prevCollision !== enemy) {
        gameStats.prevCollision = enemy;
        gameStats.collisions++;
        d3.select('.collisions span').text(gameStats.collisions.toString());
        
        if (gameStats.collisions > 5) {
          updateHighScore();
          gameStats.score = 0;
          updateScore();
          gameStats.collisions = 0;
          d3.select('.collisions span').text(gameStats.collisions.toString());
        } 
        return;
      }
    }

  };


  var updateScore = function() {
    d3.select('.current span').text(gameStats.score.toString());
  };


  var updateHighScore = function() {
    gameStats.highScore = Math.max(gameStats.score, gameStats.highScore);
    d3.select('.highscore span').text(gameStats.highScore.toString());
  };



  play = function() {
    var gameturn = function() {
      var newEnemyLocations = createEnemies();
      renderEnemies(newEnemyLocations);
    };
    var upScore = function() {
      gameStats.score++;
      updateScore();
    };
    createPlayer();
    gameturn();
    setInterval(gameturn, 2000);
    setInterval(upScore, 100);
  };

  play();

})();
