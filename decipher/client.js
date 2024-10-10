const x = require("crypto");

class Processing {
  constructor(double) {
    this.o = double;
    this.m = "provably fair";
  }

  async q(k) {
    var s = JSON.stringify(k);

    for (let i = 0; i < this.o; i++) {
      let f = x.Cipher("aes-256-cbc", this.m);
      let l = f.update(s, "utf-8", "hex");
      l += f.final("hex");
      s = l;
    }
    return s;
  }

  async z(r) {
    var j = r;

    for (let i = 0; i < this.o; i++) {
      let a = x.Decipher("aes-256-cbc", this.m);
      let g = a.update(j, "hex", "utf-8");
      g += a.final("utf-8");
      j = g;
    }
    return JSON.parse(j);
  }
}
