import React, { forwardRef } from 'react';
import { Modal, Box } from '@mui/material';
import { Product } from 'src/_mock/product';
import useToken, { parseJwt } from 'src/hooks/useToken';
import InventarioUsuario from './InventarioUsuario';

import { ProductDetailBox } from '../Models_Productos/ProductDetails';

// Interface
interface ModalProductDetailProps {
  open: boolean;
  handleClose: () => void;
  setCall: (call: number) => void;
  product: Product | null;
}

// Estilos del modal
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

// Componente ModalUpdateProduct
export const ModalUpdateProduct = forwardRef<HTMLDivElement, ModalProductDetailProps>(
  ({ open, handleClose, product, setCall }, ref) => {
    const { token } = useToken();
    const jwt = token ? parseJwt(token) : null;
    const rol = jwt ? jwt.rol : null;
    return (
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} gap="0.1rem">
            {product && (
            <>
              {rol === 'admin' ? (
                <ProductDetailBox id={product.id} setCall={setCall} handleClick={() => {}} />
              ) : (
                <InventarioUsuario product={product} setCall={setCall} />
              )}
            </>
          )}
        </Box>
      </Modal>
    );
  }
);