import { useState } from 'react';

const useApi = (link) => {
  const [error, setError] = useState(null);

  const llamado = async (body, metodo) => {
    try {
      const fetchOptions = {
        method: metodo,
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const response = await fetch(link, fetchOptions);
      const data = await response.json();

      if (response.ok) {
        return data;
      }
      setError(data);
      return null; // Asegura un retorno en todos los casos
    } catch (err) {
      setError(err);
      return null;
    }
  };

  const llamadowithheader = async (headers, body, metodo) => {
    try {
      const fetchOptions = {
        method: metodo,
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(headers.map((header) => [header.title, header.value])),
        },
      };
      const response = await fetch(link, fetchOptions);
      const data = await response.json();

      if (response.ok) {
        return data;
      }
      setError(data);
      return null; // Asegura un retorno en todos los casos
    } catch (err) {
      setError(err);
      return null;
    }
  };

  const llamadowithheaderwithoutbody = async (headers, metodo) => {
    try {
      const fetchOptions = {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(headers.map((header) => [header.title, header.value])),
        },
      };
      const response = await fetch(link, fetchOptions);
      const data = await response.json();

      if (response.ok) {
        return data;
      }
      setError(data);
      return null; // Asegura un retorno en todos los casos
    } catch (err) {
      setError(err);
      return null;
    }
  };

  const llamadowithoutbody = async (metodo) => {
    try {
      const fetchOptions = {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const response = await fetch(link, fetchOptions);
      const data = await response.json();

      if (response.ok) {
        return data;
      }
      setError(data);
      return null; // Asegura un retorno en todos los casos
    } catch (err) {
      setError(err);
      return null;
    }
  };

  return {
    error,
    llamado,
    llamadowithoutbody,
    llamadowithheader,
    llamadowithheaderwithoutbody,
    setError,
  };
};

export default useApi;
