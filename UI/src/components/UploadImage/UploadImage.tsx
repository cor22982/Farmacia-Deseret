import React, { forwardRef } from 'react';
import { Box, Button, Typography } from '@mui/material';

interface UploadImageProps {
  image: string | null;
  setImage: (image: string | null) => void;
}

export const UploadImage = forwardRef<HTMLDivElement, UploadImageProps>(
  ({ image, setImage }, ref) => {
    const handleFile = (file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImage(base64); // Actualiza el valor de la imagen en base64
      };
      reader.readAsDataURL(file);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        handleFile(file);
      }
    };

    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        handleFile(file);
      }
    };

    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        gap="1rem"
        ref={ref}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => e.preventDefault()}
        sx={{
          border: '2px dashed #000',
          padding: '5px',
          width: '100%',
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: '#f9f9f9',
        }}
      >
        <Typography variant="h5">Arrastre aquí la imagen</Typography>
        <Button variant="contained" color="inherit" component="label">
          O Búsquela en su Dispositivo
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleUpload}
          />
        </Button>
        {image && (
          <Box mt={2}>
            <img 
              src={image} 
              alt="Imagen cargada" 
              style={{
                width: '50rem', // Reducir tamaño de la imagen cargada
                maxHeight: '5rem', // Limitar altura de la imagen cargada
                objectFit: 'cover',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}/>
          </Box>
        )}
      </Box>
    );
  }
);
