import React, { forwardRef , useState, useEffect} from 'react';
import { Modal, Typography, Box, TextField, Select, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextareaAutosize, Button } from '@mui/material';
import { useGetProveedores, Supplier } from 'src/_mock/supplier';
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
export const ModalSupplier = forwardRef<HTMLDivElement, ModalSupplierProps>(
  ({ open, handleClose, handleClick }, ref) => {
    const { getProvedor_ById } = useGetProveedores();
    const [suppliers, setSupliers] = useState<Supplier[]>([]);

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


    const [value, setValue] = useState('Proveedor');
    const [image, setImage] = useState<string | null>(null);
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
              name="name"
              label="Nombre"
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
              name="direccion"
              label="Direccion"
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
          </Box>
          <Box display="flex" flexDirection="row" padding="1rem" gap="1rem" width='auto'>
          <TextField
              fullWidth
              name="telefono"
              label="Telefono"
              defaultValue=""
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
            
            value={value}
            onChange={(e) => {setValue(e.target.value)}}
          >
            <MenuItem value="Proveedor">
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
              name="contact"
              label="Informacion Contacto"
              defaultValue=""
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
              name="contact2"
              label="Informacion Segundo Contacto"
              defaultValue=""
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
            onClick={handleClick}
          >INSERTAR PROVEEDOR</Button>
        </Box>
    </Modal>
    )
  }
);
