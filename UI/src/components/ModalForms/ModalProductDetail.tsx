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
import { UploadImage } from '../UploadImage/UploadImage';

interface ModalProductDetailProps {
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
  width:700,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
};

const schema_pp = object({
  pp: number().required('El precio publico es requerido')
})

const schema = object({
  cantidad: number().required('La cantidad es requerida'),
  fechac: string().required('La fecha de compra es obligatoria'),
  fechav: string().required('La fecha de vencimiento es obligatoria'),
  costo: number().required('El costo es obligatorio'),
  
})

export const ModalProductDetail = forwardRef<HTMLDivElement, ModalProductDetailProps>(
  ({ open, handleClose, handleClick, id, setCall }, ref) => {


    const [value_ubicacion, setValueUbicacion] = useState(100000); 
    const [productdetails, setProductDetails] = useState<ProductDetail[]>([]);
    const {getDetails_ById} = useGetProduct_Details();
    const [image, setImage] = useState<string | null>(null);
    const [ubicaciones, setUbicaciones] = useState<Place[]>([]);
    const {getGanancia} = useGetProducts();
    const [ganancia, setGanancia]  = useState<Product | null>(null);
    const {token} = useToken()
    const { getPlaces } = useGetPlaces();
    const {llamado} = useApi(`${source_link}/updatePP`)
    const {llamado: insertdetail} = useApi(`${source_link}/insertProductDetails`)
    const { values: valueForm, setValue: setValueForm, validate, errors } = useForm(schema, { cantidad: 0, fechac: '', fechav: '', costo: 0})


    const { values: valuepp, setValue: setValuepp, validate: validatepp, errors: errorpp } = useForm(schema_pp, { pp:0})

    const handleChange_Update = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setValuepp(name as keyof typeof valuepp, value);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setValueForm(name as keyof typeof valueForm, value);
    };

    useEffect(() => {
      const fetchPlaces = async () => {
        try {
          const fetchedPlaces = await getPlaces();
          const details = await getDetails_ById(id);
          const ganancia_give = await getGanancia(id);
          setGanancia(ganancia_give)
          setProductDetails(details)
          setUbicaciones(fetchedPlaces)     
        } catch (error) {
          console.error("Error fetching places:", error);
        }
      };
  
      fetchPlaces();
    }, [getPlaces, setUbicaciones, setProductDetails, getDetails_ById, id, getGanancia, setGanancia ]); 

    const handleUpdatePp = useCallback(async() => {
      const isValid = await validatepp();
      if (isValid) {
        const body = {
          token,
          id,
          pp: Number(valuepp.pp),

        };
        console.log(body)
        const response = await llamado(body, 'PUT');
        if (response) {
          if (response.success === true){
            setCall(0)
            console.log(response)            
          }
          
        }
        
      }
      return false
    }, [validatepp, valuepp, llamado, id, token, setCall]);


    const handleInsertDetail = useCallback(async() => {
      const isValid = await validate();
      if (isValid) {
        const body = {
          token,
          cantidad: Number(valueForm.cantidad),
          fechac: valueForm.fechac,
          fechav: valueForm.fechav,
          costo: Number(valueForm.costo),
          id_product: id,
          id_ubicacion: value_ubicacion

        };
        const response = await insertdetail(body, 'POST');
        if (response) {
          if (response.success === true){
            setCall(0)
            console.log(response)            
          }
          
        }
        
        
      }
      return false
    }, [validate, valueForm, id, token, value_ubicacion, insertdetail, setCall]);


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
            AÑADIR PRODUCTOS
            </Typography>
          </Box>
          <br/>
          <TableContainer component={Paper}>
                    <Table size="small" aria-label="tabla de detalles de productos">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">Detalles</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">Ubicacion</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">Fecha Vencimiento</Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {productdetails.map((p, index) => (
                          <TableRow key={index}>
                            <TableCell>{p.getDetails_Products()}</TableCell>
                            <TableCell>{p.ubicacion.ubicacion}({p.ubicacion.lugar_farmacia})</TableCell>
                            <TableCell>{p.get_Fechasformated()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
          </TableContainer>
          
          <Box display="flex" flexDirection="row" padding="1rem" gap="1rem" width='auto'>
            <TextField
              fullWidth
              name="cantidad"
              label="Cantidad"
              type='number'
              defaultValue=""
              
              error={!!errors.cantidad}
              helperText={errors.cantidad}
              onChange={handleChange}
              value={valueForm.cantidad}

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
              name="fechac"
              label="Fecha Compra"
              defaultValue=""
              type='date'

              error={!!errors.fechac}
              helperText={errors.fechac}
              onChange={handleChange}
              value={valueForm.fechac}

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
              name="fechav"
              label="Fecha Vencimiento"
              defaultValue=""
              type='date'
              error={!!errors.fechav}
              helperText={errors.fechav}
              onChange={handleChange}
              value={valueForm.fechav}
              
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
          <Box display="flex" flexDirection="row" padding="1rem" gap="1rem" width='auto'>
            <TextField
                fullWidth
                name="costo"
                label="Costo"
                type='number'
                defaultValue=""
                error={!!errors.costo}
                helperText={errors.costo}
                onChange={handleChange}
                value={valueForm.costo}
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
            
            value={value_ubicacion}
            onChange={(e) => setValueUbicacion(Number(e.target.value))}
          >
            <MenuItem value={100000}>
              <em>Ubicacion</em>
            </MenuItem>
            {ubicaciones.map((ubicacion) => (
              <MenuItem value={ubicacion.id}>
                <em>{ubicacion.ubicacion}({ubicacion.lugar_farmacia})</em>
              </MenuItem>
            ))}
          </Select>
          </FormControl>
          
          </Box>
         
          <Button
            variant="contained" color="inherit" component="label"
            
            sx={{
              width:'100%'
            }}
            onClick={handleInsertDetail}
          >INSERTAR NUEVA CANTIDAD DE PRODUCTO</Button>
          <br/>
          <br/>
          
        </Box>
    </Modal>
    )
  }
);
