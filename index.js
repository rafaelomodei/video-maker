/* 
### Instalar Dependência
 $ npm i readline-sync
 $ npm i algorithmia
 $ npm i sbd
 $ npm i watson-developer-cloud
 $ npm i googleapis
*/


const state = require('./robots/state.js')

const robots = {
    //userInput: require('./robots/user-input.js'),
    input: require('./robots/input.js'),
    text: require('./robots/text.js'),
    state: require('./robots/state.js'),
    image: require('./robots/image.js')
}

async function start(){

   // Robôs
    robots.input()
    await robots.text()
    await robots.image()
    
    const content = robots.state.load()
    //imprime que nem o log porem de uma forma mais bonita
    //usando o dir com depth: null
    console.dir(content, {depth: null})
}

start()