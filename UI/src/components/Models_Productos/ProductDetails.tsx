import React, { forwardRef , useState, useEffect, useCallback} from 'react';
import { Modal, Typography, Box, TextField, Select, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextareaAutosize, Button, Grid, IconButton, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, CircularProgress } from '@mui/material';
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

interface ProductDetailProps {
 
  handleClick: () => void;
  setCall: (call:number) => void;
  id: number;
}


const schema_pp = object({
  pp: number().required('El precio publico es requerido')
})

const schema = object({
  cantidad: number().required('La cantidad es requerida'),
  fechac: string().required('La fecha de compra es obligatoria'),
  fechav: string().required('La fecha de vencimiento es obligatoria'),
  costo: number().required('El costo es obligatorio'),
  
})

export const ProductDetailBox = forwardRef<HTMLDivElement, ProductDetailProps>(
  ({ handleClick, id, setCall }, ref) => {


    const [value_ubicacion, setValueUbicacion] = useState(100000); 
    const [productdetails, setProductDetails] = useState<ProductDetail[]>([]);
    const {getDetails_ById} = useGetProduct_Details();
    const { getBasicInfo} = useGetProducts();
    const [ubicaciones, setUbicaciones] = useState<Place[]>([]);
    const {getGanancia} = useGetProducts();
    const [ganancia, setGanancia]  = useState<Product | null>(null);
    const [producto_nombre, setProductoNombre] = useState<string | null>('');

    const {token} = useToken()

    const [id_Detail, setIdDetail] = useState(0)
    const { getPlaces } = useGetPlaces();
    
    const {llamado: actualizarDetailsProductos} = useApi(`${source_link}/actualizarDetailsProductos`)
    const {llamado: insertdetail} = useApi(`${source_link}/insertProductDetails`)
    const { values: valueForm, setValue: setValueForm, validate, errors } = useForm(schema, { cantidad: 0, fechac: '', fechav: '', costo: 0})
    const [edit_Mode, setEdit_Mode] = useState(false)
    const {llamado: deletedetail} = useApi(`${source_link}/deleteProductos_Cantidades`)
    const [isRendering, setIsRendering] = useState(true);


    const { values: valuepp, setValue: setValuepp, validate: validatepp, errors: errorpp } = useForm(schema_pp, { pp:0})

    

    const onEditMode = (id_detail:number) =>{
      const detail = productdetails.find((object_detail) => object_detail.id === id_detail);
      setIdDetail(detail?.id ?? 0)
      setValueForm('cantidad', detail?.cantidad);
      setValueForm('fechac', detail?.fecha_compra);
      setValueForm('fechav', detail?.fecha_vencimiento);
      setValueForm('costo', detail?.costo);
      setValueUbicacion(Number(detail?.ubicacion.id))
      setEdit_Mode(true)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setValueForm(name as keyof typeof valueForm, value);
    };

    useEffect(() => {
      setIsRendering(true);
    }, []);

    useEffect(() => {
      if (productdetails.length > 0) {  // <-- aquí cambio la condición
        setIsRendering(false);
      }
    }, [productdetails]);

    useEffect(() => {
      const fetchPlaces = async () => {
     
        try {
          const fetchedPlaces = await getPlaces();
          const details = await getDetails_ById(id);
          const ganancia_give = await getGanancia(id);
          setGanancia(ganancia_give)
          setProductDetails(details)
          setUbicaciones(fetchedPlaces)
          const nombre = await getBasicInfo(id)     
          setProductoNombre(nombre?.nombre.toUpperCase() || '')
        } catch (error) {
          console.error("Error fetching places:", error);
        } 
      };
  
      fetchPlaces();
    }, [getPlaces, setUbicaciones, setProductDetails, getDetails_ById, id, getGanancia, setGanancia, getBasicInfo ]); 
    
    const onDeleteProducto_Detail = async (id_detail: number) => {
      const body = { id: id_detail };
      const response = await deletedetail(body, "DELETE");
      
      if (response?.success) {
        setCall(0)
        // Filtra los detalles para excluir el eliminado
        setProductDetails((prevDetails) => prevDetails.filter((detail) => detail.id !== id_detail));
      } else {
        console.error("Error al eliminar el detalle:", response?.message || "Desconocido");
      }
    };

    const handleUpdateMYDetail= useCallback(async() => {
      const isValid = await validate();
      if (isValid) {
        const body = {
          token,
          id: id_Detail,
          cantidad: valueForm.cantidad,
          fecha_compra: valueForm.fechac,
          fecha_vencimiento: valueForm.fechav,
          costo: valueForm.costo,
          ubicacion_id: value_ubicacion,
          id_product: id

        };
        console.log(body)
        const response = await actualizarDetailsProductos(body, 'PUT');
        if (response) {
          if (response.success === true){
            setCall(0)
            setIdDetail(0)
            setValueForm('cantidad', 0);
            setValueForm('fechac', '');
            setValueForm('fechav', '');
            setValueForm('costo', 0);
            setValueUbicacion(100000)
            setEdit_Mode(false)
          }
          
        }
        
      }
      return false
    }, [validate,  actualizarDetailsProductos, id, token, setCall, valueForm, id_Detail, value_ubicacion, setValueForm]);


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

      <Box  gap="0.1rem">
  
          <Box display="flex" alignItems= 'center' justifyContent="center">
            <Typography id="modal-modal-title" variant="h4" component="h2">
              AÑADIR INVENTARIO A {producto_nombre}
            </Typography>
          </Box>
          <br/>
          {isRendering ? (
                    <CircularProgress />) :(
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
                            <Typography variant="body2" fontWeight="bold">Detalles</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">Costo</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">Ubicacion</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">Fecha Vencimiento</Typography>
                          </TableCell>
                          <TableCell
                              sx={{
                                  width: '5px',
                                fontWeight: 'normal',
                                backgroundColor: 'transparent',
                              }}
                            >
                              <Typography variant="body2"/>
                            </TableCell> 
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {productdetails.map((p, index) => (
                          <TableRow key={index}>
                             <TableCell>
                            <Button sx={{ minWidth: 0}}
                              onClick={()=>{onDeleteProducto_Detail(p.id)}}
                              >
                              <Icon icon="mdi:trash" width="20" height="20" color='red' />
                            </Button>
                            </TableCell>
                            <TableCell>{p.getDetails_Products()}</TableCell>
                            <TableCell>Q {p.costo.toFixed(2)}</TableCell>
                            <TableCell>{p.ubicacion.ubicacion}({p.ubicacion.lugar_farmacia})</TableCell>
                            <TableCell>{p.get_Fechasformated()}</TableCell>
                            <TableCell>
                               <Button sx={{ marginTop: 1.5}}
                                   onClick={() => {onEditMode(p.id)}}
                                    >
                                    <Icon icon="material-symbols:edit" width="20" height="20" color='blue' />
                                  </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
          </TableContainer>
                    )}
          
          
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
            
            {
               edit_Mode ? (
                <Button
                 color="primary"
                variant="contained" component="label"
                
                sx={{
                  width:'100%'
                }}
                onClick={handleUpdateMYDetail}
              >EDITAR CANTIDAD PRODUCTO</Button>
               ): (
                <Button
                variant="contained" color="inherit" component="label"
                
                sx={{
                  width:'100%'
                }}
                onClick={handleInsertDetail}
              >INSERTAR NUEVA CANTIDAD DE PRODUCTO</Button>
               )
            }
         
          <br/>
          <br/>
          
        </Box>

    )
  }
);
