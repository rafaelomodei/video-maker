/* 
### Instalar Dependência
 $ npm install readline-sync
*/


const readline = require('readline-sync')
const robots = {
    //userInput: require('./robots/user-input.js'),
    text: require('./robots/text.js')
}

async function start(){
    //contúdo
    const content = {}

    //Termo de busca
    //Prefixo - para ficar mais humanamente legivel
    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()

    //Robôs
    //robots.userInput(content)
    await robots.text(content)

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
    
    console.log(content)
}

start()