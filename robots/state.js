const fs = require('fs')
const contentFilePath = './content.json'
const scriptFilePath = './content/after-effectts-script.js'

//salva os dados baixados em um arquivo
function save(content){
    const contentString = JSON.stringify(content)
    return fs.writeFileSync(contentFilePath, contentString)
}

//salva os script em js
function saveScript(content){
    const contentString = JSON.stringify(content)
    const scriptString = `var content = ${contentString}` // uma variavel var, recebe todo o script
    return fs.writeFileSync(scriptFilePath, scriptString)
}

//Carrega os dados que estava salvo no arquivo
function load(){
    //Lê o arquivo e transforma de volta em um objeto js
    const fileBuffer = fs.readFileSync(contentFilePath, 'utf-8')
    const contentJson = JSON.parse(fileBuffer)
    return contentJson
}

module.exports = {
    save,
    saveScript,
    load
}