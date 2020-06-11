DROP TABLE IF EXISTS locations;

CREATE TABLE locations
(
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  latitude DECIMAL(8,7),
  longitude DECIMAL(9,7)
);


