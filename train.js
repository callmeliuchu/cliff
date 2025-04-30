function sampleAction(probs) {
    // 生成一个0到1之间的随机数
    const r = Math.random();
    
    // 计算累积概率并找到第一个累积概率大于等于r的索引
    let cumulativeProb = 0;
    for (let i = 0; i < probs.length; i++) {
        cumulativeProb += probs[i];
        if (r <= cumulativeProb) {
            return i;
        }
    }
    
    // 如果由于浮点数精度问题没有返回，则返回最后一个索引
    return probs.length - 1;
}

// let n_states = 8;
// let n_actions = 4;

function discount_rewards(rewards,gamma){
    let res = [];
    let adding = 0;
    for(let i=rewards.length-1;i>=0;i--){
        adding = rewards[i] + gamma * adding;
        res.push(adding);
    }
    res = res.reverse();
    // mean std
    let mean = res.reduce((a,b)=>a+b,0)/res.length;
    let std = Math.sqrt(res.reduce((a,b)=>a+Math.pow(b-mean,2),0)/res.length);
    res = res.map(x=>x/(std+1e-15));
    return res; 
}

class Agent{
    constructor(n_states,n_actions){
        this.policy_net = new Network(n_states, 200, n_actions);
        this.n_states = n_states;
        this.n_actions = n_actions;
        this.random_eplisio = 0.7;
        this.update_count = 0;
    }
    get_max_prob_action(state){
        let state_arr = [];
        for(let i=0;i<this.n_states;i++){
            if(i == state){
                state_arr.push(1);
            }else{
                state_arr.push(0);
            }
        }
        let [h, h_relu, out, out_softmax] = this.policy_net.forward(state_arr); // 4
        let max_prob = Math.max(...out_softmax);
        let max_prob_action = out_softmax.indexOf(max_prob);
        return max_prob_action;
    }
    get_action(state){
        let state_arr = [];
        for(let i=0;i<this.n_states;i++){
            if(i == state){
                state_arr.push(1);
            }else{
                state_arr.push(0);
            }
        }
        let [h, h_relu, out, out_softmax] = this.policy_net.forward(state_arr); // 4
        // console.log(state_arr,out_softmax);
        // 采样动作，javascript没有np.random.choice，根据probs 概率采样，概率大的采样概率大
        let action;
        if(Math.random() < this.random_eplisio){
            action = Math.floor(Math.random() * (this.n_actions));
            // console.log('随机动作',action);
        }else{
            action = sampleAction(out_softmax);
            // console.log('抽样动作',action);
        }
        return [state_arr, h, h_relu, out, out_softmax,action];
    }
    update(rewards,agent_outputs){
        // let dW1,dW2 = this.policy_net.grad(states,actions,rewards,probs);
        // this.policy_net.backward(dW1,dW2,lr);
        rewards = discount_rewards(rewards,0.99);
        this.update_count++;
        for(let i=0;i<rewards.length;i++){
            let reward = rewards[i]; // 1
            let [state_arr, h, h_relu, out, out_softmax,action] = agent_outputs[i]; // [h, h_relu, out, out_softmax,action]
            let rs =  [];
            for(let k=0;k<this.n_actions;k++){
                if(k == action){
                    rs.push(reward);
                }else{
                    rs.push(0);
                }
            }
            let entropy = cross_entropy(out_softmax,rs);
            console.log('entropy',entropy);
            let dout = cross_entropy_derive(out_softmax,rs);
            // console.log(dout);
            // console.log(out_softmax);
            // console.log(rs);
            let [dW1,dW2] = this.policy_net.grad(state_arr,h,h_relu,out,out_softmax,dout);
            // console.log('dw1',dW1)
            // console.log('dw2',dW2)
            this.policy_net.backward(dW1,dW2,0.01/rewards.length);
        }
        if(this.update_count < 500){
            this.random_eplisio = 0.7;
        }else if(this.update_count <1000){
            this.random_eplisio = 0.5;
        }else if(this.update_count <1500){
            this.random_eplisio = 0.3;
        }else{
            this.random_eplisio = Math.max(this.random_eplisio * 0.99,0.05);
        }
            console.log('random_eplisio',this.random_eplisio);

        }
}

// let env = new CliffWalkEnv(2,4);
// let agent = new Agent(env.cols * env.rows, 4);

// for(let epoch=0;epoch<1000;epoch++){
//     let rewards = [];
//     let agent_outputs = [];
//     let state = env.reset();
//     while(!env.done){
//         let [state_arr, h, h_relu, out, out_softmax,action] = agent.get_action(state);
//         let [next_state, reward, done] = env.step(action);
//         rewards.push(reward);
//         agent_outputs.push([state_arr, h, h_relu, out, out_softmax,action]);
//         state = next_state;
//     }
//     agent.update(rewards,agent_outputs);
//     console.log('rewards1111',env.totalReward);

