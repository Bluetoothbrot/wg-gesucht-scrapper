var scrapper = require('./scrapper.js');
var autoreserve = require('./autoreserve.js');


let scrapperInstance = new scrapper();
let autoreserveInstance = new autoreserve();

let messageTemplates = {}
let headers = {}


console.log('STARTING WG-GESUCHT AUTOMAT v2')
console.log('***************************')
setInterval(()=> scrapperInstance.crawl(), 5*60*1000);

(async () => {
    try {
        let loginCookie = await autoreserveInstance.login()

        headers = {
            'content-type': 'application/json',
            'User-Agent': 'Chrome/64.0.3282.186 Safari/537.36',
            'cookie': loginCookie
        }

        console.log("Headers:");
        console.log(headers);

        let messageEng = await autoreserveInstance.getMessage(process.env.MESSAGE_ENG, headers)
        let messageGer = await autoreserveInstance.getMessage(process.env.MESSAGE_GER, headers)

        messageTemplates = {
            'eng' : messageEng,
            'ger' : messageGer
        }


    } catch (e) {
        console.log(e)
    }
})();


setInterval(()=> autoreserveInstance.processAndReserve(headers, messageTemplates), 10*1000);
