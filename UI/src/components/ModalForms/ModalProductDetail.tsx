import React, { forwardRef , useState, useEffect} from 'react';
import { Modal, Typography, Box, TextField, Select, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextareaAutosize, Button, Grid } from '@mui/material';
import { Place, useGetPlaces} from 'src/_mock/places';
import { useGetProduct_Details, ProductDetail } from 'src/_mock/product_detail';
import { UploadImage } from '../UploadImage/UploadImage';

interface ModalProductDetailProps {
  open: boolean;
  handleClose: () => void;
  handleClick: () => void;
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
export const ModalProductDetail = forwardRef<HTMLDivElement, ModalProductDetailProps>(
  ({ open, handleClose, handleClick, id }, ref) => {
    const [value_ubicacion, setValueUbicacion] = useState(100000); 
    const [productdetails, setProductDetails] = useState<ProductDetail[]>([]);
    const {getDetails_ById} = useGetProduct_Details();
    const [image, setImage] = useState<string | null>(null);
    const [ubicaciones, setUbicaciones] = useState<Place[]>([]);
    const { getPlaces } = useGetPlaces();


    useEffect(() => {
      const fetchPlaces = async () => {
        try {
          const fetchedPlaces = await getPlaces();
          const details = await getDetails_ById(id);
          setProductDetails(details)
          setUbicaciones(fetchedPlaces)     
        } catch (error) {
          console.error("Error fetching places:", error);
        }
      };
  
      fetchPlaces();
    }, [getPlaces, setUbicaciones, setProductDetails, getDetails_ById, id ]); 

    return (
    <Modal 
      open={open} 
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <Box sx={style} gap="0.1rem">
          <Box display="flex" alignItems= 'center' justifyContent="center">
            <Typography id="modal-modal-title" variant="h3" component="h2">
            AÑADIR PRODUCTOS
            </Typography>
          </Box>
          <br/>
          <Box display="flex" alignContent="center" justifyContent="center" paddingLeft="5rem">
          <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 1, md: 1 }}>
          {productdetails.map((detail) => (
              <Grid fontSize={6} display="flex" justifyContent="center" alignContent='center'>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap:'5rem', paddingLeft: '5rem'}} >
                  <Typography variant="body2">{detail.getDetails_Products()}</Typography>  
                  <Typography variant="body2">{detail.get_fechas()}</Typography>  
                </Box>
              </Grid>
            ))}        
          </Grid>    
          </Box>
          <Box display="flex" flexDirection="row" padding="1rem" gap="1rem" width='auto'>
            <TextField
              fullWidth
              name="cantidad"
              label="Cantidad"
              type='number'
              defaultValue=""
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
            onClick={handleClick}
          >INSERTAR NUEVA CANTIDAD DE PRODUCTO</Button>
          <br/>
          <br/>
          <Box display="flex" flexDirection="row" gap="1rem" alignItems="center">
          <TextField
              fullWidth
              name="pp"
              label="Precio Publico"
              type='number'
              defaultValue=""
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
            <Box width="100%" flexDirection="column" >
              <Box flexDirection="row" width="300px">
                <Typography variant='h5'>Ganancia: 100.00</Typography>
                <Typography variant='h5'>Costo: 100.00</Typography>
                <Typography variant='h5'>PP: 100.00</Typography>
              </Box>
             <Button
                variant="contained" color="inherit" component="label"
                sx={{
                  width:'100%'
                }}
                onClick={handleClick}
              >Actualizar Precio Publico</Button>
          </Box>
            </Box>
        </Box>
    </Modal>
    )
  }
);
