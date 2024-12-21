import React, { forwardRef , useState, useEffect, useCallback} from 'react';
import { Modal, Typography, Box, TextField, Select, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextareaAutosize, Button, Grid, IconButton, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import { Place, useGetPlaces} from 'src/_mock/places';
import { useGetProduct_Details, ProductDetail } from 'src/_mock/product_detail';
import { Product, useGetProducts } from 'src/_mock/product';
import useApi from 'src/hooks/useApi';
import source_link from 'src/repository/source_repo';
import useForm from 'src/hooks/useForm';
import useToken from 'src/hooks/useToken';
import { Icon } from "@iconify/react"; 
import { object, string, number } from 'yup';
import { PresentacionProducto, useGetPresentacionesProducto } from 'src/_mock/presentacion_producto';
import { Presentacion, useGetPresentaciones } from 'src/_mock/presentaciones';
import { UploadImage } from '../UploadImage/UploadImage';



interface ModalPresentacionProductProps {
  open: boolean;
  handleClose: () => void;
  handleClick: () => void;
  setCall: (call:number) => void;
  id: number;
}
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width:900,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
};


const schema = object({
  pp: number().required('La cantidad es requerida'),
  cantidad_presentacion: number().required('La cantidad es requerida'),  
})

export const ModalPresentacionProduct = forwardRef<HTMLDivElement, ModalPresentacionProductProps>(
  ({ open, handleClose, handleClick, id, setCall }, ref) => {

    
    const [presentacion_id, setPresentacionId] = useState(100000); 
    const [presentaciones, setPresentaciones] = useState<Presentacion[]>([]);
    const [presentacionesproducto, setPresentacionesProducto] = useState<PresentacionProducto[]>([]);
    const {token} = useToken()
    const {getPresentaciones} = useGetPresentaciones()
    const {getPresentacionesProducto} =  useGetPresentacionesProducto()
    
    const {llamado: insertPresentacionesProducto} = useApi(`${source_link}/insertPresentacionesProducto`)
    const {llamado: deletepresentacionproducto} = useApi(`${source_link}/deletepresentacionproducto`)
    const { values: valueForm, setValue: setValueForm, validate, errors } = useForm(schema, { pp: 0, cantidad_presentacion: 0})


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setValueForm(name as keyof typeof valueForm, value);
    };

    useEffect(() => {
      const fetchPlaces = async () => {
        try {
          const fetchedPresentaciones = await getPresentaciones();
          const fetchedPresentacionesProductos= await getPresentacionesProducto(id);
          setPresentaciones(fetchedPresentaciones)
          setPresentacionesProducto(fetchedPresentacionesProductos)
        } catch (error) {
          console.error("Error fetching places:", error);
        }
      };
  
      fetchPlaces();
    }, [ setPresentaciones,  getPresentaciones, getPresentacionesProducto, id]); 

    


    const handleInsertDetail = useCallback(async() => {
      const isValid = await validate();
      if (isValid) {
        const body = {
          token,
          pp: Number(valueForm.pp),
          cantidad_presentacion: Number(valueForm.cantidad_presentacion),
          presentacion_id, 
          product_id: id
        };
        const response = await insertPresentacionesProducto(body, 'POST');
        if (response) {
          if (response.success === true){
            setCall(0)
            console.log(response)            
          }
          console.log(response)
          
        }
        
        
      }
      return false
    }, [validate, valueForm,  token,  setCall, insertPresentacionesProducto, presentacion_id, id]);

    const onDeletePresentacion = async(id_presentacion:number)=> {
      const body = {token, id:id_presentacion}
      await deletepresentacionproducto (body, "DELETE");
    }

    return (
    <Modal 
      open={open} 
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <Box sx={style} gap="0.1rem">
      <IconButton
          onClick={handleClick}>
           <Icon icon="material-symbols:arrow-back" width="24" height="24" />
        </IconButton>
          <Box display="flex" alignItems= 'center' justifyContent="center">
            <Typography id="modal-modal-title" variant="h3" component="h2">
            AÑADIR PRESENTACIONES
            </Typography>
          </Box>
          <br/>
          
          <TableContainer component={Paper}>
                    <Table size="small" aria-label="tabla de detalles de productos">
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
                            <Typography variant="body2" fontWeight="bold">Presentacion</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">Costo Q</Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {presentacionesproducto.map((p, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ width: '5px', fontSize: '12px'}}> 
                              <Button sx={{ minWidth: 0}}
                                onClick={() => {onDeletePresentacion(p.id)}}>
                                <Icon icon="mdi:trash" width="20" height="20" color='red' />
                              </Button>
                            </TableCell>
                            <TableCell>{p.presentacion?.nombre} X {p.cantidad_presentacion}</TableCell>
                            <TableCell>{p.pp}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <br/>
          <Box display="flex" flexDirection="row" padding="1rem" gap="1rem" width='auto'>
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
            
            value={presentacion_id}
            onChange={(e) => setPresentacionId(Number(e.target.value))}
          >
            <MenuItem value={100000}>
              <em>Presentacion</em>
            </MenuItem>
            {presentaciones.map((ubicacion) => (
              <MenuItem value={ubicacion.id}>
                <em>{ubicacion.nombre}</em>
              </MenuItem>
            ))}
          </Select>
          </FormControl>
            <TextField
              fullWidth
              name="cantidad_presentacion"
              label="Cantidad por Presentacion"
              type='number'
              defaultValue=""
              
              error={!!errors.cantidad_presentacion}
              helperText={errors.cantidad_presentacion}
              onChange={handleChange}
              value={valueForm.cantidad_presentacion}

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
            <TextField
                fullWidth
                name="pp"
                label="Precio"
                type='number'
                defaultValue=""
                error={!!errors.pp}
                helperText={errors.pp}
                onChange={handleChange}
                value={valueForm.pp}
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
              
           
          </Box>
         
         
          <Button
            variant="contained" color="inherit" component="label"
            
            sx={{
              width:'100%'
            }}
            onClick={handleInsertDetail}
          >INSERTAR NUEVA PRESENTACION</Button>
          <br/>
          <br/>
          
        </Box>
    </Modal>
    )
  }
);
