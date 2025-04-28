function multiply(W, x) {
    // W is a matrix of weights
    // x is a vector of inputs
    // return a vector of outputs
    let res = [];
    for (let i = 0; i < W.length; i++) {
        let sum = 0;
        for(let j = 0; j < x.length; j++){
            sum += W[i][j] * x[j];
        }
        res.push(sum);
    }
    return res;
}

function multiply_derive(W, x, dout) {
    // W is a matrix of weights
    // x is a vector of inputs
    // dout is a vector of derivatives of the output
    // return a vector of derivatives of the input and a matrix of derivatives of weights
    let dx = new Array(x.length).fill(0);  // 修改为一维数组
    let dW = [];
    
    // 计算dx (一维数组)
    for (let i = 0; i < x.length; i++) {
        for (let j = 0; j < W.length; j++) {
            dx[i] += W[j][i] * dout[j];
        }
    }
    
    // 计算dW (二维数组)
    for (let i = 0; i < W.length; i++) {
        let dWi = [];
        for (let j = 0; j < x.length; j++) {
            dWi.push(x[j] * dout[i]);
        }
        dW.push(dWi);
    }
    
    return [dx, dW];
}


function relu(x){
    // x is a vector of inputs
    let res = [];
    for(let i = 0; i < x.length; i++){
        res.push(Math.max(0, x[i]));
    }
    return res;
}

function relu_derive(x,dout){
    let res = [];
    for(let i = 0; i < x.length; i++){
        res.push(x[i] > 0 ? dout[i] : 0);
    }
    return res;
}

function softmax(x){
    let res = [];
    let _max = Math.max(...x);
    for(let i = 0; i < x.length; i++){
        res.push(Math.exp(x[i] - _max));
    }
    let _sum = res.reduce((a, b) => a + b, 0);
    for(let i = 0; i < res.length; i++){
        res[i] = res[i] / _sum;
    }
    return res;
}

function softmax_derive(x,out,dout){
    let res = [];
    for(let i = 0; i < x.length; i++){
        let _sum = 0;
        for(let j = 0; j < x.length; j++){
            _sum += dout[j] * (i == j ? 1 - out[i] : -out[i] * out[j]);
        }
        res.push(_sum);
    }
    return res;
}

function update_weights(W,dW,lr){
    for(let i = 0; i < W.length; i++){
        for(let j = 0; j < W[i].length; j++){
            W[i][j] -= lr * dW[i][j];
        }
    }
    return W;
}

// 添加形状检查函数
function assert_shape(arr, expected_shape, name) {
    if (!Array.isArray(arr)) {
        console.error(`${name} is not an array`);
        return false;
    }
    
    if (expected_shape.length === 1) {
        if (arr.length !== expected_shape[0]) {
            console.error(`${name} shape mismatch: expected [${expected_shape}], got [${arr.length}]`);
            return false;
        }
    } else if (expected_shape.length === 2) {
        if (arr.length !== expected_shape[0]) {
            console.error(`${name} shape mismatch: expected [${expected_shape}], got [${arr.length}, ?]`);
            return false;
        }
        for (let i = 0; i < arr.length; i++) {
            if (!Array.isArray(arr[i]) || arr[i].length !== expected_shape[1]) {
                console.error(`${name} shape mismatch at row ${i}: expected [${expected_shape}], got [${arr.length}, ${Array.isArray(arr[i]) ? arr[i].length : '?'}]`);
                return false;
            }
        }
    }
    
    console.log(`${name} shape check passed: [${expected_shape}]`);
    return true;
}

class Network{
    constructor(input_size, hidden_size, output_size){
        this.input_size = input_size;
        this.hidden_size = hidden_size;
        this.output_size = output_size;
        this.W1 = this.init_weights(input_size, hidden_size);
        this.W2 = this.init_weights(hidden_size, output_size);
        
        // 检查权重矩阵形状
        assert_shape(this.W1, [hidden_size, input_size], "W1");
        assert_shape(this.W2, [output_size, hidden_size], "W2");
    }

