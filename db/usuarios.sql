CREATE DATABASE auth_db;
USE auth_db;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    foto_url VARCHAR(255),
    rol ENUM('cliente', 'admin') DEFAULT 'cliente',
    verificado BOOLEAN DEFAULT FALSE,
    token_verificacion VARCHAR(255),
    INDEX(correo)
);

SELECT * FROM usuarios;

TRUNCATE auth_db.usuarios;

update usuarios set rol='admin' where id=1;

delete from usuarios where id = 5;