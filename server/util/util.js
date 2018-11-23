import axios from 'axios'
import dateFormat from 'dateformat'
import autoBind from 'auto-bind'
import serverConfig from '../src/config'
import { hsetAsync } from '../src/redis'


class Util {
  constructor() {
    autoBind(this)
  }
  errMsg(err, msg) {
    if (err) {
      this.printMsgV1('error happened!')
      this.printMsgV1(`error msg = ${msg}`)
      this.printMsgV1('---------------')
      console.log(err)                          // eslint-disable-line
      this.printMsgV1('error over!')
    }
  }

  getMusicStyleUrl(musicStyle, pageIndex) {
    let offset = 0
    if (pageIndex > 1) {
      offset = (pageIndex - 1) * 35   // 每一页35条数据
    }
    const url = serverConfig.URL.URL_MUSIC_STYLE.concat(musicStyle).concat(`&limit=35&offset=${offset}`)
    return encodeURI(url)
  }

  getPlaylistUrl(playlistPostfix) {
    return encodeURI(serverConfig.URL.URL_ROOT_LIST.concat(playlistPostfix.trim()))
  }

  getMusicCommentUrl(id) {
    return serverConfig.URL.URL_COMMENT_V2.concat(id)
  }

  getArtistTypeUrl(artistTypePostfixUrl) {
    return serverConfig.URL.URL_ARTIST.concat(artistTypePostfixUrl)
  }

  getAlbumListUrl(artistId, pageIndex) {
    let offset = 0
    if (pageIndex > 1) {
      offset = (pageIndex - 1) * 12   // 每一页12条数据
    }
    return serverConfig.URL.URL_ALBUM_LIST.concat(`?id=${artistId}&limit=12&offset=${offset}`)
  }

  getAlbumUrl(albumId) {
    return serverConfig.URL.URL_ALBUM.concat(albumId)
  }

  getHtmlSourceCodeWithGetMethod(url) {
    delete process.env.http_proxy;
    delete process.env.HTTP_PROXY;
    delete process.env.https_proxy;
    delete process.env.HTTPS_PROXY;
    serverConfig.options.url = url
    return axios(serverConfig.options).then((response) => {
      return response.data
    }, (err) => {
      return this.errMsg(err)
    })
  }

  getNumberStringFromString(rawStr) {
    return rawStr.replace(/[^0-9]/g, '')
  }

  printMsgV1(msg) {
    const m = '------------------------'
    console.log(this.getNowTimeForDisplay().concat(`${m}${msg.padEnd(65)}${m}`))           // eslint-disable-line
  }
  printMsgV2(msg) {
    console.log(this.getNowTimeForDisplay().concat('   '.concat(msg)))           // eslint-disable-line
  }

  getNowTimeForDisplay() {
    const now = new Date();
    const time = dateFormat(now, 'isoDateTime');
    return time.slice(0, 19)
  }

  ifShouldUpdateData(date) {
    if (new Date().getTime() - date < serverConfig.updateDbInterval) {
      return false
    }
    return true
  }

  updateDataDateInfo(name) {
    hsetAsync('data_date_info_hash', name, new Date().getTime())
  }

  millisToMinutesAndSeconds(millis) {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

}

export default new Util()
