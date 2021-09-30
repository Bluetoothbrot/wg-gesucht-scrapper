require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio')
const franc = require('franc')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({ rooms: []})
  .write()

const headers = {
  'content-type': 'application/json',
  'User-Agent': 'Chrome/64.0.3282.186 Safari/537.36',
}

function scrapper() {
  this.crawl = function() {
    console.log('+++ Getting new Inserate +++')
    axios({
        method: 'get',
        url: process.env.FILTER_URL,
        headers: headers
      })
      .then(function (response) {

        let $ = cheerio.load(response.data)

        const ids = []
        var res = response.data
        while(res.search("data-ad_id=")!=-1){

          //let res = "data-ad_id=\"8954403\" bla bla bla data-ad_id=\"1112233\" ja ja ja"//response.data
          // data-ad_id="8954403"
          let index = res.search("data-ad_id=")
          let adId = res.substring(index+12,index+12+7);
          data = {'id': adId, 'sent': 0 }

            db.get('rooms')
                .push(data)
                .write()



          console.log("+++ AdId: " + adId);
          res = res.substring(index+12,res.length)
        }


        //not working
        $(".panel.panel-default").each(function(i, elem) {
            id = $(this).data('id')
            if(id) {
                let room = db.get('rooms')
                    .find({ id: id })
                    .value()
                if(room) {
                    return
                }
                description = $(this).find('.headline.headline-list-view.noprint.truncate_title a.detailansicht').text().trim()

                data = {
                    'id': id,
                    'price': $(this).find('.detail-size-price-wrapper a.detailansicht').text().split('|')[1].split(' ')[1],
                    'url': process.env.BASE_URL + $(this).find('.detail-size-price-wrapper a.detailansicht').attr('href'),
                    'description': description,
                    'lang': franc(description, {only: ['eng', 'deu']}),
                    'sent': 0
                }
              //  db.get('rooms')
                //    .push(data)
                  //  .write()
                //console.log('Room with id: ' + data.id + ' added')
            }
        })
        console.log('+++ Finished checking new Inserate +++')
      })
      .catch(function (error) {
        console.log(error);
    });
   }
}
module.exports = scrapper;
