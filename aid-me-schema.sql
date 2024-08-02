CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO users (username, password, first_name, last_name, email, is_admin)
VALUES ('admin',
        '$2b$12$m0R/pEMYv41EEmcgPG3VWOLYRp8HUM.IyOl2tj4PRx3C2lEA1TkvG',
        'Admin',
        'Admin',
        'admin@admin.com',
        TRUE);


CREATE TABLE camps (
  id SERIAL PRIMARY KEY,
  location TEXT UNIQUE NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL
);

INSERT INTO camps (location, city, country)
VALUES ('Place Saint-Anne', 'PAP', 'Haiti'),
  ('Place Mosaulee', 'PAP', 'Haiti'),
  ('Parc Sainte-Therese', 'PV', 'Haiti');


CREATE TABLE people (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dob DATE NOT NULL,
  sex VARCHAR(1) NOT NULL,
  nid VARCHAR(4) UNIQUE NOT NULL
);

INSERT INTO people (first_name, last_name, dob, sex, nid)
VALUES ('John', 'Doe', '1-1-1980', 'm', '00-1'),
        ('John', 'Smith', '12-12-1989', 'm', '00-2'),
        ('Serena', 'Doe', '1-12-1990', 'f', '00-3'),
        ('Ilsa', 'Doe', '2-2-2000', 'f', '00-4'),
        ('Ezra', 'Doe', '3-3-2001', 'm', '00-5');


CREATE TABLE families (
  id SERIAL PRIMARY KEY,
  camp_id INTEGER
    REFERENCES camps ON DELETE CASCADE,
  head INTEGER UNIQUE NOT NULL
    REFERENCES people ON DELETE CASCADE
);

INSERT INTO families (camp_id, head)
VALUES (2, 1), (1, 2);


CREATE TABLE household (
  family_id INTEGER
    REFERENCES families ON DELETE CASCADE,
  person_id INTEGER
    REFERENCES people ON DELETE CASCADE,
  PRIMARY KEY (family_id, person_id)
);

INSERT INTO household (family_id, person_id)
VALUES (1, 1), (2, 2), (1, 3), (1, 4), (1, 5);


CREATE TABLE donations (
  id SERIAL PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target INTEGER NOT NULL,
  description TEXT NOT NULL
);

INSERT INTO donations (start_date, end_date, target, description)
VALUES ('2-1-2010', '2-2-2010', 1, 'Food Kit'),
  ('2-3-2010', '2-4-2010', 1, 'Clothes'),
  ('3-1-2010', '3-2-2010', 1, 'Food Kit');


CREATE TABLE distributions (
  donation_id INTEGER
    REFERENCES donations ON DELETE CASCADE,
  family_id INTEGER
    REFERENCES families ON DELETE CASCADE,
  receive BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (donation_id, family_id)
);

INSERT INTO distributions (donation_id, family_id)
VALUES (1,1), (1,2),
  (2,1), (2,2),
  (3,1), (3,2);
