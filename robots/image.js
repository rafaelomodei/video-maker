/* 
### Dependência
 $ npm i googleapis
*/

const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state.js')

const googleSearchCredentials = require('../credentials/google-search.json')


async function robot(){
    //carrega o estado de pesquisa anterio, e as tags gerada pelo watson
    const content = state.load()
    
    await fetchImagesOfAllSentences(content)

    state.save(content)

    //Faz uma busca no google images
    async function fetchImagesOfAllSentences(content){
        for(const sentence of content.sentences){
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            sentence.images = await fetchGoogleAndReturnImagesLinks(query)

            sentence.googleSearchQuery = query
        }
    }

    //Faz uma pesquisa e retorna os links das imagens
    async function fetchGoogleAndReturnImagesLinks(query){
        const response = await customSearch.cse.list({
            auth: googleSearchCredentials.apiKey,
            cx: googleSearchCredentials.searchEngineId,
            q: query,
            searchType: 'image', //define que quero somente iamge
            num: 2
        })

        //Percorre os dados da pesquisa, vai até items faz um map e extrai dele somentes
        //os liks
        const imageUrl = response.data.items.map((item) =>{
            return item.link
        })

        return imageUrl
    }
    
    

    
}

module.exports = robot