

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


function discount_rewards(rewards,gamma){
    let res = [];
    let adding = 0;
    for(let i=rewards.length-1;i>=0;i--){
        adding = rewards[i] + gamma * adding;
        res.push(adding);
    }
    return res.reverse();
}


class Agent{
    constructor(){
        this.policy_net = new Network2(48, 200, 4);
    }
    get_action(state){
        let state_arr = [];
        for(let i=0;i<48;i++){
            if(i == state){
                state_arr.push(1);
            }else{
                state_arr.push(0);
            }
        }
        let [h, h_relu, out, out_softmax] = this.policy_net.forward(state_arr); // 4
        // 采样动作，javascript没有np.random.choice，根据probs 概率采样，概率大的采样概率大
        let action = sampleAction(out_softmax);
        return [h, h_relu, out, out_softmax,action];
    }
    update(rewards,agent_outputs){
        // let dW1,dW2 = this.policy_net.grad(states,actions,rewards,probs);
        // this.policy_net.backward(dW1,dW2,lr);
        rewards = discount_rewards(rewards,0.99);
        for(let i=0;i<rewards.length;i++){
            let reward = rewards[i]; // 1
            let [h, h_relu, out, out_softmax,action] = agent_outputs[i]; // [h, h_relu, out, out_softmax,action]
            let rs =  [];
            for(let k=0;k<4;k++){
                if(k == action){
                    rs.push(reward);
                }else{
                    rs.push(0);
                }
            }
            let dout = cross_entropy_derive(out_softmax,rs);
            let dW1,dW2 = this.policy_net.grad(x,h,h_relu,out,out_softmax,dout);
            this.policy_net.backward(dW1,dW2,lr);
        }
    }
}

let env = new CliffWalkEnv();
let agent = new Agent();

for(let epoch=0;epoch<1000;epoch++){
    let done = false;
    let rewards = [];
    let agent_outputs = [];
    let state = env.reset();
    while(!done){
        let [h, h_relu, out, out_softmax,action] = agent.get_action(state);
        let [next_state, reward, done] = env.step(action);
        rewards.push(reward);
        agent_outputs.push([h, h_relu, out, out_softmax,action]);
        state = next_state;
    }
    agent.update(rewards,agent_outputs);
}



