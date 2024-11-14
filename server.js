require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const cors = require('cors');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');
const helmet = require('helmet');
const Collectible = require('./public/Collectible.mjs');
const app = express();

app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'PHP 7.4.3');
  next();
});


app.use(helmet.noCache());
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.dnsPrefetchControl());

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 


//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

const options = { /* ... */ };
const io = require('socket.io')(server, options);

// Global collectible declaration
let collectible;
let collectibleSpawned = false;
let collectibleId = 0
// Players tracker
let players = [];

// socket.io implementation
io.on('connection', socket => { 
  // Spawing collectible 
  

  // Listen to client after player instantiation
  socket.on('make player', (player) => {
    players.push(player);

    // Broadcast the player array so everyone can see character updates
    if (!collectibleSpawned) {
      collectible = new Collectible({
        x: Math.abs(Math.random() * 640 - 10),
        y: Math.abs(Math.random() * 480 - 10),
        id: collectibleId
      })
      collectibleSpawned = true;
      collectibleId += 1;
    }
    
    io.emit('broadcast players', players, collectible);
  });
  
  // Handle disconnections
  socket.on('disconnect', (removed) => {
    players.forEach((e, index) => {
      if (e.id === socket.id) {
        players.splice(index, 1);
      }
    });

    if (players.length === 0) {
      collectibleSpawned = false;
    }

    // Update the players with the removed player instance
    socket.broadcast.emit('broadcast players', players, collectible);
  })

  // Listen to client after player moved
  socket.on('move player', (player) => {
    players.forEach((e, index) => {
      if (e.id === player.id) {
        players[index] = player
      };
    });

    // Broadcast new character position
    io.emit('broadcast players', players, collectible);
  });

  
  socket.on('respawn item', (message, player) => {
    collectible = new Collectible({
      x: Math.abs(Math.random() * 640 - 10),
      y: Math.abs(Math.random() * 480 - 10),
      id: collectibleId
    })
    collectibleSpawned = true;
    collectibleId += 1;

    players.forEach((e, index) => {
      if (e.id === player.id) {
        players[index] = player;
      }
    })

    io.emit('broadcast players', players, collectible);
  })
});


module.exports = app; // For testing
