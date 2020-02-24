// use Blob.text instead
const readFile = (file: Blob): Promise<string | ArrayBuffer | null> =>
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

const readBinary = (file: Blob): Promise<string | ArrayBuffer | null> =>
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
