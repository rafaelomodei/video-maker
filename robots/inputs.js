const readline = require('readline-sync')
const state = require('./state.js')

function robot(){
    //conteúdo
    const content = {
        //define o maximo de senteças
        maximunSentences: 7
    }

    //Termo de busca
    //Prefixo - para ficar mais humanamente legivel
    //Robô state salva os dados
    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    state.save(content)

    //Recebe o termo da busca
    function askAndReturnSearchTerm(){
        return readline.question('Type a Wikipedia search term: ')
    }

    //Retorna uma lista de opção
    function askAndReturnPrefix(){
        //Opções de busca, o que eu quero procurar na net ?
        //Faz a leitura da tecla precionada
        //Pega o prefixes de acordo com o index
        const prefixes = ['Who is', 'What is', 'The history of']
        const selectedPrefixIndex = readline.keyInSelect(prefixes)
        const selectedPrefixText = prefixes[selectedPrefixIndex]

        return selectedPrefixText
    }
}

module.exports = robot