    init_weights(m,n){
        let W = [];
        for(let i = 0; i < n; i++){
            let row = [];
            for(let j = 0; j < m; j++){
                row.push(Math.random() - 0.5);
            }
            W.push(row);
        }
        return W;
    }
    forward(x){
        // 检查输入形状
        assert_shape(x, [this.input_size], "input x");
        
        let h = multiply(this.W1, x);
        // 检查h形状
        assert_shape(h, [this.hidden_size], "h");
        
        let h_relu = relu(h);
        // 检查h_relu形状
        assert_shape(h_relu, [this.hidden_size], "h_relu");
        
        let out = multiply(this.W2, h_relu);
        // 检查out形状
        assert_shape(out, [this.output_size], "out");
        
        let out_softmax = softmax(out);
        // 检查out_softmax形状
        assert_shape(out_softmax, [this.output_size], "out_softmax");
        
        return [h, h_relu, out, out_softmax];
    }
    grad(x,h,h_relu,out,out_softmax,dout){
        // 检查各个输入形状
        assert_shape(x, [this.input_size], "grad input x");
        assert_shape(h, [this.hidden_size], "grad h");
        assert_shape(h_relu, [this.hidden_size], "grad h_relu");
        assert_shape(out, [this.output_size], "grad out");
        assert_shape(out_softmax, [this.output_size], "grad out_softmax");
        assert_shape(dout, [this.output_size], "grad dout");
        
        let softmax_dout = softmax_derive(out,out_softmax,dout);
        // 检查softmax_dout形状
        assert_shape(softmax_dout, [this.output_size], "softmax_dout");
        
        let [dh,dW2] = multiply_derive(this.W2,h_relu,softmax_dout);
        // 检查dh和dW2形状
        assert_shape(dh, [this.hidden_size], "dh");
        assert_shape(dW2, [this.output_size, this.hidden_size], "dW2");
        
        let [dx,dW1] = multiply_derive(this.W1,x,dh);
        // 检查dx和dW1形状
        assert_shape(dx, [this.input_size], "dx");
        assert_shape(dW1, [this.hidden_size, this.input_size], "dW1");
        
        return [dW1,dW2];
    }

    backward(dW1,dW2, lr){
        this.W1 = update_weights(this.W1,dW1,lr);
        this.W2 = update_weights(this.W2,dW2,lr);
    }
}

function test_network(){
    let net = new Network(3, 4, 3);
    console.log("Network initialized with input_size=3, hidden_size=4, output_size=3");
    
    console.log("W1 shape should be [4, 3]:");
    assert_shape(net.W1, [4, 3], "W1");
    
    console.log("W2 shape should be [3, 4]:");
    assert_shape(net.W2, [3, 4], "W2");
    
    let x = [1, 2, 3];
    console.log("Input x shape should be [3]:");
    assert_shape(x, [3], "x");
    
    let [h, h_relu, out, out_softmax] = net.forward(x);
    
    console.log("h shape should be [4]:");
    assert_shape(h, [4], "h");
    
    console.log("h_relu shape should be [4]:");
    assert_shape(h_relu, [4], "h_relu");
    
    console.log("out shape should be [3]:");
    assert_shape(out, [3], "out");
    
    console.log("out_softmax shape should be [3]:");
    assert_shape(out_softmax, [3], "out_softmax");
    
    let dout = [1, 2, 3];
    console.log("dout shape should be [3]:");
    assert_shape(dout, [3], "dout");
    
    let [dW1, dW2] = net.grad(x, h, h_relu, out, out_softmax, dout);
    
    console.log("dW1 shape should be [4, 3]:");
    assert_shape(dW1, [4, 3], "dW1");
    
    console.log("dW2 shape should be [3, 4]:");
    assert_shape(dW2, [3, 4], "dW2");
    
    net.backward(dW1, dW2, 0.01);
    console.log("After backward pass:");
    
    console.log("W1 shape should be [4, 3]:");
    assert_shape(net.W1, [4, 3], "W1 after update");
    
    console.log("W2 shape should be [3, 4]:");
    assert_shape(net.W2, [3, 4], "W2 after update");
    console.log(net.W1);
    console.log(net.W2);
}


function test_multiply() {
    let W = [[1, 2], [3, 4]];
    let x = [1, 2];
    let res = multiply(W, x);
    console.log(res);
}

function test_multiply_derive() {
    let W = [[1, 2, 3], [3, 4, 3]];
    let x = [1, 2 , 3];
    let dout = [1, 2,3];
    let [dx, dW] = multiply_derive(W, x, dout);
    console.log(dx);
    console.log(dW);
}

function test_relu(){
    let x = [-1, 0, 1];
    let res = relu(x);
    console.log(res);
}

function test_relu_derive(){
    let x = [-1, 0, 1];
    let dout = [1, 2, 3];
    let res = relu_derive(x, dout);
    console.log(res);
}

function test_softmax(){
    let x = [-1, 0, 1];
    let res = softmax(x);
    console.log(res);
}

function test_softmax_derive(){
    let x = [-1, 0, 1];
    let out = softmax(x);
    let dout = [1, 2, 3];
    let res = softmax_derive(x, out, dout);
    console.log(res);
}