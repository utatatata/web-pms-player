const init = {
  player: "1",
  total: 200,
  wav: [],
  bmp: [],
  main: [],
}

const parsePMS = src => {
  const records = src
    .split(/\n|\r/g)
    .filter(line => line.charAt(0) === "#")
    .map(line => parseCommand(line.slice(1)))

  if (records.length === 0) {
    return null
  }

  return records.reduce((acc, record) => {
    const key = Object.keys(record)[0]
    if ((key === "wav" || key === "bmp", key === "main")) {
      return { ...acc, [key]: [...acc[key], ...record[key]] }
    }
    return { ...acc, ...record }
  }, init)
}

const parseCommand = src => {
  const [name, arg1] = src
    .split(" ")
    .filter(chr => chr !== "")
    .map(str => (str ? str : ""))

  if (name === "PLAYER") {
    return {
      player: arg1 ? arg1 : "1",
    }
  } else if (name === "GENRE") {
    return { genre: arg1 }
  } else if (name === "TITLE") {
    return { title: arg1 }
  } else if (name === "ARTIST") {
    return { artist: arg1 }
  } else if (name === "BPM") {
    return { bpm: parseInt(arg1, 10) }
  } else if (name === "PLAYLEVEL") {
    return { playlevel: parseInt(arg1, 10) }
  } else if (name === "RANK") {
    return { rank: arg1 }
  } else if (name === "VOLWAV") {
    return { volwav: parseInt(arg1, 10) }
  } else if (name === "TOTAL") {
    return { total: parseInt(arg1, 10) }
  } else if (name === "STAGEFILE") {
    return { stagefile: arg1 }
  } else if (name === "MIDIFILE") {
    return { midifile: arg1 }
  } else if (name.slice(0, 3) === "WAV") {
    const id = name.slice(3, 5)
    return {
      wav: [{ id: id, file: arg1 }],
    }
  } else if (name.slice(0, 3) === "BMP") {
    const id = name.slice(3, 5)
    return {
      bmp: [{ id: id, file: arg1 }],
    }
  } else if (/\d{5}:/.test(name.slice(0, 6))) {
    const [mode, param] = name.split(":")
    const id = mode.slice(0, 3)
    const channel = mode.slice(3, 5)
    const paramList = param.match(/.{2}/g)
    return {
      main: [{ id: id, channel: channel, param: paramList }],
    }
  }
  return {}
}

export { parsePMS }
