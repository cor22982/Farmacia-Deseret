import React, { forwardRef , useEffect, useState} from 'react';
import { Modal, Typography, Box, TextField, Select, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextareaAutosize, Button, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Divider } from '@mui/material';
import useApi from 'src/hooks/useApi';
import useToken from 'src/hooks/useToken';
import source_link from 'src/repository/source_repo';
import Swal from "sweetalert2";
import { Carrito } from 'src/_mock/carrito';
import { ProductoCarrito, useGetProductosCarrito } from 'src/_mock/productos_carrito';
import { UploadImage } from '../UploadImage/UploadImage';




interface ModalPayProps {
  open: boolean;
  handleClose: () => void;
  carrito: Carrito | null;
  setCall: (call:number) => void;
}
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width:700,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2, 
};
export const ModalPay = forwardRef<HTMLDivElement, ModalPayProps>(
  ({ open, handleClose, setCall,  carrito }, ref) => {

    const [place, setPlace] = useState('');
    
    const [lugar, setLugar] = useState('Lugar');
    const {llamado, error} = useApi(`${source_link}/insertUbicacion`)
    const {token} = useToken()


    const [carritoproductos, setCarritoProductos] = useState<ProductoCarrito[]>([])
    const {getCarritoProducts} = useGetProductosCarrito ();

    useEffect(() => {
          const fetchProductos = async () => {
            const productos = await getCarritoProducts(carrito?.id ?? null)
            setCarritoProductos(productos)
          };
        
          fetchProductos();
        }, [getCarritoProducts, setCarritoProductos, carrito?.id]);
    

    const onInsert = async() => {
      try{
        const body = { token, ubicacion:place, lugar_farmacia:lugar };
        const response = await llamado(body, 'POST')
        if (response) {
          if (response.success === true){
            setPlace('')

            setCall(0)
            Swal.fire({
              icon: "success",
              title: "Se ingreso correctamente",
              text: response.message,
            });
           
          }else{
            Swal.fire({
              icon: "error",
              title: "Error",
              text: response.message,
            });
          }
        }else{
          Swal.fire({
            icon: "error",
            title: "Error",
            text:  error || "No se conoce el error",
          });
        }

      }catch(err){
        console.log(err)
      }
     
    };

    return (
    <Modal 
      open={open} 
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <Box sx={style} gap="0.1rem">
          <Box display="flex" alignItems= 'center' justifyContent="center" flexDirection="column">
            <Typography id="modal-modal-title" variant="h4" component="h2">
            Total
            </Typography>
            <Typography id="modal-modal-title" variant="h2" component="h2">
            Q {carrito?.total}
            </Typography>
            <Box>
              <Typography id="modal-modal-title" variant="h5">Productos</Typography>
              <TableContainer component={Paper}>
                      <Table size="small" aria-label="tabla de detalles de productos" >
                        <TableHead>
                          <TableRow>
                            
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">Cantidad</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">Producto</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">Precio Unitario</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">Precio Total</Typography>
                            </TableCell>
                          
                          
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {carritoproductos.map((producto, index) => (
                            <TableRow key={index}>
                              
                              <TableCell>{producto.cantidad}</TableCell>
                              <TableCell sx={{ width: '50px', fontSize: '12px'}}>
                                {producto.producto_nombre}</TableCell>
                                <TableCell>Q {producto.precio_unitario}</TableCell>
                                <TableCell>Q {(producto.precio_unitario)*(producto.cantidad)}</TableCell>
                              
                            </TableRow>

                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    </Box>
              
          </Box>
          
          <Box>
          <Typography id="modal-modal-title" variant="h5">Formas de pago</Typography>
          </Box>
         
          <br/>
          <br/>
          <br/>
          <Button
            variant="contained" color="inherit" component="label"
            sx={{
              width:'100%'
            }}
            onClick={onInsert}
          >INSERTAR UBICACION</Button>
        </Box>
    </Modal>
    )
  }
);
