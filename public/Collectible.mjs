class Collectible {
  constructor({x, y, id}) {
    this.x = x;
    this.y = y;
    this.value = 1;
    this.id = id
  }

}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
