module.exports = class ClientSeed {
  constructor(length) {
    this.m = Math;
    this.t = "qwertyuiopalskjdhfgmznxbcvQWRETYUIOPLAKJSHGDFVZCXBNM1234567890";
    this.l = length || 16;
    this.t = this.t.split("");
    this.s = [];
  }

  c(n) {
    this.c1 = this.m.floor(this.m.random() * 16);
    this.c2 = this.m.floor(this.m.random() * 16);
    [this.t[this.c1], this.t[this.c2]] = [this.t[this.c2], this.t[this.c1]];
    if (n !== 1) return this.c(n - 1);
  }
  g() {
    this.c(16);
    this.s.push(this.t[this.m.floor(this.m.random() * 16)]);
    if (this.s.length != this.l) return this.g();
  }
  seedSync() {
    this.g();
    this._b16 = this.s;
    this.s = [];
    return this._b16.join("");
  }
  seed() {
    this.g();
    this._b16 = this.s;
    this.s = [];
    return this._b16.join("");
  }
};
