// start slingin' some d3 here.
(function() {

  var gameOptions = {
    height: 1000,
    width: 1000,
    radius: 25,
    enemyCount: 2,
    padding: 20
  };

  var gameStats = {
    score: 0,
    topScore: 0,
    collisions: 0
  };


  var gameBoard = d3.select('.board').append('svg:svg').attr('width', gameOptions.width).attr('height', gameOptions.height);


  var axes = {
    x: d3.scale.linear().domain([0, 100]).range([0, gameOptions.width]),
    y: d3.scale.linear().domain([0, 100]).range([0, gameOptions.height])
  };


  var createPlayer = function() {
    var xPos = gameOptions.height / 2;
    var yPos = gameOptions.width / 2;
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
    }).attr('r', gameOptions.radius)
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
    return _.range(0, gameOptions.enemyCount).map(function(i) {
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

    enemies.enter().append('svg:circle').attr('class', 'enemy').attr('cx', function(enemy) {
      return axes.x(enemy.x);
    }).attr('cy', function(enemy) {
      return axes.y(enemy.y);
    }).attr('r', gameOptions.radius);

    enemies.transition().duration(2500)
          .attr('cx', function(d) { return axes.x(d.x); })
          .attr('cy', function(d) { return axes.y(d.y); });

    //enemies.transition().tween('collision', tweenCollsionDetection);

    enemies.exit().remove();


    function tweenCollsionDetection() {

      return function(t) {

      };
    }

  };



  play = function() {
    var gameturn = function() {
      var newEnemyLocations = createEnemies();
      renderEnemies(newEnemyLocations);
    };
    createPlayer();
    gameturn();
    setInterval(gameturn, 2500);
  };


  play();

})();
