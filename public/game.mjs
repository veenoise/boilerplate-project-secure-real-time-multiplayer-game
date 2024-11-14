import Player from './Player.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');
const toggleConnection = document.getElementById('disconnect');
const score = document.getElementById('score');
const speed = 10;

// Allow disconnection and connection of users
toggleConnection.addEventListener('click', (e) => {
    e.preventDefault();
    if (socket.connected) {
        toggleConnection.innerText = 'Connect';
        context.clearRect(0, 0, canvas.width, canvas.height);
        score.innerHTML = "";
        socket.disconnect();
    } else {
        toggleConnection.innerText = 'Disconnect';
        socket.connect();
    }
})

// Collectible gobal variable
let item;
// Logic for when the user is connected
socket.on('connect', () => {
    // Create a Player instance
    let player = new Player({ 
        x: Math.abs(Math.random() * 640 - 50), 
        y: Math.abs(Math.random() * 480 - 50), 
        score: 0, 
        id: socket.id 
    });

    // Broadcast this player to other clients
    socket.emit('make player', player);

    // Listen to server's message
    socket.on('broadcast players', (players, collectible) => {
        item = collectible
        // Clear canvas to remove duplication disconnected players
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Differentiate player from other players
        players.forEach((e) => {
            context.fillStyle = (e.id === socket.id) ? 'white' : 'red';
            context.fillRect(
                e.x, 
                e.y, 
                50, 
                50
            );
        })
        
        // Spawn collectible
        context.fillStyle = 'yellow';
        context.fillRect(
            collectible.x,
            collectible.y,
            10, 
            10
        )

        // Print score to view
        let rank = player.calculateRank(players);
        console.log(rank)
        score.innerHTML = "";
        score.innerHTML = rank;

        
    });

    let keys = {}; // Object to track pressed keys

    // Event listeners to track keydown and keyup
    document.addEventListener('keydown', (event) => {
        keys[event.key.toLowerCase()] = true;
    });

    document.addEventListener('keyup', (event) => {
        keys[event.key.toLowerCase()] = false;
    });

    // Function to update player position based on pressed keys
    function updatePlayerPosition() {
        
        let moved = false; // Track if the player moved to minimize redundant emits

        // Check each key and move player accordingly
        if (keys['a'] || keys['arrowleft']) {
            player.movePlayer('left', speed);
            moved = true;
        }
        if (keys['w'] || keys['arrowup']) {
            player.movePlayer('up', speed);
            moved = true;
        }
        if (keys['d'] || keys['arrowright']) {
            player.movePlayer('right', speed);
            moved = true;
        }
        if (keys['s'] || keys['arrowdown']) {
            player.movePlayer('down', speed);
            moved = true;
        }

        // Emit only if the player actually moved
        if (moved) {
            if (player.collision(item)) {
                player.score += item.value;
                socket.emit('respawn item', 'respawn item', player)
            }
            socket.emit('move player', player);
        }

        // Use requestAnimationFrame to continuously call updatePlayerPosition
        requestAnimationFrame(updatePlayerPosition);
        
    }

    // Start the animation loop
    updatePlayerPosition();

    
});

canvas.style.backgroundColor = 'black';