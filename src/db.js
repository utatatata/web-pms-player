import Dexie from "dexie"

const dbName = "PMSDataBase"
const dbVersion = 1

const db = new Dexie(dbName)
db.version(dbVersion).stores({
  pms: "++id, player, genre, title, artist, playlevel, pms, files",
})

const insertPMS = async pms => await db.pms.add(pms)

const getAllPMS = async () => await db.pms.toArray()

export { getAllPMS, insertPMS }
