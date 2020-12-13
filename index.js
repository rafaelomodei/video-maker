/* 
### Instalar Dependência
 $ npm install readline-sync
*/

const state = require('./robots/state.js')

const robots = {
    //userInput: require('./robots/user-input.js'),
    input: require('./robots/inputs.js'),
    text: require('./robots/text.js'),
    state: require('./robots/state.js')
}

async function start(){

    //Robôs
    robots.input()
    await robots.text()
    
    const content = robots.state.load()
    //imprime que nem o log porem de uma forma mais bonita
    //usando o dir com depth: null
    console.dir(content, {depth: null})
}

start()