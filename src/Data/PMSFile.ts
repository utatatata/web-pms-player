import { PMS } from "Data/PMS"

export type PMSFile = {
  id?: number
  name: string
  ext: string
  base: string
  data: ArrayBuffer | PMS
  pmsId?: number
}
