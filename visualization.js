class CliffWalkVisualization {
    constructor(canvas, env) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.env = env;
        this.cellWidth = canvas.width / env.cols;
        this.cellHeight = canvas.height / env.rows;
        
        // 更新颜色和样式
        this.agentColor = '#3498db';
        this.goalColor = '#2ecc71';
        this.cliffColor = '#e74c3c';
        this.gridColor = '#bdc3c7';
        this.pathColor = 'rgba(52, 152, 219, 0.2)';
        this.groundColor = '#f9f9f9';
        
        // 加载图像
        this.loadImages();
        
        this.agentHistory = [];
        this.visitedCells = new Set();
    }
    
    loadImages() {
        // 加载智能体图像
        this.agentImg = new Image();
        this.agentImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjMzQ5OGRiIiBkPSJNMjU2IDhDMTE5LjAzMyA4IDggMTE5LjAzMyA4IDI1NnMxMTEuMDMzIDI0OCAyNDggMjQ4IDI0OC0xMTEuMDMzIDI0OC0yNDhTMzkyLjk2NyA4IDI1NiA4em0wIDMyYzEyLjc1IDAgMjMgMTAuMjUgMjMgMjNzLTEwLjI1IDIzLTIzIDIzLTIzLTEwLjI1LTIzLTIzIDEwLjI1LTIzIDIzLTIzek0zMjAgMzg0Yy0xNy42NyAwLTMyLTE0LjMzLTMyLTMydi0xMjhjMC0xNy42NyAxNC4zMy0zMiAzMi0zMmg2NHYxNjBjMCAxNy42Ny0xNC4zMyAzMi0zMiAzMnoiLz48L3N2Zz4=';
        
        // 加载悬崖图像
        this.cliffImg = new Image();
        this.cliffImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1NzYgNTEyIj48cGF0aCBmaWxsPSIjZTc0YzNjIiBkPSJNNDY0IDMySDExMmMtNTIuOCAwLTk2IDQzLjItOTYgOTZ2MzIwYzAgMTcuNyAxNC4zIDMyIDMyIDMyaDQ4MGMxNy43IDAgMzItMTQuMyAzMi0zMlYxMjhjMC01Mi44LTQzLjItOTYtOTYtOTZ6TTEyOCA0MTZjLTI2LjUgMC00OC0yMS41LTQ4LTQ4czIxLjUtNDggNDgtNDggNDggMjEuNSA0OCA0OC0yMS41IDQ4LTQ4IDQ4em0xNi0xMTJjLTI2LjUgMC00OC0yMS41LTQ4LTQ4czIxLjUtNDggNDgtNDggNDggMjEuNSA0OCA0OC0yMS41IDQ4LTQ4IDQ4em05NiAwYy0yNi41IDAtNDgtMjEuNS00OC00OHMyMS41LTQ4IDQ4LTQ4IDQ4IDIxLjUgNDggNDgtMjEuNSA0OC00OCA0OHptOTYgMGMtMjYuNSAwLTQ4LTIxLjUtNDgtNDhzMjEuNS00OCA0OC00OCA0OCAyMS41IDQ4IDQ4LTIxLjUgNDgtNDggNDh6bTk2IDAtNDgtNDhzMjEuNS00OCA0OC00OCA0OCAyMS41IDQ4IDQ4LTIxLjUgNDgtNDggNDh6Ii8+PC9zdmc+';
        
        // 加载终点图像
        this.goalImg = new Image();
        this.goalImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjMmVjYzcxIiBkPSJNMjU2IDhDMTE5LjAzMyA4IDggMTE5LjAzMyA4IDI1NnMxMTEuMDMzIDI0OCAyNDggMjQ4IDI0OC0xMTEuMDMzIDI0OC0yNDhTMzkyLjk2NyA4IDI1NiA4em0xMTQuMjUyIDI5Ni40MWMtMy42ODIgMy42ODItNS41MjMgOC4xMTQtNS41MjMgMTMuMDk2IDAgNS4wMjcgMS44NDEgOS40NTkgNS41MjMgMTMuMTQxIDMuNjgyIDMuNjgyIDguMTY4IDUuNTIzIDEzLjE0MSA1LjUyMyA0Ljk3MyAwIDkuNDU5LTEuODQxIDEzLjE0MS01LjUyMyAzLjY4Mi0zLjY4MiA1LjUyMy04LjExNCA1LjUyMy0xMy4xNDEgMC00Ljk4Mi0xLjg0MS05LjQxNC01LjUyMy0xMy4wOTYtMy42ODItMy42ODItOC4xNjgtNS41MjMtMTMuMTQxLTUuNTIzLTQuOTczIDAtOS40NTkgMS44NDEtMTMuMTQxIDUuNTIzem0tMjU2LjY2MiAwYy0zLjY4MiAzLjY4Mi01LjUyMyA4LjExNC01LjUyMyAxMy4wOTYgMCA1LjAyNyAxLjg0MSA5LjQ1OSA1LjUyMyAxMy4xNDEgMy42ODIgMy42ODIgOC4xNjggNS41MjMgMTMuMTQxIDUuNTIzIDQuOTczIDAgOS40NTktMS44NDEgMTMuMTQxLTUuNTIzIDMuNjgyLTMuNjgyIDUuNTIzLTguMTE0IDUuNTIzLTEzLjE0MSAwLTQuOTgyLTEuODQxLTkuNDE0LTUuNTIzLTEzLjA5Ni0zLjY4Mi0zLjY4Mi04LjE2OC01LjUyMy0xMy4xNDEtNS41MjMtNC45NzMgMC05LjQ1OSAxLjg0MS0xMy4xNDEgNS41MjN6bTI1Ni0yMjYuODA0YzEuNTAxIDEuNTAxIDMuMzQ2IDIuMjUxIDUuNTIzIDIuMjUxIDIuMTc3IDAgNC4wMjItLjc1IDUuNTIzLTIuMjUxIDEuNTAxLTEuNTAxIDIuMjUxLTMuMzQ2IDIuMjUxLTUuNTIzIDAtMi4xNzctLjc1LTQuMDIyLTIuMjUxLTUuNTIzLTEuNTAxLTEuNTAxLTMuMzQ2LTIuMjUxLTUuNTIzLTIuMjUxLTIuMTc3IDAtNC4wMjIuNzUtNS41MjMgMi4yNTEtMS41MDEgMS41MDEtMi4yNTEgMy4zNDYtMi4yNTEgNS41MjMgMCAyLjE3Ny43NSA0LjAyMiAyLjI1MSA1LjUyM3ptLTI1NiAwYzEuNTAxIDEuNTAxIDMuMzQ2IDIuMjUxIDUuNTIzIDIuMjUxIDIuMTc3IDAgNC4wMjItLjc1IDUuNTIzLTIuMjUxIDEuNTAxLTEuNTAxIDIuMjUxLTMuMzQ2IDIuMjUxLTUuNTIzIDAtMi4xNzctLjc1LTQuMDIyLTIuMjUxLTUuNTIzLTEuNTAxLTEuNTAxLTMuMzQ2LTIuMjUxLTUuNTIzLTIuMjUxLTIuMTc3IDAtNC4wMjIuNzUtNS41MjMgMi4yNTEtMS41MDEgMS41MDEtMi4yNTEgMy4zNDYtMi4yNTEgNS41MjMgMCAyLjE3Ny43NSA0LjAyMiAyLjI1MSA1LjUyM3ptMTI4LTMyYzM1LjM0NiAwIDY0IDI4LjY1NCA2NCA2NHYxMjhjMCAzNS4zNDYtMjguNjU0IDY0LTY0IDY0cy02NC0yOC42NTQtNjQtNjRWMTQ0YzAtMzUuMzQ2IDI4LjY1NC02NCA2NC02NHptMCAzMmMtMTcuNjczIDAtMzIgMTQuMzI3LTMyIDMydjEyOGMwIDE3LjY3MyAxNC4zMjcgMzIgMzIgMzJzMzItMTQuMzI3IDMyLTMyVjE0NGMwLTE3LjY3My0xNC4zMjctMzItMzItMzJ6Ii8+PC9zdmc+';
        
        // 加载地面图像
        this.groundImg = new Image();
        this.groundImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjZjlmOWY5IiBkPSJNMCAwaDUxMnY1MTJIMHoiLz48cGF0aCBmaWxsPSIjZWVlZWVlIiBkPSJNMzIgMzJoNDQ4djQ0OEgzMnoiLz48L3N2Zz4=';
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.agentHistory = [];
        this.visitedCells = new Set();
    }

    drawGrid() {
        // 绘制背景
        this.ctx.fillStyle = this.groundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格线
        this.ctx.strokeStyle = this.gridColor;
        this.ctx.lineWidth = 1;

        // 绘制垂直线
        for (let i = 0; i <= this.env.cols; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellWidth, 0);
            this.ctx.lineTo(i * this.cellWidth, this.canvas.height);
            this.ctx.stroke();
        }

        // 绘制水平线
        for (let i = 0; i <= this.env.rows; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellHeight);
            this.ctx.lineTo(this.canvas.width, i * this.cellHeight);
            this.ctx.stroke();
        }
        
        // 绘制地面纹理
        for (let row = 0; row < this.env.rows; row++) {
            for (let col = 0; col < this.env.cols; col++) {
                // 跳过悬崖和目标位置
                if (row === this.env.rows - 1 && col > 0 && col < this.env.cols - 1) continue;
                if (row === this.env.rows - 1 && col === this.env.cols - 1) continue;
                
                this.ctx.drawImage(
                    this.groundImg,
                    col * this.cellWidth + 1,
                    row * this.cellHeight + 1,
                    this.cellWidth - 2,
                    this.cellHeight - 2
                );
            }
        }
    }

    drawEnvironment() {
        // 绘制悬崖
        for (let col = 1; col < this.env.cols - 1; col++) {
            const row = this.env.rows - 1;
            
            // 绘制悬崖背景
            this.ctx.fillStyle = this.cliffColor;
            this.ctx.fillRect(
                col * this.cellWidth + 1,
                row * this.cellHeight + 1,
                this.cellWidth - 2,
                this.cellHeight - 2
            );
            
            // 绘制悬崖图像
            this.ctx.drawImage(
                this.cliffImg,
                col * this.cellWidth + 5,
                row * this.cellHeight + 5,
                this.cellWidth - 10,
                this.cellHeight - 10
            );
        }


        // 绘制悬崖背景
        let col = Math.floor(this.env.cols/2);
        let row = this.env.rows - 2;
        this.ctx.fillStyle = this.cliffColor;
        this.ctx.fillRect(
            col * this.cellWidth + 1,
            row * this.cellHeight + 1,
            this.cellWidth - 2,
            this.cellHeight - 2
        );
        
        // 绘制悬崖图像
        this.ctx.drawImage(
            this.cliffImg,
            col * this.cellWidth + 5,
            row * this.cellHeight + 5,
            this.cellWidth - 10,
            this.cellHeight - 10
        );
        

        // 绘制目标
        const goalRow = this.env.rows - 1;
        const goalCol = this.env.cols - 1;
        
        // 绘制目标背景
        this.ctx.fillStyle = this.goalColor;
        this.ctx.fillRect(
            goalCol * this.cellWidth + 1,
            goalRow * this.cellHeight + 1,
            this.cellWidth - 2,
            this.cellHeight - 2
        );
        
        // 绘制目标图像
        this.ctx.drawImage(
            this.goalImg,
            goalCol * this.cellWidth + 5,
            goalRow * this.cellHeight + 5,
            this.cellWidth - 10,
            this.cellHeight - 10
        );
    }

    drawAgent(state) {
        const row = Math.floor(state / this.env.cols);
        const col = state % this.env.cols;
        
        // 添加到历史记录
        this.agentHistory.push({row, col});
        
        // 添加到已访问单元格集合
        const cellKey = `${row},${col}`;
        this.visitedCells.add(cellKey);
        
        // 重新绘制整个环境
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.drawEnvironment();
        
        // 绘制历史路径，只绘制智能体实际访问过的单元格
        this.ctx.fillStyle = this.pathColor;
        for (const cellKey of this.visitedCells) {
            const [r, c] = cellKey.split(',').map(Number);
            
            // 跳过悬崖位置
            if (r === this.env.rows - 1 && c > 0 && c < this.env.cols - 1) {
                continue;
            }
            
            // 跳过目标位置
            if (r === this.env.rows - 1 && c === this.env.cols - 1) {
                continue;
            }
            
            this.ctx.fillRect(
                c * this.cellWidth + 2,
                r * this.cellHeight + 2,
                this.cellWidth - 4,
                this.cellHeight - 4
            );
        }
        
        // 绘制智能体
        const centerX = (col + 0.5) * this.cellWidth;
        const centerY = (row + 0.5) * this.cellHeight;
        const size = Math.min(this.cellWidth, this.cellHeight) * 0.7;
        
        // 绘制智能体图像
        this.ctx.drawImage(
            this.agentImg,
            centerX - size/2,
            centerY - size/2,
            size,
            size
        );
    }

    render(state) {
        // 直接调用drawAgent，它会处理所有绘制
        this.drawAgent(state);
    }
}

