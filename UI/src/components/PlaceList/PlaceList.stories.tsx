import { Place } from "src/_mock/places"
import { UbicacionesPrintList } from "./PlaceList"

const meta = {
  component:  UbicacionesPrintList
}
export default meta

export const Default = {
  args: {
    lista: [new Place('1','UBICACION', 'farmacia'), new Place('1','UBICACION2', 'farmacia')],

  }
}