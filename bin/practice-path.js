
const path = require('path')

console.log(path.join(__dirname));  // apunta al directorio donde se encuentra este archivo
console.log(path.join(process.cwd())); // apunta al directorio donde se ejecuta node