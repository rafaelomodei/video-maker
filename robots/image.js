/* 
### Dependência
 $ npm i googleapis
*/

const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state.js')
const imageDownloader = require('image-downloader') //baixar as imagens e salvar
const gm = require('gm').subClass({imageMagick: true}) //para editar as imagens

const googleSearchCredentials = require('../credentials/google-search.json')


async function robot(){
    //carrega o estado de pesquisa anterio, e as tags gerada pelo watson
    const content = state.load()
   
    //Busca as imagens por cada tentença
    await fetchImagesOfAllSentences(content)

    // Faz o Download de todas as imagens encontradas
    await donwloadAllImages(content)

    //Ajusta as imagens para ficar tudo em um padrão
    await convertAllImages(content)

    //Cria os textos que vai aparecer em cada senteça
    await createAllSentencesImages(content)

    await createYouTubeThumbnail()
    
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

    //Faz o Download de todas as imagens que ele pegou 
    async function donwloadAllImages(content){
        content.downladedImages = [] //vai receber todas as images baixadas com sucesso
        
        for(let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex ++){
            const images = content.sentences[sentenceIndex].images

            for(let imageIndex = 0; imageIndex < images.length; imageIndex++){
                const imageUrl = images[imageIndex]
            

                try{
                    //Se a imagem que já foi baixada, tentar baixa de novo, da erro
                    if(content.downladedImages.includes(imageUrl)){
                        throw new Error('Imagem já foi baixada')
                    }

                    await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`)
                    content.downladedImages.push(imageUrl)
                    console.log(`> [${sentenceIndex}] [${imageIndex}] Baixou imagem com sucesso: ${imageUrl}`)
                    break
                }catch(error){
                    console.log(`> [${sentenceIndex}] [${imageIndex}] Erro ao baixar (${imageUrl}): ${error}`)
                }

            }
        }
    }


    //Faz os encapsulamento dos dados e salva
    async function downloadAndSave(url, fileName){
        return imageDownloader.image({
            url: url,
            dest: `./content/${fileName}`
        })
    }

    async function convertAllImages(content){
        for(let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++){
            await convertImage(sentenceIndex)
        }
    }

    async function convertImage(sentenceIndex){
        return new Promise((resolve, reject) =>{
            const inputFile = `./content/${sentenceIndex}-original.png[0]`//caso for um giff pegar a primeira imagem
            const outputFile = `./content/${sentenceIndex}-converted.png`
            const width = 1920
            const heigth = 1080

            gm()
                .in(inputFile)
                .out('(')
                    .out('-clone')
                    .out('0')
                    .out('-background', 'white')
                    .out('-blur', '0x9')
                    .out('-resize', `${width}x${heigth}^`)
                .out(')')
                .out('(')
                    .out('-clone')
                    .out('0')
                    .out('-background', 'white')
                    .out('-resize', `${width}x${heigth}`)
                .out(')')
                .out('-delete', '0')
                .out('-gravity', 'center')
                .out('-compose', 'over')
                .out('-composite')
                .out('-extent', `${width}x${heigth}`)
                .write(outputFile, (error) => {
                        if(error){
                            return reject(error)
                        }
                    console.log(`> Image converted: ${inputFile}`)
                    resolve()
                })

                
        })
    }

    async function createAllSentencesImages(content){
        for(let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++){
            await createSentenceImage(sentenceIndex, content.sentences[sentenceIndex].text)
        }
    }

    //Cria os textos para colocar em cada sentença
    async function createSentenceImage(sentenceIndex, sentenceText){
        return new Promise((resolve, reject) =>{
            const outputFile = `./content/${sentenceIndex}-sentence.png`

            //dicionario
            const templateSttings = {
                0: {
                    size: '1920x400',
                    gravity: 'center'
                },
                1: {
                    size: '1920x1080',
                    gravity: 'center'
                },
                2: {
                    size: '800x1080',
                    gravity: 'west'
                },
                3: {
                    size: '1920x400',
                    gravity: 'center'
                },
                4: {
                    size: '1920x400',
                    gravity: 'center'
                },
                5: {
                    size: '1920x800',
                    gravity: 'west'
                },
                6: {
                    size: '1920x400',
                    gravity: 'center'
                }
            }

            gm()
            .out('-size', templateSttings[sentenceIndex].size)
            .out('-gravity', templateSttings[sentenceIndex].gravity)
            .out('-background', 'transparent')
            .out('-fill', 'white')
            .out('-kerning', '-1')
            .out(`caption:${sentenceText}`)
            .write(outputFile, (error) => {
                if(error){
                    return reject(error)
                }
                console.log(`> Sentence converted: ${outputFile}`)
                resolve()
                
            })


        })
    }

    //Cria thumbnail 
    async function createYouTubeThumbnail(){
        return new Promise((resolve, reject) => {
            gm()
                .in('./content/0-converted.png') //peaga a primeira iamgem
                .write('./content/youtube-thumbnail.jpg', (error) =>{
                    if(error){
                        return reject(error)
                    }

                    console.log('> Create YouTube thumbnail')
                    resolve()
                })
        })
    }
    
}

module.exports = robot