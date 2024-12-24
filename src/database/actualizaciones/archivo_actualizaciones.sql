CREATE TABLE users (
    id SERIAL PRIMARY KEY,          -- Identificador único
    name VARCHAR(50) NOT NULL,      -- Nombre del usuario
    email VARCHAR(100) UNIQUE,      -- Correo electrónico único
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Fecha de creación
);

CREATE TABLE users2 (
    id SERIAL PRIMARY KEY,          -- Identificador único
    name VARCHAR(50) NOT NULL,      -- Nombre del usuario
    email VARCHAR(100) UNIQUE,      -- Correo electrónico único
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Fecha de creación
);

