const loaddata =  async (accessToken) =>{

    let loadOnlinePlayers = [
        {
            "playername": "somename",
            "playerimage": "playerimage",
            "playeramount": "someamount"
        }
    ];

    let isMeInGame = [{
        "betBtnId": 2,
        "amount": 3500,
    },{
        "betBtnId": 1,
        "amount": 3500,
    }];

    let data =  {
        "roundPlayers": [...loadOnlinePlayers],
        "isInGame": isMeInGame.length > 0,
        "myBetState": {
            "bet1": {
                "amount": (
                    (
                        isMeInGame.length > 0 &&
                        (isMeInGame[0].betBtnId == 1 ||
                        isMeInGame[isMeInGame.length - 1].betBtnId == 1)
                    )? (isMeInGame.filter((value,index)=> {
                        return value.betBtnId == 1
                    }))[0].amount : false
                )
            },
            "bet2": {
                "amount": (
                    (
                        isMeInGame.length > 0 &&
                        (isMeInGame[0].betBtnId == 2 ||
                        isMeInGame[isMeInGame.length - 1].betBtnId == 2)
                    )? (isMeInGame.filter((value,index)=> {
                        return value.betBtnId == 2
                    }))[0].amount : false
                )
            }
        },
    }

    return await data;

}
