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
   
   //await fetchImagesOfAllSentences(content)
    // Faz o Download de todas as imagens encontradas
    await donwloadAllImages(content)
    //state.save(content)

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

    //Faz o Download de todas as imagens que ele pegou 
    async function donwloadAllImages(content){
        content.downladedImages = [] //vai receber todas as images baixadas com sucesso
        
        content.sentences[1].images[0] = 'https://cdn.nybooks.com/wp-content/uploads/2018/08/jackson-wiley.jpg'
        for(let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex ++){
            const images = content.sentences[sentenceIndex].images

            for(let imageIndex = 0; imageIndex < images.length; imageIndex++){
                const imageUrl = images[imageIndex]
            

                try{
                    //Se a imagem que já foi baixada, tentar baixa de novo, da erro
                    if(content.downladedImages.includes(imageUrl)){
                        throw new Error('Imagem já foi baixada')
                    }

                    //await downloadImage()
                    content.downladedImages.push(imageUrl)
                    console.log(`> [${sentenceIndex}] [${imageIndex}] Baixou imagem com sucesso: ${imageUrl}`)
                    break
                }catch(error){
                    console.log(`> [${sentenceIndex}] [${imageIndex}] Erro ao baixar (${imageUrl}): ${error}`)
                }

            }
        }
    }


    
    

    
}

module.exports = robot