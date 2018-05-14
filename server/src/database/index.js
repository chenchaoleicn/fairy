import schemaDef from './schema'
import autoBind from 'auto-bind'
import util from '../../util/util'


/**
 * 注意：把需要加载进内存的表数据的方法添加进loadAllDataToMem开头的数组里
 */
class Database {
  constructor() {
    autoBind(this)
  }
  // --------------------------------------------
  // playlistInfo
  upsertPlaylistInfo(data) {
    schemaDef.playlistInfo.findOneAndUpdate({ playlist: data.playlist }, data, { upsert: true }, (err) => {
      if (err) {
        util.errMsg(err)
      }
    })
  }

  getAllPlaylistInfos(callback) {
    schemaDef.playlistInfo.find({}, (err, res) => {
      if (err) {
        util.errMsg(err)
        return
      }
      callback(res)
    })
  }
  // --------------------------------------------
  // playlistProperty
  upsertPlaylistProperty(data) {
    schemaDef.playlistProperty.findOneAndUpdate({ playlist: data.playlist }, data, { upsert: true }, (err) => {
      if (err) {
        util.errMsg(err)
      }
    })
  }

  getPlaylistPropertyByPlaylist(playlist, callback) {
    schemaDef.playlistProperty.findOne({ playlist }, (err, res) => {
      if (err) {
        util.errMsg(err)
        return
      }
      callback(res)
    })
  }
  getAllPlaylistProperty(callback) {
    schemaDef.playlistProperty.find({}, (err, res) => {
      if (err) {
        util.errMsg(err)
        return
      }
      callback(res)
    })
  }
  // --------------------------------------------
  // musicRegistration
  upsertMusicRegistration(data) {
    schemaDef.musicRegistration.findOneAndUpdate({ id: data.id }, data, { upsert: true }, (err) => {
      if (err) {
        util.errMsg(err)
      }
    })
  }

  getAllMusicRegistration(callback) {
    schemaDef.musicRegistration.find({}, (err, res) => {
      if (err) {
        util.errMsg(err)
        return
      }
      callback(res)
    })
  }

  // --------------------------------------------
  // artistRegistration
  upsertArtistRegistration(data) {
    schemaDef.artistRegistration.findOneAndUpdate({ id: data.id }, data, { upsert: true }, (err) => {
      if (err) {
        util.errMsg(err)
      }
    })
  }

  getAllArtistRegistration(callback) {
    schemaDef.artistRegistration.find({}, (err, res) => {
      if (err) {
        util.errMsg(err)
        return
      }
      callback(res)
    })
  }

  getArtistNameByArtistId(artistId, callback) {
    schemaDef.artistRegistration.findOne({ id: artistId }, (err, res) => {
      // 返回空表示可能音乐人那部分数据还没爬下来，等下次更新就会有了
      callback(res ? res.name : '')
    })
  }

  // --------------------------------------------
  // albumRegistration
  upsertAlbumRegistration(data) {
    schemaDef.albumRegistration.findOneAndUpdate({ id: data.id }, data, { upsert: true }, (err) => {
      if (err) {
        util.errMsg(err)
      }
    })
  }

  getAllAlbumRegistration(callback) {
    schemaDef.albumRegistration.find({}, (err, res) => {
      if (err) {
        util.errMsg(err)
        return
      }
      callback(res)
    })
  }

  // --------------------------------------------
  // dataDateInfo
  upsertDataDateInfo(data) {
    schemaDef.dataDateInfo.findOneAndUpdate({ name: data.name }, data, { upsert: true }, (err) => {
      if (err) {
        util.errMsg(err)
      }
    })
  }
  getAllDataDateInfo(callback) {
    schemaDef.dataDateInfo.find({}, (err, res) => {
      if (err) {
        util.errMsg(err)
        return
      }
      callback(res)
    })
  }
  getDataDateInfoByName(name, callback) {
    schemaDef.dataDateInfo.findOne({ name }, (err, res) => {
      if (err) {
        util.errMsg(err)
        return
      }
      callback(res)
    })
  }
}


export default new Database()
