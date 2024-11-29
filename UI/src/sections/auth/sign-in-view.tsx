import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import { CircularProgress } from "@mui/material";
import Swal from "sweetalert2";
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import { md5 } from "js-md5";
import { useRouter } from 'src/routes/hooks';
import source_link from 'src/repository/source_repo';
import useApi from 'src/hooks/useApi';
import useToken from 'src/hooks/useToken';
import { Iconify } from 'src/components/iconify';
import useForm from 'src/hooks/useForm';
import { object, string } from 'yup';

const schema = object({
  username: string().required('El nombre es obligatorio'),
  password: string().required('El contraseña es obligatoria'),

})

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();
  const { values, setValue, validate, errors } = useForm(schema, { username: '', password: '' })
  const {llamado} = useApi(`${source_link}/login`)
  const { setToken } = useToken();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValue(name as keyof typeof values, value); // Usa type assertion
  };
  
  
  const handleSignIn = useCallback(async() => {
    const isValid = await validate();
    if (isValid) {
      const body = {
        username: values.username,
        password: md5(values.password)
      };
      const response = await llamado(body, 'POST');
      if (response) {
        if (response.success === true){
          Swal.fire({
            icon: "success",
            title: "Se inicio Sesion",
            text: "Se inicio sesion correctamente",
          });
          setToken(response.acces_token);
          setLoading(true)
          router.push('/');
        }else{
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "El usuario o contraseña no son validas",
          });
        }
      }else{
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "El usuario o contraseña no son validas",
        });
      }
      
      
      
    }
  }, [router, validate, values, llamado, setToken]);

  const renderForm = (
    <Box display="flex" flexDirection="column" alignItems="flex-end">
      <TextField
        fullWidth
        name="username"
        label="Usuario"
        defaultValue=""
        error={!!errors.username}
        helperText={errors.username}
        onChange={handleChange}
        value={values.username}
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 3 }}
      />

      <TextField
        fullWidth
        name="password"
        label="Contraseña"
        defaultValue=""
        InputLabelProps={{ shrink: true }}
        type={showPassword ? 'text' : 'password'}
        value={values.password}
        onChange={handleChange}
        error={!!errors.password}
        helperText={errors.password}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        onClick={handleSignIn}
      >
        Iniciar Sesion
      </LoadingButton>
    </Box>
  );

  return (
    <>
      {loading ? (
      <CircularProgress/>
      ) : (
       <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h5">Iniciar Sesión Farmacia</Typography>
        {renderForm}
        </Box>
      )}
        
    </>
  );
}
