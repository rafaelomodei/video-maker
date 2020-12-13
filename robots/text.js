//Esse arquvo é de dependencia geral, todos os robôs
//compartilham esse mesmo aruivo
//A ideia é fazer da forma mais simples possivel, tipo um sigleton

/*
### Dependencia
 $ npm i algorithmia
 $ npm i sbd
 $ npm install watson-developer-cloud
*/


const algorithmia = require('algorithmia')
const algorithimiaApiKey = require('../credencials/algorithimia.json').apiKey
const sentenceBoundaryDetection = require('sbd')
const watsonApiKey = require('../credencials/watson-nlu.json').apikey
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
 
var nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey,
    version: '2019-02-01',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
  })



//Função async pq tem que aguardar os dados serem buscados e retornados
async function robot(content){
    //Pesquisa na Wikipedia
    //Divide o texto em sentenças
    //Limpa o toda a pesquisa
    //Limite maximo desentenças
    //Recebe as sentenças
    await fetchContentFromWikiPedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)
    limitMaximunSenteces(content)
    await fetchKeywordsOfAllSentences(content)

    async function fetchContentFromWikiPedia(content){
        const algorithmiaAuthenticated = algorithmia(algorithimiaApiKey)
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2")
        const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm)
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


    //Limita a quantidade de sentenças
    function limitMaximunSenteces(content){
        //Pega da posição 0 até a sentença maxima
        content.sentences = content.sentences.slice(0, content.maximunSentences)
    }

    //Pegar as Keywords passada pelo watson
    async function fetchKeywordsOfAllSentences(content){
        for(const sentence of content.sentences){
            //Passa o texto das sentenças para o watson e ele retorna as sentenças
            sentence.keywords = await fetcWatsonAndReturnKeywords(sentence.text)
        }
    }

    //Retorna as tags que vai ser usado para pesquisar no google img
    //Aqui estamos retornando apenas as Keywords, mas é possivel retornar muito mais
    //Watson <3
    async function fetcWatsonAndReturnKeywords(sentence){
    return new Promise((resolve, reject) =>{
     nlu.analyze({
         text: sentence,
         features:{
             keywords: {}
         }
     }, (error, response) =>{
         if(error){
             throw error
         }
         const keywords = response.keywords.map((keywords) =>{
             return keywords.text
         })
 
         resolve(keywords)
 
     })
    })
    
     
 }

}

module.exports = robot