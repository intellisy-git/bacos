

async function Huges(users) {

    let players = users;
    for(let i = 0; i < players.length; i++) {
        players[i].pnt = (Number(players[i].amount) * 100) / Number(players[i].wonamount);    
    }

    players.sort(function(a, b){return a.pnt - b.pnt});

    players = players.slice(0,16);

    return players;


}


module.exports =  Huges;
