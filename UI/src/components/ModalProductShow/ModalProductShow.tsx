import React, { forwardRef , useState, useEffect, useCallback} from 'react';
import { Modal, Typography, Box, TextField, Select, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextareaAutosize, Button, Grid, IconButton, TableContainer, Table, TableHead, TableRow, TableCell, Paper, TableBody, CardMedia, Chip, Badge } from '@mui/material';
import { Place, useGetPlaces} from 'src/_mock/places';
import { useGetProduct_Details, ProductDetail } from 'src/_mock/product_detail';
import { Product, useGetProducts } from 'src/_mock/product';
import useApi from 'src/hooks/useApi';
import source_link from 'src/repository/source_repo';
import useForm from 'src/hooks/useForm';
import useToken from 'src/hooks/useToken';
import { Icon } from "@iconify/react";
import { object, string, number } from 'yup';
import useCarId from 'src/hooks/useIdProduct';
import Swal from 'sweetalert2';
import { Carrito, useCarrito } from 'src/_mock/carrito';
import { PresentacionProducto } from 'src/_mock/presentacion_producto';
import { UploadImage } from '../UploadImage/UploadImage';
import { Iconify } from '../iconify';




interface ModalProductShowProps {
  open: boolean;
  handleClose: () => void;
  product: Product | null;
  presentacion: PresentacionProducto | null;
}
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width:1000,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
};



const schema = object({
  cantidad: number().required('La cantidad es requerida'),
  fechac: string().required('La fecha de compra es obligatoria'),
  fechav: string().required('La fecha de vencimiento es obligatoria'),
  costo: number().required('El costo es obligatorio'),
  
})

export const ModalProductShow = forwardRef<HTMLDivElement, ModalProductShowProps>(
  ({ open, handleClose,  product, presentacion }, ref) => {
    const {carId, setCarId} = useCarId ();
    const {llamado} = useApi(`${source_link}/agregar_carrito`);
    const [error, setError] = useState<string|null>(null);
    const [cantidad, setCantidad] = useState<number | null>(null);
    const { getCarrito_byId} = useCarrito();
    const [micarrito, setMiCarrito] = useState<Carrito | null>(null)

    useEffect(() => {
      const fetchProducts = async () => {
        try {
          
          if (carId !== null) {
            try{
            const carrito =  await getCarrito_byId(carId)
            setMiCarrito(carrito)
          }catch(err){
            console.log(err)
          }
          }
          
        
        } catch (errorr) {
          console.error("Error fetching places:", errorr);
        }
      };
     // console.log(product_geted)
      fetchProducts();
    }, [ carId, getCarrito_byId, setMiCarrito]);
  
    
     const addtoCarrito = async()=>{
        const body = {opcion: 'varios' , carrito:carId, producto: product?.id, cantidad, presentacion: presentacion?.id   }
        const respuesta = await llamado(body, 'POST')
        console.log(respuesta)
        if (respuesta.success === true) {
         
          setError(null)
          setCantidad(null)
        }else{
          setError(respuesta.message)
        }
      }
    return (
    <Modal 
      open={open} 
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <Box sx={style} gap="0.1rem">
    
          <Box display="flex"  flexDirection="row" gap='1rem'>
           <Box display="flex" flexDirection="column"  maxWidth="50%">
              <CardMedia
                component="img"
                sx={{ width: 450 ,height: 400 }}
                image={`data:image/jpeg;base64,${presentacion?.imagen_presentacion === null ? '' : presentacion?.imagen_presentacion}`}
                alt="Live from space album cover"
              />
              <Box maxWidth="95%" sx={{ paddingTop: 0 }}>
                <Typography variant='h5' sx={{ marginBottom: 0 }}>Uso del Medicamento</Typography>
                <Typography  sx={{
                    
                    textOverflow: 'ellipsis',
                    whiteSpace: 'normal',
                    textAlign: 'justify',
                  }}>{product?.descripcion_uso}</Typography>
              </Box>
           </Box>
           <Box flex="1" maxWidth="70%" display="flex" flexDirection="column" >
              <br/>
              <br/>
              <Box >
                <Box display="flex" justifyContent="flex-end" gap={2}>
                <Badge showZero badgeContent={micarrito?.cantidad_total} color="error" max={99}>
                  <Iconify icon="map:grocery-or-supermarket" width={24} />
                </Badge>
                
                <Typography variant="h5">Total: Q {micarrito?.total}</Typography>
              </Box>
               <br/>
                <Typography
                  variant="h5"
                  sx={{
                    
                    textOverflow: 'ellipsis',
                    whiteSpace: 'normal',
                  }}
                >
                  {product?.nombre}
                </Typography>
                <Chip 
                    label={`${presentacion?.presentacion?.nombre.toUpperCase()} X ${presentacion?.cantidad_presentacion}`}
                    color='error'/>
              </Box>
              <br/>
              <Box display="flex" flexDirection="row">
                <Box flex="1" maxWidth="50%">
                  
                  <Chip 
                  label={`Disponibles ${product?.existencias}`}
                  sx={{
                    backgroundColor: 'black',
                    color: 'white',
                  
                  }}/>
                  <Typography variant='h2'>Q {presentacion?.pp} c/u</Typography>
                </Box>
                <Box flex="1" maxWidth="50%">
                  <Chip 
                    label="Ubicación"
                    sx={{
                      backgroundColor: '#E8B931',
                      color: 'black',
                    
                    }}
                  />

                    <Typography variant='subtitle1'> {product?.listdetails.find((detail) => detail.ubicacion.lugar_farmacia === "farmacia")?.ubicacion.ubicacion}</Typography>
                    <br/>
                    <Chip 
                    label="Fecha Vencimiento"
                    sx={{
                      backgroundColor: '#C00F0C',
                      color: 'white',
                    
                    }}
                  />

                  <Typography variant="subtitle1">
                    {(() => {
                      const detaill = product?.listdetails?.find((detail) => detail.ubicacion.lugar_farmacia === "farmacia");
                      return detaill?.fecha_vencimiento 
                        ? new Date(detaill.fecha_vencimiento).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "N/A"; // Opcional: Texto a mostrar si no se encuentra el detalle
                    })()}
                  </Typography>


                </Box>
              </Box>
              <br/>
               <TextField
                  fullWidth
                  name="forma_f"
                  label="Cantidad"
                  error={!!error}
                  helperText={error}
                  defaultValue=""
                  value={cantidad ?? ''}
                  onChange={(e) => setCantidad(Number(e.target.value) || null)}
                  type='number'
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    mb: 0.2,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#919191',
                      },
                      '&:hover fieldset': {
                        borderColor: '#262626',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#050505',
                        borderWidth: 2,
                      },
                    },
                  }}
                />  
              <br/>
              <Button
                onClick={addtoCarrito}
                startIcon={
                  <Iconify icon="map:grocery-or-supermarket" width={24} />
                }
               variant='contained'>AGREGAR AL CARRITO</Button>
               <br/>
              <Button
                startIcon={
                  <Iconify icon="wpf:in-transit" width={24} />
                }
               variant='contained'
               color='error'>AGREGAR PEDIDO EN TRANSITO</Button>
          </Box>
          </Box>
          
        
        </Box>
    </Modal>
    )
  }
);
