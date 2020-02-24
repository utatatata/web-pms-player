// pms: "++id, player, genre, title, artist, levels",

export type Player = { player: string }
export type Genre = { genre: string }
export type Title = { title: string }
export type Artist = { artist: string }
export type Bpm = { bpm: number }
export type PlayerLevel = { playerlevel: number }
export type Rank = { rank: string }
export type VolWav = { volwav: number }
export type Total = { total: number }
export type StageFile = { stagefile: string }
export type MidiFile = { midifile: string }
export type Wav = { wav: { id: string; file: string }[] }

export type Command =
  | Player
  | Genre
  | Title
  | Artist
  | Bpm
  | PlayerLevel
  | Rank
  | VolWav
  | Total
  | StageFile
  | MidiFile
  | Wav

export type Id = { id?: number }
export type Levels = {
  levels: { n: PlayerLevel; h: PlayerLevel; ex: PlayerLevel }
}
export type PMS = Id & Player & Genre & Title & Artist & Levels

// export type PMS = {
//   id?: number
//   player: string
//   genre: string
//   title: string
//   artist: string
//   levels: Levels
// }
