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
import { ProductContent } from '../Models_Productos/ProductContent';
import { ProductDetailBox } from '../Models_Productos/ProductDetails';
import { PresentacionProduct } from '../Models_Productos/ProductPresentacion';


const steps = ['Agregar Producto','Agregar Presentaciones', 'Agregar Inventario'];

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
  setCall: (call:number) => void;
  handleClose: () => void;
  setValueProductId: (id:number) => void;
  id: number;
}

export const ModalStepperProducto: React.FC<ModalStepperProps> = ({
  open,
  handleClose,
  setCall,
  setValueProductId,
  id

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
            <ProductContent
              setValueProductId={setValueProductId}
              setCall={setCall}
              handleClick={handleNext}
            />
          </Box>
        );
      case 1:
        return (
          <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
            <PresentacionProduct
                id={id}
                setCall={setCall}
                handleClick={()=>{}}
            />
          </Box>
        );
      case 2:
        return (
          <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
            <ProductDetailBox
                id={id}
                setCall={setCall}
                handleClick={()=>{}}
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
         Agregar Productos
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
              A agregado todos los campos de un producto
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button onClick={() => {
                handleReset();
              }}>Nuevo Producto</Button>
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
                  Siguiente
                </Button>
              
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};
