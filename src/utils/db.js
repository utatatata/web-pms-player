import Dexie from "dexie"
import relationships from "dexie-relationships"

const dbName = "PMSDataBase"
const dbVersion = 1

const db = new Dexie(dbName, { addons: [relationships] })
db.version(dbVersion).stores({
  pms: "++id, player, genre, title, artist, levels",
  files: "++id, name, ext, base, data, pmsId -> pms.id",
})

const insertPMS = async pms =>
  await db.transaction("rw", db.files, db.pms, async () => {
    const pmsId = await db.pms.add({
      player: pms.player,
      genre: pms.genre,
      title: pms.title,
      artist: pms.artist,
      // levels = { n: <int>, h: <int>, ex: <int> }
      levels: pms.levels,
    })
    return await db.files.bulkPut(
      pms.files.map(f => ({
        name: f.name,
        ext: f.ext,
        base: f.base,
        data: f.data,
        pmsId,
      }))
    )
  })

const getAllPMS = async () => await db.pms.toArray()

const getPMS = async id => await db.pms.with({ files: "files" }).get(id)

const getPMSFiles = async (id, ext = null) =>
  ext === null
    ? await db.files.where({ pmsId: id }).toArray()
    : await db.files.where({ pmsId: id, ext }).toArray()

export { insertPMS, getAllPMS, getPMS, getPMSFiles }
