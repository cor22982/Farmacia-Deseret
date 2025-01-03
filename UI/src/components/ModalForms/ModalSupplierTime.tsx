import React, { forwardRef , useState,  useEffect, useCallback} from 'react';
import { Modal, Typography, Box, TextField, Select, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextareaAutosize, Button, Grid, IconButton } from '@mui/material';
import { useGetHorario_Proveedor, Schedule } from 'src/_mock/schedule';
import { obtenerNumeroDelDia, obtenerDiaDeLaSemana, diasDeLaSemana } from 'src/_mock/days';
import useForm from 'src/hooks/useForm';
import { object, string, number } from 'yup';
import useApi from 'src/hooks/useApi';
import { Icon } from "@iconify/react"; 
import Swal from "sweetalert2";
import useToken from 'src/hooks/useToken';
import source_link from 'src/repository/source_repo';
import { UploadImage } from '../UploadImage/UploadImage';


const schema = object({
  horario_a: string().required('El horario de apertura es obligatorio'),
  horario_c: string().required('El horario de apertura es obligatorio'),
})

interface ModalSupplierTimeProps {
  open: boolean;
  id: number;
  handleClose: () => void;
  handleClick: () => void;
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
export const ModalSupplierTime = forwardRef<HTMLDivElement, ModalSupplierTimeProps>(
  ({ open, handleClose, handleClick, id, setCall }, ref) => {
    const [value_day, setValueDay] = useState(100000);
    const {getHorarios_Byid} = useGetHorario_Proveedor()
    const [horarios, setHorarios] = useState<Schedule[]>([]);
    
    const { values: valueForm, setValue: setValueForm, validate, errors } = useForm(schema, { horario_a: '', horario_c: ''})
    const {llamado, error: error_Value} = useApi(`${source_link}/insertHorario`)
    const {llamado: deleteHorario, error: error_delete} = useApi(`${source_link}/deletehorarios`)

    const {token} = useToken()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setValueForm(name as keyof typeof valueForm, value);
    };

    useEffect(() => {
      const fetchHorarios= async () => {
        try {
          const fetchedhorarios = await getHorarios_Byid(id);
          setHorarios(fetchedhorarios)

        } catch (error) {
          console.error("Error fetching places:", error);
        }
      };
  
      fetchHorarios();
    }, [getHorarios_Byid, setHorarios , id]); 

    const deleteHorario_byid  = async(id_todelete:number) => {
      console.log(id_todelete)
      try{
       const respuesta = await deleteHorario({token, id: id_todelete}, 'DELETE');
       
       if (respuesta.success === true){
          setCall(0)
       }
      }catch(error_delete_horario){
        console.log(error_delete_horario)
      }
    }

    const handleInsertHorario = useCallback(async(number_id:number) => {
      const isValid = await validate();
      if (isValid) {
        const body = {
          token,
          dia: number_id,
          horario_a: valueForm.horario_a,
          horario_c: valueForm.horario_c,
          proveedor: id
        };
        const response = await llamado(body, 'POST');
        if (response) {
          if (response.success === true){
            setCall(0)
            return true;
          }
          return false;
        }
          
    
      }
      return false
    }, [validate, valueForm, llamado, token, id, setCall]);

    const onClickButton = async() => {
      if (value_day === 7){
        for (let i = 1; i <= 5; i+=1) {
          handleInsertHorario(i);
        }        
      }else if ( value_day === 8){
        for (let i = 0; i <= 6; i+=1) {
          handleInsertHorario(i);
        }
      }else{
        handleInsertHorario(value_day);
      }
      
    }

    return (
    <Modal 
      open={open} 
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <Box sx={style} gap="0.1rem" flexDirection="row" >
        <IconButton
          onClick={handleClick}>
           <Icon icon="material-symbols:arrow-back" width="24" height="24" />
        </IconButton>
          <Box display="flex" alignItems= 'center' justifyContent="center">
            
            <Typography id="modal-modal-title" variant="h3" component="h2">
            Agregar Horarios
            </Typography>
            
          </Box>
          <br/>
          <Box display="flex" alignContent="center" justifyContent="center" paddingLeft="10rem">
          <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 1, md: 1 }}>
            
            <Grid fontSize={6} display="flex" justifyContent="center" alignContent='center'>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
  {horarios.length > 0 ? (
    horarios
      .sort((a, b) => a.dia - b.dia) // Ordenamos por el número del día de la semana
      .map((horario) => (
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: '1.2rem' }} key={horario.id}>
          <IconButton onClick={() => { deleteHorario_byid(horario.id) }}>
            <Icon icon="iwwa:delete" width="14" height="14" color="red" />
          </IconButton>
          <Typography variant="body2">{obtenerDiaDeLaSemana(horario.dia)}</Typography>
          <Typography variant="body2">{horario.getDetails()}</Typography>
        </Box>
      ))
  ) : (
    <Typography variant="body2">No hay horarios disponibles</Typography>
  )}
</Box>

            </Grid>
           
          
          
          </Grid>    
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
            
            value={value_day}
            onChange={(e) => setValueDay(Number(e.target.value))}
          >
            
            <MenuItem value={100000}>
              <em>Dia de la semana</em>
            </MenuItem>
            <MenuItem value={7}>
              <em>Lunes-Viernes</em>
            </MenuItem>
            <MenuItem value={8}>
              <em>Toda la semana</em>
            </MenuItem>
            {Object.entries(diasDeLaSemana).map(([dia, valor]) => (
              <MenuItem key={valor} value={valor}>
              {dia}
              </MenuItem>
            ))}
            
            
          </Select>
          </FormControl>
              
          </Box>
         

          <Box display="flex" flexDirection="row" padding="1rem" gap="1rem" width='auto'>
            <TextField
              fullWidth
              name="horario_a"
              label="Hora Apertura"
              defaultValue=""
              type="time"

              error={!!errors.horario_a}
              helperText={errors.horario_a}
              onChange={handleChange}
              value={valueForm.horario_a}

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
              name="horario_c"
              label="Hora Cierre"
              type="time"
              defaultValue=""

              error={!!errors.horario_c}
              helperText={errors.horario_c}
              onChange={handleChange}
              value={valueForm.horario_c}

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
          >Agregar Horario</Button>
        </Box>
    </Modal>
    )
  }
);
