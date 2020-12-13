const fs = require('fs')
const contentFilePath = './content.json'

//salva os dados em um arquivo
function save(content){
    const contentString = JSON.stringify(content)
    return fs.writeFileSync(contentFilePath, contentString)
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
    load
}