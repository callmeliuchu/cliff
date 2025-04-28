

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

function multiply_derive(W,x,dout) {
    // W is a matrix of weights
    // x is a vector of inputs
    // dout is a vector of derivatives of the output
    // return a matrix of derivatives of the input
    let dx = [];
    let dW = [];
    for (let i = 0; i < x.length; i++) {
        let dxi = [];
        for(let j = 0; j < W.length; j++){
            dxi.push(W[j][i] * dout[j]);
        }
        dx.push(dxi);
    }
    for (let i = 0; i < W.length; i++) {
        let dWi = [];
        for(let j = 0; j < x.length; j++){
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