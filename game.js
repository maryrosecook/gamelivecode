;(function (exports) {
  var Game = function(canvasId) {
    this.WIDTH = 200;
    this.HEIGHT = 200;
    this.boxX = 10;

    var canvas = getCanvas(canvasId);
    sizeCanvas(canvas, this.WIDTH, this.HEIGHT);
    var drawingContext = getContext(canvas);

    this.createEntities();

    var self = this;
    this.startTick(function() {
      self.update();
      self.draw(drawingContext);
    });
  };

  Game.prototype = {
    x: 10,
    startTick: function(fn) {
      var tick = function() {
        fn();
        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    },

    createEntities: function() {
      this.bullets = [];
      this.ship = new Ship(this);

      this.invaders = [];
      for (var i = 0; i < 24; i++) {
        this.invaders.push(new Invader(this, {
          x: 20 + 20 * (i % 8),
          y: 20 + 20 * (i % 3)
        }));
      }
    },

    shoot: function(center) {
      this.bullets.push(new Bullet(this.game, center));
    },

    update: function() {
      this.ship.update();

      for (var i = 0; i < this.invaders.length; i++) {
        this.invaders[i].update();
      }

      for (var i = 0; i < this.bullets.length; i++) {
        this.bullets[i].update();
      }

      for (var i = 0; i < this.bullets.length; i++) {
        if (entitiesColliding(this.ship, this.bullets[i])) {
          this.ship.color = "#f00";
        }
      }
    },

    draw: function(drawingContext) {
      drawingContext.clearRect(0, 0, this.WIDTH, this.HEIGHT);
      this.ship.draw(drawingContext);

      for (var i = 0; i < this.invaders.length; i++) {
        this.invaders[i].draw(drawingContext);
      }

      for (var i = 0; i < this.bullets.length; i++) {
        this.bullets[i].draw(drawingContext);
      }
    }
  };

  var sizeCanvas = function(canvas, width, height) {
    canvas.width = width;
    canvas.height = height;
  };

  var getContext = function(canvas) {
    return canvas.getContext('2d');
  };

  var getCanvas = function(canvasId) {
    return document.getElementById(canvasId);
  };

  var Ship = function(game) {
    this.game = game;
    this.size = { x: 10, y: 10 };
    this.color = "#000";
    this.center = { x: game.WIDTH / 2, y: game.HEIGHT - this.size.y };

    this.inputter = new Inputter();
  };

  Ship.prototype = {
    update: function() {
      if (this.inputter.isDown(37)) { // left
        this.center.x--;
      } else if (this.inputter.isDown(39)) {
        this.center.x++;
      }
    },

    draw: function(drawingContext) {
      drawRectangleForObject(this, drawingContext);
    }
  };

  var drawRectangleForObject = function(obj, drawingContext) {
    drawingContext.fillStyle = obj.color;
    drawingContext.fillRect(obj.center.x, obj.center.y, obj.size.x, obj.size.y);
  };

  var Invader = function(game, center) {
    this.game = game;
    this.size = { x: 10, y: 10 };
    this.center = center;
    this.color = "#000";
  };

  Invader.prototype = {
    patrolSpeedX: 0,
    patrolPositionX: 0,
    update: function() {
      if (this.patrolPositionX <= 0) {
        this.patrolSpeedX = 0.5;
      } else if (this.patrolPositionX >= 20) {
        this.patrolSpeedX = -0.5;
      }

      this.patrolPositionX += this.patrolSpeedX;
      this.center.x += this.patrolSpeedX;

      if (Math.random() < 0.005) {
        this.game.shoot({ x: this.center.x, y: this.center.y });
      }
    },

    draw: function(drawingContext) {
      drawRectangleForObject(this, drawingContext);
    }
  };

  var Inputter = function() {
    var keyState = {};

    window.onkeydown = function(e) {
      keyState[e.keyCode] = true;
    };

    window.onkeyup = function(e) {
      keyState[e.keyCode] = false;
    };

    this.isDown = function(keyCode) {
      return keyState[keyCode] === true;
    };
  };

  var Bullet = function(game, center) {
    this.game = game;
    this.size = { x: 4, y: 4 };
    this.color = "#000";
    this.center = center;
    this.vector = { x: Math.random() - 0.5, y: Math.random() };
  };

  Bullet.prototype = {
    update: function() {
      this.center.x += this.vector.x;
      this.center.y += this.vector.y;
    },

    draw: function(drawingContext) {
      drawRectangleForObject(this, drawingContext);
    }
  };

  var entitiesColliding = function(e1, e2) {
    return !(e1.center.x + e1.size.x / 2 < e2.center.x - e2.size.x / 2 ||
             e1.center.y + e1.size.y / 2 < e2.center.y - e2.size.y / 2 ||
             e1.center.x - e1.size.x / 2 > e2.center.x + e2.size.x / 2 ||
             e1.center.y - e1.size.y / 2 > e2.center.y + e2.size.y / 2);
  };

  window.onload = function () {
    new Game("canvas");
  };
})(this);
