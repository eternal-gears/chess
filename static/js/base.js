import { GameMap } from "./chess_game_map/base.js";


class Chess {
    constructor(id){
        this.$chess=$('#'+id);

        this.game_map=new GameMap(this);
        // this.player=[
        //     new Player(this,{
        //         id:0,
        //         color:'black',
        //     }),
        //     new Player(this,{
        //         id:1,
        //         color:'white',
        //     }),
        // ]
    }
}

export{
    Chess
}