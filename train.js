

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


let n_states = 8;
let n_actions = 4;

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
    res = res.map(x=>x/std);
    return res; 
}


class Agent{
    constructor(){
        this.policy_net = new Network(n_states, 200, n_actions);
    }
    get_action(state){
        let state_arr = [];
        for(let i=0;i<n_states;i++){
            if(i == state){
                state_arr.push(1);
            }else{
                state_arr.push(0);
            }
        }
        let [h, h_relu, out, out_softmax] = this.policy_net.forward(state_arr); // 4
        // console.log(state_arr,out_softmax);
        // 采样动作，javascript没有np.random.choice，根据probs 概率采样，概率大的采样概率大
        let action = sampleAction(out_softmax);
        return [state_arr, h, h_relu, out, out_softmax,action];
    }
    update(rewards,agent_outputs){
        // let dW1,dW2 = this.policy_net.grad(states,actions,rewards,probs);
        // this.policy_net.backward(dW1,dW2,lr);
        rewards = discount_rewards(rewards,0.99);
        for(let i=0;i<rewards.length;i++){
            let reward = rewards[i]; // 1
            let [state_arr, h, h_relu, out, out_softmax,action] = agent_outputs[i]; // [h, h_relu, out, out_softmax,action]
            let rs =  [];
            for(let k=0;k<n_actions;k++){
                if(k == action){
                    rs.push(reward);
                }else{
                    rs.push(0);
                }
            }
            let dout = cross_entropy_derive(out_softmax,rs);
            // console.log(dout);
            // console.log(out_softmax);
            // console.log(rs);
            let [dW1,dW2] = this.policy_net.grad(state_arr,h,h_relu,out,out_softmax,dout);
            // console.log('dw1',dW1)
            // console.log('dw2',dW2)
            this.policy_net.backward(dW1,dW2,0.01);
        }
    }
}

let env = new CliffWalkEnv(2,4);
let agent = new Agent();

for(let epoch=0;epoch<1000;epoch++){
    let rewards = [];
    let agent_outputs = [];
    let state = env.reset();
    while(!env.done){
        let [state_arr, h, h_relu, out, out_softmax,action] = agent.get_action(state);
        let [next_state, reward, done] = env.step(action);
        rewards.push(reward);
        agent_outputs.push([state_arr, h, h_relu, out, out_softmax,action]);
        state = next_state;
    }
    agent.update(rewards,agent_outputs);
    console.log('rewards1111',env.totalReward);

}



