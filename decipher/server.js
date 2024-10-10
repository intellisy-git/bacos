const crypto = require("crypto");

let secret = "provably fair";

class Processing {
  constructor(hashcount) {
    this.counts = hashcount;
    this.secret = "provably fair";
  }

  async hash(data_to_encrypt) {
    var data = JSON.stringify(data_to_encrypt);

    for (let i = 0; i < this.counts; i++) {
      let cipher = crypto.Cipher("aes-256-cbc", this.secret);
      let ecrypt = cipher.update(data, "utf-8", "hex");
      ecrypt += cipher.final("hex");
      data = ecrypt;
    }
    return data;
  }

  async retrive(data_to_dencrypt) {
    var data = data_to_dencrypt;

    for (let i = 0; i < this.counts; i++) {
      let cipher = crypto.Decipher("aes-256-cbc", this.secret);
      let decrypt = cipher.update(data, "hex", "utf-8");
      decrypt += cipher.final("utf-8");
      data = decrypt;
    }
    return JSON.parse(data);
  }
}

let v = new Processing(2);

