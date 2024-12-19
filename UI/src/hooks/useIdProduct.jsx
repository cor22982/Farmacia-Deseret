import { useState, useEffect, createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

// Contexto para el manejo del ID del carro
const CarIdContext = createContext({
  carId: null,
  setCarId: (value) => {},
});

const CarIdProvider = ({ children }) => {
  const [carId, setCarId] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedCarId = localStorage.getItem('car_id');
      return storedCarId !== null ? storedCarId : '1'; // Valor predeterminado: '1'
    }
    return '1'; // Valor predeterminado: '1'
  });

  // Sincroniza el carId con localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (carId) {
        localStorage.setItem('car_id', carId);
      } else {
        localStorage.removeItem('car_id');
      }
    }
  }, [carId]);

  const contextValue = useMemo(() => ({ carId, setCarId }), [carId]);

  return (
    <CarIdContext.Provider value={contextValue}>
      {children}
    </CarIdContext.Provider>
  );
};

CarIdProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Hook para usar el contexto del ID del carro
const useCarId = () => useContext(CarIdContext);

export default useCarId;
export { CarIdContext, CarIdProvider };
