import React, { forwardRef , useState, useEffect} from 'react';
import { Modal, Typography, Box, TextField, Select, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextareaAutosize, Button } from '@mui/material';
import useApi from 'src/hooks/useApi';
import source_link from 'src/repository/source_repo';
import useForm from 'src/hooks/useForm';
import { object, string, number } from 'yup';
import Swal from "sweetalert2";
import useToken from 'src/hooks/useToken';
import { useGetProveedores, Supplier } from 'src/_mock/supplier';
import { UploadImage } from '../UploadImage/UploadImage';



interface ModalProductProps {
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
  forma_f: string().required('La forma farmaceutica es obligatoria'),
  activo_principal: string().required('El activo principal es obligatorio'),
  descripcion: string().required('La descripcion es obligatoria')
})

export const ModalProduct = forwardRef<HTMLDivElement, ModalProductProps>(
  ({ open, handleClose, handleClick }, ref) => {

    const [value_suplier, setValueSupplier] = useState(100000); 

    const {token} = useToken()

    const { getProvedor_ById } = useGetProveedores();

    const [suppliers, setSupliers] = useState<Supplier[]>([]);

    const [value_proveedor, setValue_proveedor] = useState('Proveedor');


    const [presentacion, setPresentacion] = useState('ninguno');

    const [isControlado, setControlado] = useState(false);

    const { values: valueForm, setValue: setValueForm, validate, errors } = useForm(schema, { nombre: '', forma_f: '', activo_principal: '', descripcion: ''})

    const [image, setImage] = useState<string | null>(null);

    const {llamadowithFileAndBody, error} = useApi(`${source_link}/insertProduct`)
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
      const fetchSupplier = async () => {
        try {
          const fetchedSuppliers = await getProvedor_ById();
          setSupliers(fetchedSuppliers)
          
        
        } catch (error_t) {
          console.error("Error fetching places:", error_t);
        }
      };
  
      fetchSupplier();
    }, [getProvedor_ById, setSupliers, suppliers ]);
    
    const handleChange_RadioButton = (event: React.ChangeEvent<HTMLInputElement>) => {
      setControlado((event.target as HTMLInputElement).value === "true");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setValueForm(name as keyof typeof valueForm, value);
    };

    const handleChange_TextArea = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setValueForm(name as keyof typeof valueForm, value);
    };
    const handleSubmit = async () => {
      if (!file) {
        console.error('No file selected');
        return;
      }

      const formData = {
        token,
        nombre: valueForm.nombre,
        forma_f: valueForm.forma_f,
        presentacion,
        id_supplier: value_suplier,
        activo_principal: valueForm.activo_principal,
        isControlado,
        descripcion: valueForm.descripcion
      };

      
      const response = await llamadowithFileAndBody(file, formData, 'POST');
      if (response) {
        if (response.success === true){
          Swal.fire({
            icon: "success",
            title: "Se Inserto de manera exitosa",
            text: response.message,
          });
          handleClick();
          
        }else{Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message,
        });
      }
        
      }
        
    };

    return (
    <Modal 
      open={open} 
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <Box sx={style} gap="0.1rem">
          <Box display="flex" alignItems= 'center' justifyContent="center">
            <Typography id="modal-modal-title" variant="h3" component="h2">
            INSERTAR PRODUCTO NUEVO
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
              name="forma_f"
              label="Forma Farmaceutica"
              defaultValue=""

              error={!!errors.forma_f}
              helperText={errors.forma_f}
              onChange={handleChange}
              value={valueForm.forma_f}
              
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
            
            value={presentacion}
            onChange={(e) => {setPresentacion(e.target.value)}}
          >
            <MenuItem value="ninguno">
              <em>Presentacion</em>
            </MenuItem>
            <MenuItem value="caja">Caja</MenuItem>
            <MenuItem value="blister">Blister</MenuItem>
            <MenuItem value="unidades">Unidades</MenuItem>
          </Select>
          </FormControl>
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
            <MenuItem value={100000}>
              <em>Proveedor</em>
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
              name="activo_principal"
              label="Activo Principal"
              defaultValue=""

              error={!!errors.activo_principal}
              helperText={errors.activo_principal}
              onChange={handleChange}
              value={valueForm.activo_principal}

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
            <Box display="flex" flexDirection="column">
              <FormLabel id="demo-radio-buttons-group-label">Controlado</FormLabel>
                <RadioGroup
                 row
                 aria-labelledby="demo-row-radio-buttons-group-label"
                 name="row-radio-buttons-group"
                 value={isControlado}
                 onChange={handleChange_RadioButton}
                >
                  <FormControlLabel value="true" control={<Radio />} label="Si" />
                  <FormControlLabel value="false" control={<Radio />} label="No" />
                </RadioGroup>
            </Box>    
          </Box>
          <Box display="flex" flexDirection="row" padding="1rem" gap="1rem" width='auto'>
               
             <TextareaAutosize
              minRows={4}
              name="descripcion"
              style={{ width: '100%', borderRadius: '0.5rem' }}
              placeholder="Descripcion Medicamento"
              onChange={handleChange_TextArea}
              value={valueForm.descripcion}
             />
          </Box>
          <UploadImage file={file} setFile={setFile} />
          <br/>
          <Button
            variant="contained" color="inherit" component="label"
            sx={{
              width:'100%'
            }}
            onClick={handleSubmit}
          >INSERTAR PRODUCTO</Button>
        </Box>
    </Modal>
    )
  }
);
