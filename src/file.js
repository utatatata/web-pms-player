// use Blob.text instead
const readFile = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = _ => {
      resolve(reader.result)
    }
    reader.onerror = _ => {
      reject("failed to read a file")
    }
    reader.readAsText(file)
  })

const readBinary = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = _ => {
      resolve(reader.result)
    }
    reader.onerror = _ => {
      reject("failed to read a file")
    }
    reader.readAsBinaryString(file)
  })

export { readFile, readBinary }
