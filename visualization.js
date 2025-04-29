class CliffWalkVisualization {
    constructor(canvas, env) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.env = env;
        this.cellWidth = canvas.width / env.cols;
        this.cellHeight = canvas.height / env.rows;
        this.agentColor = '#3498db';
        this.goalColor = '#2ecc71';
        this.cliffColor = '#e74c3c';
        this.gridColor = '#bdc3c7';
        this.pathColor = 'rgba(52, 152, 219, 0.3)';
        this.agentHistory = [];
        this.visitedCells = new Set();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.agentHistory = [];
        this.visitedCells = new Set();
    }

    drawGrid() {
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
    }

    drawEnvironment() {
        // 绘制悬崖
        this.ctx.fillStyle = this.cliffColor;
        for (let col = 1; col < this.env.cols - 1; col++) {
            const row = this.env.rows - 1;
            this.ctx.fillRect(
                col * this.cellWidth,
                row * this.cellHeight,
                this.cellWidth,
                this.cellHeight
            );
        }

        // 绘制目标
        this.ctx.fillStyle = this.goalColor;
        this.ctx.fillRect(
            (this.env.cols - 1) * this.cellWidth,
            (this.env.rows - 1) * this.cellHeight,
            this.cellWidth,
            this.cellHeight
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
                c * this.cellWidth,
                r * this.cellHeight,
                this.cellWidth,
                this.cellHeight
            );
        }
        
        // 绘制智能体
        this.ctx.fillStyle = this.agentColor;
        const centerX = (col + 0.5) * this.cellWidth;
        const centerY = (row + 0.5) * this.cellHeight;
        const radius = Math.min(this.cellWidth, this.cellHeight) * 0.4;
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
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
});

function startVisualization() {
    // 这个函数将在train.js中实现
    console.log("开始可视化训练");
}

function runSingleEpoch() {
    // 这个函数将在train.js中实现
    console.log("执行单步训练");
} 