// }

// 全局变量
let env;
let agent;
let maxEpochs = 2000;
let isRunning = false;

document.getElementById('total-epochs').innerText = maxEpochs;

function initTraining() {
    env = new CliffWalkEnv(3, 5);
    agent = new Agent(env.cols * env.rows, 4);
    currentEpoch = 0; // 使用已经在 visualization.js 中声明的变量
    
    // 初始化可视化
    if (typeof window !== 'undefined' && window.initVisualization) {
        window.initVisualization(env);
    }
}

// 运行单个回合
async function runEpoch() {
    let rewards = [];
    let agent_outputs = [];
    let state = env.reset();
    
    // 更新可视化
    if (typeof window !== 'undefined' && window.updateVisualization) {
        window.updateVisualization(state, currentEpoch, env.totalReward);
    }
    
    while (!env.done) {
        // 检查是否暂停
        if (typeof window !== 'undefined' && window.isTrainingPaused && window.isTrainingPaused()) {
            await new Promise(resolve => setTimeout(resolve, 100));
            continue;
        }
        
        let [state_arr, h, h_relu, out, out_softmax, action] = agent.get_action(state);
        let [next_state, reward, done] = env.step(action);
        rewards.push(reward);
        agent_outputs.push([state_arr, h, h_relu, out, out_softmax, action]);
        
        // 更新可视化
        if (typeof window !== 'undefined' && window.updateVisualization) {
            window.updateVisualization(next_state, currentEpoch, env.totalReward);
            
            // 控制动画速度
            const speed = window.getAnimationSpeed ? window.getAnimationSpeed() : 50;
            await new Promise(resolve => setTimeout(resolve, 101 - speed));
        }
        
        state = next_state;
    }
    
    agent.update(rewards, agent_outputs);
    console.log('回合 ' + currentEpoch + ' 总奖励: ' + env.totalReward);
    
    currentEpoch++;
}

// 开始训练
async function startTraining() {
    if (isRunning) return;
    isRunning = true;
    
    while (currentEpoch < maxEpochs) {
        // 检查是否暂停
        if (typeof window !== 'undefined' && window.isTrainingPaused && window.isTrainingPaused()) {
            await new Promise(resolve => setTimeout(resolve, 100));
            continue;
        }
        
        await runEpoch();
    }
    
    isRunning = false;
    console.log('训练完成');
}

// 运行单步训练
async function runSingleEpoch() {
    if (currentEpoch < maxEpochs) {
        await runEpoch();
    } else {
        console.log('已达到最大回合数');
    }
}

// 演示最优策略
async function demonstrateOptimalPolicy() {
    console.log("开始演示最优策略");
    
    // 暂停当前训练（如果正在进行）
    let wasRunning = isRunning;
    isRunning = false;
    
    // 清除可视化历史
    if (typeof window !== 'undefined' && window.initVisualization) {
        window.initVisualization(env);
    }
    
    let state = env.reset();
    let totalReward = 0;
    
    // 更新可视化
    if (typeof window !== 'undefined' && window.updateVisualization) {
        window.updateVisualization(state, "演示", totalReward);
    }
    
    // 确保agent已经初始化
    if (!agent) {
        console.error("智能体未初始化");
        return;
    }
    
    try {
        while (!env.done) {
            // 使用最大概率动作（贪婪策略）
            let action = agent.get_max_prob_action(state);
            console.log(`状态 ${state}, 选择动作 ${action}`);
            
            let [next_state, reward, done] = env.step(action);
            totalReward += reward;
            
            // 更新可视化
            if (typeof window !== 'undefined' && window.updateVisualization) {
                window.updateVisualization(next_state, "演示", totalReward);
                
                // 控制动画速度
                const speed = window.getAnimationSpeed ? window.getAnimationSpeed() : 50;
                await new Promise(resolve => setTimeout(resolve, 101 - speed));
            }
            
            state = next_state;
        }
        
        console.log('演示完成，总奖励: ' + totalReward);
    } catch (error) {
        console.error("演示过程中出错:", error);
    }
    
    // 恢复之前的训练状态
    isRunning = wasRunning;
}

// 浏览器环境下的初始化
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        initTraining();
        
        // 连接到可视化控制
        window.startVisualization = startTraining;
        window.runSingleEpoch = runSingleEpoch;
        window.runDemonstration = demonstrateOptimalPolicy; // 确保这个赋值正确
        
        // 直接在控制台输出，确认函数已赋值
        console.log("演示函数已设置:", !!window.runDemonstration);
    });
} else {
    // Node.js环境下直接运行
    initTraining();
    startTraining();
}

// 保留原始代码的兼容性
if (typeof module !== 'undefined' && module.exports) {
    // 如果在Node.js环境中
    module.exports = { initTraining, runEpoch, startTraining };
}



