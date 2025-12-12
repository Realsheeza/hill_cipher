function mod26(n) {
    return ((n % 26) + 26) % 26;
}

// Multiply 3x3 matrix with 3x1 vector modulo 26
function multiplyMatrixVector(matrix, vector) {
    return matrix.map(row =>
        mod26(row.reduce((sum, val, j) => mod26(sum + val * vector[j]), 0))
    );
}

// Determinant of 3x3 matrix modulo 26
function determinant(m) {
    return mod26(
        m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1]) -
        m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0]) +
        m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0])
    );
}

// Modular inverse of a modulo m
function modInverse(a, m) {
    a = mod26(a);
    for(let x=1; x<m; x++) if(mod26(a*x)===1) return x;
    throw "No modular inverse exists";
}

// Adjugate matrix modulo 26
function adjugate(m) {
    return [
        [
            mod26(m[1][1]*m[2][2]-m[1][2]*m[2][1]),
            mod26(-(m[0][1]*m[2][2]-m[0][2]*m[2][1])),
            mod26(m[0][1]*m[1][2]-m[0][2]*m[1][1])
        ],
        [
            mod26(-(m[1][0]*m[2][2]-m[1][2]*m[2][0])),
            mod26(m[0][0]*m[2][2]-m[0][2]*m[2][0]),
            mod26(-(m[0][0]*m[1][2]-m[0][2]*m[1][0]))
        ],
        [
            mod26(m[1][0]*m[2][1]-m[1][1]*m[2][0]),
            mod26(-(m[0][0]*m[2][1]-m[0][1]*m[2][0])),
            mod26(m[0][0]*m[1][1]-m[0][1]*m[1][0])
        ]
    ];
}

// Inverse of 3x3 matrix modulo 26
function inverseMatrix(m) {
    let det = determinant(m);
    let invDet;
    try {
        invDet = modInverse(det, 26);
    } catch(e) {
        throw "Key not invertible!";
    }

    let adj = adjugate(m);
    let inv = [];
    for(let i=0;i<3;i++){
        inv[i] = [];
        for(let j=0;j<3;j++){
            inv[i][j] = mod26(adj[i][j] * invDet);
        }
    }
    return inv;
}

// Get key matrix from input
function getKeyMatrix() {
    let keyInput = document.getElementById('key').value.split(',').map(Number);
    if(keyInput.length !== 9){ 
        alert("Enter exactly 9 numbers for the key."); 
        return null; 
    }
    return [
        keyInput.slice(0,3),
        keyInput.slice(3,6),
        keyInput.slice(6,9)
    ];
}

// Encrypt plaintext → ciphertext
function encryptText(){
    let pt = document.getElementById('plaintext').value.toUpperCase().replace(/[^A-Z]/g,'');
    let key = getKeyMatrix();
    if(!key) return;

    // Pad plaintext to multiple of 3
    while(pt.length % 3 !== 0) pt += 'X';

    let ct = '';
    for(let i=0;i<pt.length;i+=3){
        let vec = [pt.charCodeAt(i)-65, pt.charCodeAt(i+1)-65, pt.charCodeAt(i+2)-65];
        multiplyMatrixVector(key, vec).forEach(n => ct += String.fromCharCode(n+65));
    }

    document.getElementById('ciphertext').value = ct;
}

// Decrypt ciphertext → plaintext
function decryptText(){
    let ct = document.getElementById('ciphertext').value.toUpperCase().replace(/[^A-Z]/g,'');
    if(ct.length === 0){ alert("Enter ciphertext to decrypt!"); return; }

    let key = getKeyMatrix();
    if(!key) return;

    let keyInv;
    try{
        keyInv = inverseMatrix(key);
    } catch(e){
        alert("Key not invertible! Choose another key.");
        return;
    }

    let pt = '';
    for(let i=0;i<ct.length;i+=3){
        let vec = [ct.charCodeAt(i)-65, ct.charCodeAt(i+1)-65, ct.charCodeAt(i+2)-65];
        multiplyMatrixVector(keyInv, vec).forEach(n => pt += String.fromCharCode(n+65));
    }

    document.getElementById('plaintext').value = pt;
}
