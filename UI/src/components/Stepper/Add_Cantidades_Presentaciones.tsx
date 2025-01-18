import * as React from 'react';
import {
  Modal,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
} from '@mui/material';

const steps = ['Agregar Presentaciones', 'Agregar Inventario'];

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
};

interface ModalStepperProps {
  open: boolean;
  handleClose: () => void;
}

export const ModalStepper: React.FC<ModalStepperProps> = ({
  open,
  handleClose,
}) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());

  const isStepOptional = (step: number) => false;

  const isStepSkipped = (step: number) => skipped.has(step);

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
            <Typography variant="body1" gutterBottom>
              Aquí puedes agregar presentaciones.
            </Typography>
            <Button variant="contained" color="primary">
              Botón de ejemplo
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
            <Typography variant="body1" gutterBottom>
              Aquí puedes agregar inventario.
            </Typography>
            <TextField
              label="Cantidad"
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
            />
          </Box>
        );
      default:
        return 'Paso desconocido';
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h5" component="h2" mb={2}>
          Agregar Presentaciones e Inventario
        </Typography>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => {
            const stepProps: { completed?: boolean } = {};
            const labelProps: { optional?: React.ReactNode } = {};
            if (isStepSkipped(index)) {
              stepProps.completed = false;
            }
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        {activeStep === steps.length ? (
          <>
            <Typography sx={{ mt: 2, mb: 1 }}>
              Todos los pasos completados. ¡Has terminado!
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button onClick={handleClose}>Cerrar</Button>
            </Box>
          </>
        ) : (
          <>
            <Box sx={{ mt: 3, mb: 1 }}>
              {renderStepContent(activeStep)}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Atrás
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button onClick={handleNext}>
                {activeStep === steps.length - 1 ? 'Terminar' : 'Siguiente'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};
