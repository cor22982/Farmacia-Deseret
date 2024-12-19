import React, { forwardRef , useEffect, useState} from 'react';
import { Modal, Typography, Box, TextField, Select, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextareaAutosize, Button, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Divider, AccordionDetails, AccordionSummary, Accordion } from '@mui/material';
import useApi from 'src/hooks/useApi';
import useToken from 'src/hooks/useToken';
import source_link from 'src/repository/source_repo';
import Swal from "sweetalert2";
import { Icon } from "@iconify/react"; 
import { Iconify } from 'src/components/iconify';
import { Carrito } from 'src/_mock/carrito';
import { Pago, usePagos } from 'src/_mock/pagos';
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

   
    const [pago_cantidad, setPago_cantidad] = useState<number | null>(null);

    const [tipoPago, setTipoPago] = useState('ninguno')
    
    
    const {llamado:insertMetodo_Pago} = useApi(`${source_link}/insertMetodo_Pago`)

    const {llamado:deletepago} = useApi(`${source_link}/deletepago`)



    const [carritoproductos, setCarritoProductos] = useState<ProductoCarrito[]>([])
    const [pago, setPagos] = useState<Pago[]>([])
    const {getPagos} = usePagos();
    const {getCarritoProducts} = useGetProductosCarrito ();
    const [cambio, setCambio] = useState(0)

    useEffect(() => {
          const fetchProductos = async () => {
            const productos = await getCarritoProducts(carrito?.id ?? null)
            const pagos = await getPagos(carrito?.id ?? null)
            const total_pago = pagos.reduce((acumulador, objeto) => acumulador + objeto.pago, 0);
            const totalCarrito = carrito?.total ?? 0;

            setCambio(total_pago - totalCarrito);

            setPagos(pagos)
            setCarritoProductos(productos)
          };
        
          fetchProductos();
        }, [getCarritoProducts, setCarritoProductos, carrito?.id, getPagos, setPagos, carrito?.total]);
    

    const insertPago = async() =>{
      const body = {pago: pago_cantidad, tipo:tipoPago, id_carrito: carrito?.id }
      const respuesta = await insertMetodo_Pago(body, "POST")

      if (respuesta.success === true) {
        setPago_cantidad(null)
      }

    }

    const deletePayMethod = async(id:number) =>{
      const body = {id}
      await deletepago(body, "DELETE")
    }

    return (
    <Modal 
      open={open} 
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <Box sx={style} gap="0.1rem">
          <Box display="flex" alignItems= 'center' justifyContent="center" flexDirection="column">
            <Box display="flex" flexDirection="row" gap={5}>
              <Box  display="flex" flexDirection="column" alignItems= 'center'  justifyContent="center">
                <Typography id="modal-modal-title" variant="h4" component="h2">
                Total
                </Typography>
                <Typography id="modal-modal-title" variant="h2" component="h2">
                Q {carrito?.total}
                </Typography>
              </Box>
              <Box  display="flex" flexDirection="column" alignItems= 'center'  justifyContent="center">
                <Typography id="modal-modal-title" variant="h4" component="h2" color="primary">
                Cambio
                </Typography>
                <Typography id="modal-modal-title" variant="h2" component="h2" color="primary">
                Q {cambio}
                </Typography>
              </Box>
            </Box>


            <Box>              
              <Accordion>
              <AccordionSummary
                expandIcon={<Iconify icon="material-symbols-light:list" />}
                aria-controls="product-details-content"
                id="product-details-header"
              >
                <Typography variant="h6">Productos al Carrito</Typography>
              </AccordionSummary>
               <AccordionDetails>
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
               </AccordionDetails>
              </Accordion>
              
                    </Box>
            <br/>
            
            <Box display="flex" flexDirection="column" >
              <Typography id="modal-modal-title" variant="h5">Formas de pago</Typography>
              <TableContainer component={Paper}>
                      <Table size="small" aria-label="tabla de detalles de productos" >
                        <TableHead>
                          <TableRow>
                          <TableCell
                              sx={{
                                 width: '5px',
                                fontWeight: 'normal',
                                backgroundColor: 'transparent',
                              }}
                            >
                              <Typography variant="body2"/>
                            </TableCell> 
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">Tipo</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">Pago (Quetzales)</Typography>
                            </TableCell>
                           
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {pago.map((p, index) => (
                            <TableRow key={index}>
                              <TableCell sx={{ width: '5px', fontSize: '12px'}}> 
                                <Button sx={{ minWidth: 0}}
                                  onClick={()=>{deletePayMethod(p.id)}}>
                                  <Icon icon="mdi:trash" width="20" height="20" color='red' />
                                </Button>
                              </TableCell>
                              <TableCell>{p.tipo}</TableCell>
                              <TableCell>
                                {p.pago}</TableCell>
                             
                            </TableRow>

                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
            </Box>
          </Box>
          <br/>
          <Box display="flex" flexDirection="row" gap={2}>
            <TextField
                fullWidth
                name="forma_f"
                label="Pago"
                value={pago_cantidad  ?? ''}
                type='number'
                defaultValue=""
                onChange = {(e) => {
                  setPago_cantidad(Number(e.target.value) || null);
               }}         
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
            <FormControl fullWidth>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                sx={{
                  mb: 1,
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
                value={tipoPago}
                onChange={(e) => setTipoPago(String(e.target.value))}
                
               
              >
                <MenuItem value="ninguno">
                  <em>Tipo de Pago</em>
                </MenuItem>
                <MenuItem value="efectivo">Efectivo</MenuItem>
                <MenuItem value="cuik">Cuik</MenuItem>
                <MenuItem value="tarjeta">Tarjeta</MenuItem>
                <MenuItem value="credito">Credito</MenuItem>
              </Select>
              </FormControl>   
          </Box>
         
          <br/>
         
          <Button
            variant="contained" color="inherit" component="label"
            sx={{
              width:'100%'
            }}
            onClick={insertPago}
            
          >Agregar Pago</Button>
          <br/>
          <br/>
            <Button
            variant="contained" color="primary" component="label"
            sx={{
              width:'100%'
            }}
            
          >PAGAR</Button>
        </Box>
    </Modal>
    )
  }
);
