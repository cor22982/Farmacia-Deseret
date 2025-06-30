import React, { forwardRef , useState, useEffect, useCallback} from 'react';
import { CircularProgress, Modal, Typography, Box, TextField, Select, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextareaAutosize, Button, Grid, IconButton, TableContainer, Table, TableHead, TableRow, TableCell, Paper, TableBody } from '@mui/material';
import { Place, useGetPlaces} from 'src/_mock/places';
import { useGetProduct_Details, ProductDetail } from 'src/_mock/product_detail';
import { Product, useGetProducts } from 'src/_mock/product';
import useApi from 'src/hooks/useApi';
import source_link from 'src/repository/source_repo';
import useForm from 'src/hooks/useForm';
import useToken, { parseJwt } from 'src/hooks/useToken';
import { Icon } from "@iconify/react";
import { object, string, number } from 'yup';
import { UploadImage } from '../UploadImage/UploadImage';

interface ModalProductDetailProps {
  open: boolean;
  handleClose: () => void;
  setCall: (call:number) => void;
  product: Product | null;
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

type Ubicacion = {
  id: number;
  ubicacion: string;
  lugar_farmacia: string;
};

const schema = object({
  cantidad: number().required('La cantidad es requerida'),
  fechac: string().required('La fecha de compra es obligatoria'),
  fechav: string().required('La fecha de vencimiento es obligatoria'),
  costo: number().required('El costo es obligatorio'),
  
})

export const ModalUpdateProduct = forwardRef<HTMLDivElement, ModalProductDetailProps>(
  ({ open, handleClose, product, setCall }, ref) => {

    const [value_ubicacion, setValueUbicacion] = useState(100000); 
    const [ubicaciones, setUbicaciones] = useState<Place[]>([]);
    
    
      
    const {getDetails_ById_user} = useGetProduct_Details()
    const { getPlaces_usuario } = useGetPlaces();
    const [details, setDetails] = useState<ProductDetail[]>([]);
    const {llamado: insertdetail} = useApi(`${source_link}/insertProductDetails_usuario`)
    const {llamado: obtenerUbicacionesadm} = useApi(`${source_link}/ubicaciones`)

    const { values: valueForm, setValue: setValueForm, validate, errors } = useForm(schema, { cantidad: 0, fechac: '', fechav: '', costo: 0})
    const [ubicaciones_by_defect, setUbicaciones_defect] = useState<string[]>([]);  
    const [ubicaciones_admin, setUbicaciones_admin] = useState<Ubicacion[]>([]);

    const [isRendering, setIsRendering] = useState(true);
    const {llamado: deletedetail} = useApi(`${source_link}/deleteProductos_Cantidades`)


    const {token} = useToken()
    const jwt = token ? parseJwt(token) : null;
    const rol = jwt ? jwt.rol : null;

    const onDeleteProducto_Detail = async (id_detail: number) => {
      const body = { id: id_detail };
      const response = await deletedetail(body, "DELETE");
      
      if (response?.success) {
        setCall(0)
        // Filtra los detalles para excluir el eliminado
        setDetails((prevDetails) => prevDetails.filter((detail) => detail.id !== id_detail));
      } else {
        console.error("Error al eliminar el detalle:", response?.message || "Desconocido");
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setValueForm(name as keyof typeof valueForm, value);
    };


    
    const [loadedProductId, setLoadedProductId] = useState<number | null>(null);

useEffect(() => {
  const fetchPlaces = async () => {
    if (!product?.id || product.id === loadedProductId) return; // No recargar si es el mismo producto

    setIsRendering(true);
    try {
      const fetchedPlaces = await getPlaces_usuario();
      const product_details_geted = await getDetails_ById_user(product.id);
      setDetails(product_details_geted);
      setUbicaciones(fetchedPlaces);

      const lista_ubicaciones: string[] = [];
      product.listdetails?.forEach((detalle) => {
        lista_ubicaciones.push(detalle.ubicacion.id);
      });
      setUbicaciones_defect(lista_ubicaciones);

      if(rol === 'admin'){
        const ubicaciones_administrador = await obtenerUbicacionesadm({
          token
        },'POST')

        console.log(ubicaciones_administrador.ubicaciones)
        setUbicaciones_admin(ubicaciones_administrador.ubicaciones)

      }
      setLoadedProductId(product.id); // Marcar como cargado
    } catch (error) {
      console.error("Error fetching places:", error);
    } finally {
      setIsRendering(false);
    }
  };

  fetchPlaces();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [product?.id, product?.listdetails]);



    const handleInsertDetail = useCallback(async () => {
  
  // if (!isValid) return false;

  setIsRendering(true); // <-- mostrar progress mientras se inserta

  const body = {
    cantidad: Number(valueForm.cantidad),
    fechac: valueForm.fechac,
    fechav: valueForm.fechav,
    costo: Number(valueForm.costo),
    id_product: product?.id,
    id_ubicacion: value_ubicacion
  };

  const response = await insertdetail(body, 'POST');

  if (response?.success) {
    setCall(0);

    // Actualiza tabla después de insertar exitosamente
    try {
      const product_details_geted = await getDetails_ById_user(product?.id || 0);
      setDetails(product_details_geted);
    } catch (error) {
      console.error("Error actualizando detalles tras insertar:", error);
    }
  }

  setIsRendering(false); // <-- ocultar progress después

  return false;
}, [ valueForm, value_ubicacion, insertdetail, setCall, product?.id, getDetails_ById_user]);

   
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
          <Box display="flex" alignContent="center" justifyContent="center" >

             {isRendering ? (
                      <CircularProgress />
                    ) : (

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
                  <Typography variant="body2" fontWeight="bold">Ubicacion</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">Cantidad</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">Fecha Vencimiento</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {details.map((p, index) => (
                <TableRow key={index}>
                  <TableCell>
                  {rol === 'admin' ? (
                    <Button sx={{ minWidth: 0 }} onClick={() => onDeleteProducto_Detail(p.id)}>
                      <Icon icon="mdi:trash" width="20" height="20" color="red" />
                    </Button>
                  ) : null}
                </TableCell>
                  <TableCell>{p.ubicacion.ubicacion}({p.ubicacion.lugar_farmacia})</TableCell>
                  <TableCell>{p.cantidad}</TableCell>
                  <TableCell>{p.get_Fechasformated()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer> 

                    )
                    
                    
                    
                    }

            
          </Box>
          <br/>
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
  {rol !== 'admin' ? (
    <Select
      labelId="demo-simple-select-label"
      id="select-usuario"
      sx={{
        mb: 1,
        '& .MuiOutlinedInput-root': {
          '& fieldset': { borderColor: '#919191' },
          '&:hover fieldset': { borderColor: '#262626' },
          '&.Mui-focused fieldset': { borderColor: '#050505', borderWidth: 2 },
        },
      }}
      value={value_ubicacion}
      onChange={(e) => setValueUbicacion(Number(e.target.value))}
    >
      <MenuItem value={100000}>
        <em>Ubicacion</em>
      </MenuItem>

      {ubicaciones_by_defect.map((id) => {
        const ubicacion = ubicaciones.find((u) => u.id === id);
        if (!ubicacion) return null;

        if (ubicacion.lugar_farmacia.toLowerCase() === 'bodega') return null;

        return (
          <MenuItem key={ubicacion.id} value={ubicacion.id}>
            <em>{ubicacion.ubicacion} ({ubicacion.lugar_farmacia})</em>
          </MenuItem>
        );
      })}
    </Select>
  ) : (
    <Select
      labelId="demo-simple-select-label-admin"
      id="select-admin"
      sx={{
        mb: 1,
        '& .MuiOutlinedInput-root': {
          '& fieldset': { borderColor: '#919191' },
          '&:hover fieldset': { borderColor: '#262626' },
          '&.Mui-focused fieldset': { borderColor: '#050505', borderWidth: 2 },
        },
      }}
      value={value_ubicacion}
      onChange={(e) => setValueUbicacion(Number(e.target.value))}
    >
      <MenuItem value={100000}>
        <em>Ubicacion Admin</em>
      </MenuItem>

      {ubicaciones_admin.map((ubicacion) => (
        <MenuItem key={ubicacion.id} value={ubicacion.id}>
          <em>{ubicacion.ubicacion} ({ubicacion.lugar_farmacia})</em>
        </MenuItem>
      ))}
    </Select>
  )}
</FormControl>




          
          </Box>
         
          <Button
            variant="contained" color="inherit" component="label"
            onClick={handleInsertDetail}
            sx={{
              width:'100%'
            }}
         
          >INSERTAR NUEVA CANTIDAD DE PRODUCTO</Button>
          <br/>
          
        </Box>
    </Modal>
    )
  }
);
