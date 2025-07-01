let CHESS_GAME_OBJECT=[];

class ChessGameObject{
    constructor(){
        CHESS_GAME_OBJECT.push(this);
        

        this.timedelta=0;//时间挫，记录上一帧与当前帧的时间间隔
        this.has_call_start=false;
    }

    //初始化，第一帧执行一次
    start(){

    }

    //除第一帧外，每一帧执行一次
    update(){

    }

    //删除当前对象
    destroy(){
        for(let i in CHESS_GAME_OBJECT){
            if(CHESS_GAME_OBJECT[i]===this){
                CHESS_GAME_OBJECT.splice(i,1);
                break;
            }
        }
    }
}

//表示上一帧执行的时刻
let last_timespace;
let CHESS_GAME_OBJECT_FRAME=(timestamp)=>{
    for(let obj of CHESS_GAME_OBJECT){
        if(!obj.has_call_start){
            obj.start();
            obj.has_call_start=true;
        }else{
            obj.timedelta=timestamp-last_timespace;
            obj.update();
        }
        last_timespace=timestamp;
        requestAnimationFrame(CHESS_GAME_OBJECT_FRAME);
    }
}
requestAnimationFrame(CHESS_GAME_OBJECT_FRAME);
export{
    ChessGameObject
}