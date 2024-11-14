const canvasDimension = {
  x: 640,
  y: 480
}

const playerSize = {
  x: 50,
  y: 50
}

class Player {
  constructor({x, y, score, id}) {
    this.x = x;
    this.y = y;
    this.score = 0;
    this.id = id;
  };

  movePlayer(dir, speed) {
    switch(dir) {
      case 'left':
        if (this.x >= speed) {
          this.x -= speed;
        }
        break;
      case 'right':
        if (this.x <= canvasDimension.x - playerSize.x - speed) {
          this.x += speed;
        }
        break;
      case 'up':
        if (this.y >= speed) {
          this.y -= speed;
        }
        break;
      case 'down':
        if (this.y <= canvasDimension.y - playerSize.y - speed) {
          this.y += speed;
        }
        break;
    };
  };

  collision(item) {
    return ((this.x <= item.x && item.x <= this.x + playerSize.x) || 
          (this.x <= item.x + 10 && item.x + 10 <= this.x + playerSize.x)) &&
          ((this.y <= item.y && item.y <= this.y + playerSize.y) || 
          (this.y <= item.y + 10 && item.y + 10 <= this.y + playerSize.y))
  };

  calculateRank(arr) {
    let sorted = true
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (arr[j].score < arr[j + 1].score) {
          let tmp = arr[j];
          arr[j] = arr[j + 1]
          arr[j + 1] = tmp
          sorted = false
        }
      }
      if (sorted) {
        break;
      }
    }

    for (let i = 0; i < arr.length; i++) {
      if (arr[i].id === this.id) {
        return `Rank: ${i + 1}/${arr.length}`
      }
    }

    console.log(this.id)
    return "No players";
  };
};

export default Player;
