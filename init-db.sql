-- ====================================
-- TABLA PERSONAS
-- ====================================
CREATE TABLE IF NOT EXISTS Persons (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    alias VARCHAR(100),
    dob DATE,
    gender VARCHAR(10),
    nationality VARCHAR(50),
    state VARCHAR(100),
    municipality VARCHAR(100),
    community VARCHAR(100),
    id_number VARCHAR(50),
    photo_path VARCHAR(255),
    observaciones TEXT,
    privacy_notice BOOLEAN DEFAULT FALSE,
    privacy_notice_path TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ====================================
-- TABLA ARRESTOS
-- ====================================
CREATE TABLE IF NOT EXISTS Arrests (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES Persons(id),
    arrest_date TIMESTAMP DEFAULT NOW(),
    falta_administrativa VARCHAR(255),
    comunidad VARCHAR(255),
    arresting_officer VARCHAR(100),
    folio VARCHAR(100),
    rnd VARCHAR(100),
    sentencia TEXT
);

-- ====================================
-- TABLA DATOS FACIALES
-- ====================================
CREATE TABLE IF NOT EXISTS FacialData (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES Persons(id),
    embedding FLOAT8[],
    image_path VARCHAR(255),
    capture_date TIMESTAMP DEFAULT NOW(),
    camera_id VARCHAR(50)
);

-- ====================================
-- TABLA HUELLAS DIGITALES
-- ====================================
CREATE TABLE IF NOT EXISTS Fingerprints (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES Persons(id),
    template BYTEA,
    scan_date TIMESTAMP DEFAULT NOW(),
    finger VARCHAR(20)
);
