const gm = require('gm').subClass({imageMagick: true}) //para editar as imagens
const state = require('./state.js')


async function robot(){

    //carrega o estado de pesquisa anterio, e as tags gerada pelo watson
    const content = state.load()

    //Ajusta as imagens para ficar tudo em um padrão
    await convertAllImages(content)

    //Cria os textos que vai aparecer em cada senteça
    await createAllSentencesImages(content)

    await createYouTubeThumbnail()

    state.save(content)

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