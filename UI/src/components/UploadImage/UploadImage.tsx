import React, { forwardRef } from 'react';
import { Box, Button, Typography } from '@mui/material';

interface UploadImageProps {
  file: File | null;
  setFile: (file: File | null) => void;
}

export const UploadImage = forwardRef<HTMLDivElement, UploadImageProps>(
  ({ file, setFile }, ref) => {
    const handleFile = (file_give: File) => {
      setFile(file_give); // Set the file object
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file_given = files[0];
        handleFile(file_given);
      }
    };

    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        const file_given_that = files[0];
        handleFile(file_given_that);
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
          <input type="file" accept="image/*" hidden onChange={handleUpload} />
        </Button>
        {file && (
          <Box mt={2}>
            <Typography variant="subtitle1">{file.name}</Typography>
          </Box>
        )}
      </Box>
    );
  }
);
