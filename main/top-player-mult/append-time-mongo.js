async function AppendTime(users) {
    let players = users;
    let allplayers = [];
    for (let i = 0; i < players.length; i++) {
      let time = players[i].createdAt;
      let mounth = time.toString().split(" ")[1];
      let date = time.toString().split(" ")[2];
      let times = `${date} ${mounth}`;
      let dur = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
  
      players[i].time = times;
      players[i].dur = dur;
      allplayers.push(players[i]);
    }
  
    return allplayers;
  }
  
  module.exports = AppendTime;
  