//Esse arquvo é de dependencia geral, todos os robôs
//compartilham esse mesmo aruivo
//A ideia é fazer da forma mais simples possivel, tipo um sigleton

/*
### Dependencia
 $ npm i algorithmia
 $ npm i sbd
*/


const algorithmia = require('algorithmia')
const algorithimiaApiKey = require('../credencials/algorithimia.json').apiKey
const sentenceBoundaryDetection = require('sbd')
//Função async pq tem que aguardar os dados serem buscados e retornados
async function robot(content){
    await fetchContentFromWikiPedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)

    async function fetchContentFromWikiPedia(conten){
        const algorithmiaAuthenticated = algorithmia(algorithimiaApiKey)
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2")
        const wikipediaResponde = await wikipediaAlgorithm.pipe(conten.searchTerm)
        const wikipediaContent = wikipediaResponde.get()

        content.sourceContentOriginal = wikipediaContent.content
    }


    //Formata o texto recebido
    function sanitizeContent(content){
        //Remove linhas em branco / marcações
        //Remove Datas
        //Separa por sentenças
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDateInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)
        content.sourceContentSanitized = withoutDateInParentheses

        //Remove todas as quebras de linhas
        //Remove todas as linhas em branco
        function removeBlankLinesAndMarkdown(text){
            const allLines = text.split('\n')
            const withoutBlankLinesAndMarkdown = allLines.filter((line)=>{
                if(line.trim().length === 0 || line.trim().startsWith('=')){
                    return false
                }
                return true
            })
            return withoutBlankLinesAndMarkdown.join(' ')
            
        }

    }

    //Remove todas as datas e uns espaços estranhos
    function removeDatesInParentheses(text){
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
    }

    //Separa o texto por sentenças e para isso usa a 'Sentence Boundary Detection'
    function breakContentIntoSentences(content){
        content.sentences = []

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach((sentence) =>{
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }

}

module.exports = robot