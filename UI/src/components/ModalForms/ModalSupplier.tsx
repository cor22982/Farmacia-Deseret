import React, { forwardRef , useState, useEffect,  useCallback} from 'react';
import { Modal, Typography, Box, TextField, Select, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextareaAutosize, Button, SelectChangeEvent } from '@mui/material';
import { useGetProveedores, Supplier } from 'src/_mock/supplier';
import useForm from 'src/hooks/useForm';
import { object, string, number } from 'yup';
import useApi from 'src/hooks/useApi';
import Swal from "sweetalert2";
import useToken from 'src/hooks/useToken';
import source_link from 'src/repository/source_repo';
import { UploadImage } from '../UploadImage/UploadImage';


interface ModalSupplierProps {
  open: boolean;
  handleClose: () => void;
  handleClick: () => void;
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


const schema = object({
  nombre: string().required('El nombre es obligatorio'),
  direccion: string().required('La direccion es obligatoria'),
  telefono: string().required('El telefono es obligatoria'),
  proveedor_alternativo: number(),
  contacto: string(),
  segundo_contacto: string(),
})

export const ModalSupplier = forwardRef<HTMLDivElement, ModalSupplierProps>(
  ({ open, handleClose, handleClick }, ref) => {
    const { getProvedor_ById } = useGetProveedores();
    const [suppliers, setSupliers] = useState<Supplier[]>([]);
    const { values: valueForm, setValue: setValueForm, validate, errors } = useForm(schema, { nombre: '', direccion: '', telefono: '', proveedor_alternativo: 100, contacto: '', segundo_contacto: ''})
    const {llamado, error: error_Value} = useApi(`${source_link}/insertarSupplier`)
    const {token} = useToken()
    const [value_suplier, setValueSupplier] = useState(100); 
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setValueForm(name as keyof typeof valueForm, value);
    };

    useEffect(() => {
      const fetchSupplier = async () => {
        try {
          const fetchedSuppliers = await getProvedor_ById();
          setSupliers(fetchedSuppliers)
          
        
        } catch (error) {
          console.error("Error fetching places:", error);
        }
      };
  
      fetchSupplier();
    }, [getProvedor_ById, setSupliers, suppliers ]); 

    const handleInsertSupplier = useCallback(async() => {
      const isValid = await validate();
      if (isValid) {
        const body = {
          token,
          nombre: valueForm.nombre,
          direccion: valueForm.direccion,
          telefono: valueForm.telefono,
          proveedor_alternativo: value_suplier === 100 ? null : value_suplier,
          contacto: valueForm.contacto,
          segundo_contacto: valueForm.segundo_contacto === '' ? null : valueForm.segundo_contacto
        };
        const response = await llamado(body, 'POST');
        if (response) {
          if (response.success === true){
            Swal.fire({
              icon: "success",
              title: "Se inicio Sesion",
              text: response.message,
            });
            return true;
          }Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message,
          });
          return false;
        }
          Swal.fire({
            icon: "error",
            title: "Error",
            text:   error_Value|| "No se conoce el",
          });
        
        
        
        
      }
      return false
    }, [validate, valueForm, llamado, error_Value, token, value_suplier]);

    const onClickButton = async() => {
      const respuesta = await handleInsertSupplier();
      if (respuesta){
        await handleClick();
      }
      
    }

    return (
    <Modal 
      open={open} 
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <Box sx={style} gap="0.1rem">
          <Box display="flex" alignItems= 'center' justifyContent="center">
            <Typography id="modal-modal-title" variant="h3" component="h2">
            INSERTAR NUEVO PROVEEDOR
            </Typography>
          </Box>
          <Box display="flex" flexDirection="row" padding="1rem" gap="1rem" width='auto'>
            <TextField
              fullWidth
              name="nombre"
              label="Nombre"
              defaultValue=""
              error={!!errors.nombre}
              helperText={errors.nombre}
              onChange={handleChange}
              value={valueForm.nombre}
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
              name="direccion"
              label="Direccion"
              defaultValue=""

              error={!!errors.direccion}
              helperText={errors.direccion}
              onChange={handleChange}
              value={valueForm.direccion}

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
              name="telefono"
              label="Telefono"
              defaultValue=""

              error={!!errors.telefono}
              helperText={errors.telefono}
              onChange={handleChange}
              value={valueForm.telefono}

              InputLabelProps={{ shrink: true }}
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
                width: '500px'
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
            value={value_suplier}
            onChange={(e) => setValueSupplier(Number(e.target.value))}
          >
            <MenuItem value={100}>
              <em>Proveedor Alternativo</em>
            </MenuItem>
            {suppliers.map((suplie) => (
              <MenuItem value={suplie.id}>
                <em>{suplie.nombre}</em>
              </MenuItem>
            ))}
          </Select>
          </FormControl>
              
          </Box>
         

          <Box display="flex" flexDirection="row" padding="1rem" gap="1rem" width='auto'>
            <TextField
              fullWidth
              name="contacto"
              label="Informacion Contacto"
              defaultValue=""

              error={!!errors.contacto}
              helperText={errors.contacto}
              onChange={handleChange}
              value={valueForm.contacto}

              InputLabelProps={{ shrink: true }}
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
                }
              }}
            />  
            <TextField
              fullWidth
              name="segundo_contacto"
              label="Informacion Segundo Contacto"
              defaultValue=""

              error={!!errors.segundo_contacto}
              helperText={errors.segundo_contacto}
              onChange={handleChange}
              value={valueForm.segundo_contacto}

              InputLabelProps={{ shrink: true }}
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
                }
              }}
            />    
              
          </Box>
          
        
          <br/>
          <Button
            variant="contained" color="inherit" component="label"
            sx={{
              width:'100%'
            }}
            onClick={onClickButton}
          >INSERTAR PROVEEDOR</Button>
        </Box>
    </Modal>
    )
  }
);
