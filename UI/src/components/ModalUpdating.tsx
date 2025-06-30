import React, { forwardRef, useEffect, useState } from 'react';
import {
  Modal,
  Typography,
  Box,
  LinearProgress,
  Paper,
  Alert,
} from '@mui/material';
import useToken from 'src/hooks/useToken';
import useApi from 'src/hooks/useApi';
import source_link from 'src/repository/source_repo';

interface ModalUpdatingProps {
  open: boolean;
  handleClose: () => void;
  handleClick: () => void;
}

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
};

export const ModalUpdating = forwardRef<HTMLDivElement, ModalUpdatingProps>(
  ({ open, handleClose, handleClick }, ref) => {
    const [progreso, setProgreso] = useState({ message: '', percent: 0 });
    const [desplegando, setDesplegando] = useState(false);
    const [completo, setCompleto] = useState(false);
    const { llamado, error, setError } = useApi(`${source_link}/deploy`);
    const { token } = useToken();

    // Llamar iniciarDeploy cuando se abre el modal
    useEffect(() => {
      if (open) {
        iniciarDeploy();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Lógica SSE
    useEffect(() => {
      if (!desplegando) return;

      const es = new EventSource(`${source_link}/deploy-events`);

      es.onmessage = (e) => {
        const data = JSON.parse(e.data);
        setProgreso(data);
        if (data.percent === 100) {
          setCompleto(true);
          es.close();
        }
      };

      es.onerror = () => {
        es.close();
        // setError('No se pudo conectar al backend para monitorear el despliegue.');
        setDesplegando(false);
      };
      
      // eslint-disable-next-line consistent-return
      return () => {
         es.close();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [desplegando]);

    const iniciarDeploy = async () => {
      setError(null);
      setCompleto(false);
      setDesplegando(true);
      setProgreso({ message: 'Enviando solicitud...', percent: 0 });

      handleClick();

      const resp = await llamado({ token }, 'POST');

      if (!resp) {
        setDesplegando(false);
        setProgreso({ message: '', percent: 0 });
      }
    };

    return (
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Paper sx={style} ref={ref}>
          <Box display="flex" justifyContent="center">
            <Typography id="modal-modal-title" variant="h4">
              ACTUALIZANDO PROGRAMA
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {completo && (
            <Alert severity="success" sx={{ mt: 2 }}>
              ¡Despliegue finalizado correctamente!
            </Alert>
          )}

          {desplegando && (
            <>
              <Typography variant="body2" sx={{ mt: 3, mb: 1 }}>
                {progreso.message}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progreso.percent}
                  />
                </Box>
                <Box sx={{ minWidth: 40 }}>
                  <Typography variant="body2" color="text.secondary">
                    {`${Math.round(progreso.percent)}%`}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Modal>
    );
  }
);
