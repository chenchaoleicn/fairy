import cheerio from 'cheerio'
import async from 'async'
import autoBind from 'auto-bind'
import bluebird from 'bluebird'
import serverConfig from '../config'
import util from '../../util/util'
import redisWrapper, { hgetAsync, smembersAsync, hgetallAsync } from '../redis'


class AlbumList {
  constructor() {
    autoBind(this)
  }

  async getAlbumListForArtist(artist, index, total, outerCallback) {
    let url = util.getAlbumListUrl(artist.id, 0)
    const response = await util.getHtmlSourceCodeWithGetMethod(url)
    let $ = cheerio.load(response, { decodeEntities: false })
    const aSize = $('div[class=u-page]').find('a').length
    let maxPageIndex = 1
    $('div[class=u-page]').find('a').each(function (i, elem) {
      if (i === aSize - 2) {
        maxPageIndex = Number($(this).html())
      }
    });
    maxPageIndex = serverConfig.maxPageIndexForAlbum <= 0 ? maxPageIndex : serverConfig.maxPageIndexForAlbum
    const tasks = []
    for (let pageIndex = 1; pageIndex <= maxPageIndex; pageIndex++) {
      const f = async (callback) => {                                            // eslint-disable-line
        url = util.getAlbumListUrl(artist.id, pageIndex)
        const b = await util.getHtmlSourceCodeWithGetMethod(url)
        const promiseTasks = []
        $ = cheerio.load(b, { decodeEntities: false })
        $('#m-song-module').find('li').each(function (i, elem) {
          $ = cheerio.load(this, { decodeEntities: false })
          const albumId = util.getNumberStringFromString($('.tit').attr('href'))
          const albumRegistration = {}
          albumRegistration.id = albumId
          albumRegistration.name = $('.tit').html()
          albumRegistration.artistId = artist.id
          albumRegistration.artistName = artist.name
          promiseTasks.push(
            redisWrapper.storeInRedis('album_registration_set', `alist-${albumId}`, albumRegistration)
          )
          util.beautifulPrintMsgV2('获取专辑条目', `外部遍历序号: ${index}`, `总数: ${total}`, `${albumRegistration.name}`)
        });
        // 如果网易启用了反爬虫机制，那么就抓取不到数据了。相应的歌手的专辑应该再其他时间段继续抓取
        if (promiseTasks.length) {
          await bluebird.Promise.all(promiseTasks)
          callback()
        } else {
          if (b.includes('暂无专辑')) {
            callback()
          }
        }
      }
      tasks.push(f)
    }
    async.parallel(tasks, (err) => {
      if (err) {
        util.errMsg(err)
        return
      }
      outerCallback()
    })
  }

  async callGetAlbumListForAllArtist(outerCallback) {
    const tasks = []

    const allArtistRegistrationKeys = await smembersAsync('artist_registration_set')
    for (let i = 0; i < allArtistRegistrationKeys.length; i++) {
      const artistInfo = await hgetallAsync(allArtistRegistrationKeys[i])
      const dataDateItemName = `album-list-${artistInfo.id}`
      const lastUpdateDate = await hgetAsync('data_date_info_hash', dataDateItemName)
      const shouldUpdate = util.ifShouldUpdateData(lastUpdateDate)
      if (!shouldUpdate) {
        continue
      }
      const f = (callback) => {
        const index = i + 1
        this.getAlbumListForArtist(artistInfo, index, allArtistRegistrationKeys.length, () => {
          util.updateDataDateInfo(dataDateItemName)
          callback()
        })
      }
      tasks.push(f)
    }
    util.beautifulPrintMsgV1('..........开始 针对每一个歌手获取他/她的所有专辑条目!..........')
    async.parallelLimit(tasks, serverConfig.maxConcurrentNumOfSingerForGetAlbum, (err) => {
      if (err) {
        util.errMsg(err)
      }
      util.beautifulPrintMsgV1('..........完成 针对每一个歌手获取他/她的所有专辑条目!..........\n')
      outerCallback()
    })
  }
}

export default new AlbumList()
