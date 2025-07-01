import { ChessGameObject } from "../chess_game_object/base.js";

export class GameMap extends ChessGameObject {
    constructor(root) {
        super();
        this.root = root;


        this.$container = $('<div class="game-container"></div>');
        this.$container.css({
            'display': 'flex', 'justify-content': 'center', 'align-items': 'center',
            'width': '100%', 'height': '100vh', 'position': 'fixed', 'top': 0, 'left': 0
        });
        this.root.$chess.append(this.$container);

        this.$canvas = $('<canvas id="myCanvas" tabindex="1"></canvas>');
        this.ctx = this.$canvas[0].getContext('2d');
        this.$container.append(this.$canvas);
        this.$canvas.focus();

        this.resize();
        $(window).on('resize', () => this.resize());

        // 初始化棋盘（8x8，0=空，1=黑，2=白）
        this.board = Array(8).fill().map(() => Array(8).fill(0));
        // 标准黑白棋初始布局：中心四枚棋子
        this.board[3][3] = 1; // 黑棋（列3，行3）
        this.board[3][4] = 2; // 白棋（列3，行4）
        this.board[4][3] = 2; // 白棋（列4，行3）
        this.board[4][4] = 1; // 黑棋（列4，行4）

        this.current_player = 0; // 0=黑棋，1=白棋
        

        this.$status = $('#player-info');
        if (!this.$status.length) {
            this.$status = $('<div id="player-info"></div>');
            this.$status.css({
                'position': 'fixed', 'top': '10px', 'left': '50%', 
                'transform': 'translateX(-50%)', 'z-index': '100',
                'text-align': 'center', 'color': 'white', 'font-size': '18px'
            });
            $('body').append(this.$status);
        } else {
            this.$status.css({
                'text-align': 'center', 'color': 'white', 'font-size': '18px'
            });
        }
        
        this.updateStatus();
        this.render();
    }

    start() {
        this.$canvas.on('click', (e) => this.handleClick(e));
    }

    resize() {
        const size = Math.min(window.innerWidth * 0.6, window.innerHeight * 0.6);
        this.$canvas[0].width = size;
        this.$canvas[0].height = size;
        this.$canvas.css({ 'width': `${size}px`, 'height': `${size}px` });
    }

    // 检查是否可落子
    isValidMove(col, row) {
        if (col < 0 || col >= 8 || row < 0 || row >= 8 || this.board[col][row] !== 0) {
            return false;
        }

   
        const self = this.current_player + 1;       
        const opponent = 3 - self;                

        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],          [0, 1],
            [1, -1],  [1, 0], [1, 1]
        ];

        for (const [dx, dy] of directions) {
            let x = col + dx;
            let y = row + dy;
            let hasOpponent = false;

            while (x >= 0 && x < 8 && y >= 0 && y < 8) {
                const cell = this.board[x][y];
                if (cell === 0) {
                    break; // 遇到空格，无法形成连线
                } else if (cell === opponent) {
                    hasOpponent = true; // 找到对方棋子
                } else if (cell === self) {
                    // 找到自己的棋子，且中间有对方棋子 → 可落子
                    if (hasOpponent) return true;
                    else break; // 中间无对方棋子，中断
                }
                x += dx;
                y += dy;
            }
        }

        return false;
    }

    // 落子并翻转棋子
    makeMove(col, row) {
        // 放置自身棋子
        const self = this.current_player + 1; // 1=黑，2=白
        this.board[col][row] = self;

        // 八个方向翻转
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],          [0, 1],
            [1, -1],  [1, 0], [1, 1]
        ];

        for (const [dx, dy] of directions) {
            this.flipPieces(col, row, dx, dy);
        }
    }

    // 翻转指定方向的棋子（仅翻转「对方棋子」）
    flipPieces(col, row, dx, dy) {
        let x = col + dx;
        let y = row + dy;
        const target = [];

        // 定义「自身」和「对方」棋子值
        const self = this.current_player + 1;       // 0→1（黑），1→2（白）
        const opponent = 3 - self;                 // 黑的对方是白=2，白的对方是黑=1

        while (x >= 0 && x < 8 && y >= 0 && y < 8) {
            const cell = this.board[x][y];
            if (cell === 0) {
                break; // 遇到空格，中断
            } else if (cell === opponent) {
                target.push([x, y]); // 收集对方棋子
            } else if (cell === self) {
                // 找到自己的棋子 → 翻转中间的对方棋子
                for (const [tx, ty] of target) {
                    this.board[tx][ty] = self;
                }
                break;
            }
            x += dx;
            y += dy;
        }
    }

    handleClick(e) {
        const rect = this.$canvas[0].getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const gridSize = this.ctx.canvas.width / 8;
        const col = Math.floor(x / gridSize);
        const row = Math.floor(y / gridSize);

        if (col < 0 || col >= 8 || row < 0 || row >= 8) return;

        if (this.isValidMove(col, row)) {
            this.makeMove(col, row);
            // 切换玩家（更简洁的写法）
            this.current_player = 1 - this.current_player;
            this.updateStatus();
        }

        this.render();
    }

    updateStatus() {
        if (!this.$status) return;
        const player = this.current_player === 0 ? '黑棋' : '白棋';
        this.$status.text(`当前玩家: ${player}`);
    }

    render() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // 绘制棋盘背景
        this.ctx.fillStyle = '#E0F2FF';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // 绘制网格
        const gridSize = this.ctx.canvas.width / 8;
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= 8; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, gridSize * i);
            this.ctx.lineTo(this.ctx.canvas.width, gridSize * i);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(gridSize * i, 0);
            this.ctx.lineTo(gridSize * i, this.ctx.canvas.height);
            this.ctx.stroke();
        }

        // 绘制棋子
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = this.board[i][j];
                if (piece === 1 || piece === 2) {
                    const centerX = gridSize * i + gridSize / 2;
                    const centerY = gridSize * j + gridSize / 2;
                    const radius = gridSize * 0.4;

                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    this.ctx.fillStyle = piece === 1 ? 'black' : 'white';
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#654321';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                }
            }
        }

        // 绘制可落子提示
        if (this.current_player !== null) {
            const gridSize = this.ctx.canvas.width / 8;
            this.ctx.fillStyle = this.current_player === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)';
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    if (this.isValidMove(i, j)) {
                        const centerX = gridSize * i + gridSize / 2;
                        const centerY = gridSize * j + gridSize / 2;
                        const radius = gridSize * 0.4;
                        this.ctx.beginPath();
                        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                }
            }
        }
    }

    initStatus() {
        this.$status = $('<div class="game-status"></div>');
        this.$status.css({
            'text-align': 'center', 'color': 'white', 'font-size': '18px', 'margin-bottom': '10px'
        });
        this.root.$chess.prepend(this.$status);
        this.updateStatus();
    }

}