// 全局变量
let visualization;
let isTraining = false;
let isPaused = false;
let currentEpoch = 0;
let animationSpeed = 50;

// DOM元素
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('cliff-walk-canvas');
    const startButton = document.getElementById('start-training');
    const pauseButton = document.getElementById('pause-training');
    const stepButton = document.getElementById('step-training');
    const speedControl = document.getElementById('speed-control');
    const currentEpochSpan = document.getElementById('current-epoch');
    const totalRewardSpan = document.getElementById('total-reward');
    const demoButton = document.getElementById('demo-policy');
    
    // 初始化速度控制
    speedControl.addEventListener('input', () => {
        animationSpeed = parseInt(speedControl.value);
    });
    
    // 开始训练按钮
    startButton.addEventListener('click', () => {
        if (!isTraining) {
            isTraining = true;
            isPaused = false;
            startVisualization();
        } else if (isPaused) {
            isPaused = false;
        }
    });
    
    // 暂停按钮
    pauseButton.addEventListener('click', () => {
        isPaused = true;
    });
    
    // 单步执行按钮
    stepButton.addEventListener('click', () => {
        if (isTraining && isPaused) {
            runSingleEpoch();
        }
    });
    
    // 添加演示按钮事件处理
    demoButton.addEventListener('click', () => {
        console.log("演示按钮被点击");
        // 无论训练状态如何，都尝试运行演示
        if (window.runDemonstration) {
            window.runDemonstration();
        } else {
            console.error("runDemonstration 函数未定义");
        }
    });
    
    // 初始化可视化
    function initVisualization(env) {
        visualization = new CliffWalkVisualization(canvas, env);
        visualization.drawGrid();
        visualization.drawEnvironment();
    }
    
    // 全局函数，供train.js调用
    window.initVisualization = initVisualization;
    window.updateVisualization = function(state, epoch, totalReward) {
        visualization.render(state);
        currentEpochSpan.textContent = epoch;
        totalRewardSpan.textContent = totalReward;
    };
    
    window.isTrainingPaused = function() {
        return isPaused;
    };
    
    window.getAnimationSpeed = function() {
        return animationSpeed;
    };
    
    window.startVisualization = startVisualization;
    window.runSingleEpoch = runSingleEpoch;
    window.runDemonstration = runDemonstration;
});

function startVisualization() {
    // 这个函数将在train.js中实现
    console.log("开始可视化训练");
}

function runSingleEpoch() {
    // 这个函数将在train.js中实现
    console.log("执行单步训练");
}

function runDemonstration() {
    // 这个函数将在train.js中实现
    console.log("演示最优策略");
} 