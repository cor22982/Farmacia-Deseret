import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import { RouterLink } from 'src/routes/components';
import { Iconify } from 'src/components/iconify';
import { Button, Typography, Chip } from '@mui/material';
import { useState } from 'react';

// ----------------------------------------------------------------------

type Props = BoxProps & {
  totalItems: number;
  precio: number;
  onOpenFilter: () => void;
  onSetCarrito: () => void;
  isCarrito: boolean;
};

export function CartIcon({ precio, isCarrito, onOpenFilter, onSetCarrito, totalItems, sx, ...other }: Props) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNewCarrito = () => {
    // Activar la animación
    setIsAnimating(true);
    
    // Ejecutar la función original
    onSetCarrito();
    
    // Desactivar la animación después de que termine
    setTimeout(() => {
      setIsAnimating(false);
    }, 600); // Duración de la animación
  };

  return (
    <Box
      component={RouterLink}
      href="#"
      sx={{
        right: 0,
        top: 80,
        gap: '1rem',
        zIndex: 999,
        display: 'flex',
        cursor: 'pointer',
        position: 'fixed',
        color: 'text.primary',
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
        bgcolor: 'background.paper',
        padding: (theme) => theme.spacing(1, 3, 1, 2),
        boxShadow: (theme) => theme.customShadows.dropdown,
        transition: (theme) => theme.transitions.create(['opacity']),
        '&:hover': { opacity: 0.72 },
        ...sx,
      }}
      {...other}
    >
      {!isCarrito ? (
        // Mostrar el chip cuando no hay carrito
        <Chip label="No se encontró ningún carrito" color="error" />
      ) : (
        <Box
          onClick={() => onOpenFilter()}
          display="flex"
          flexDirection="row"
          gap="1rem"
          sx={{
            '&:hover': {
              opacity: 0.5,
              filter: 'brightness(0.5)',
            },
          }}
        >
          <Badge 
            showZero 
            badgeContent={totalItems} 
            color="error" 
            max={99}
            sx={{
              // Animación de sacudida
              animation: isAnimating ? 'cartShake 0.6s ease-in-out' : 'none',
              '@keyframes cartShake': {
                '0%, 100%': {
                  transform: 'translateX(0)',
                },
                '10%, 30%, 50%, 70%, 90%': {
                  transform: 'translateX(-3px)',
                },
                '20%, 40%, 60%, 80%': {
                  transform: 'translateX(3px)',
                },
              },
            }}
          >
            <Iconify 
              icon="map:grocery-or-supermarket" 
              width={24}
              sx={{
                // Animación adicional de escala para el icono
                transform: isAnimating ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.3s ease-in-out',
              }}
            />
          </Badge>
          <Typography variant="h5">Total: Q {precio}</Typography>
        </Box>
      )}

      <Button 
        onClick={handleNewCarrito}
        sx={{
          // Animación del botón al hacer hover
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
      >
        Nuevo Carrito
        <Iconify icon="ph:plus-fill" width={24} />
      </Button>
    </Box>
  );
}