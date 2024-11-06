class Collectible {
  constructor({x, y, value, id}) {
    this.x = this.x;
    this.y = this.y;
    this.value = this.value;
    this.id = this.id;
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
