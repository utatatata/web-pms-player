import Dexie from "dexie"

const dbName = "PMSDataBase"
const dbVersion = 1
const db = new Dexie(dbName)
db.version(dbVersion).stores({
  pms:
    "++id, player, genre, title, artist, bpm, playlevel, rank, volwav, total, stagefile, midifile, wav, bmp, main",
})

const insertPMS = async pms => await db.pms.add(pms)

const getAllPMS = async () => await db.pms.toArray()

export { getAllPMS, insertPMS }
