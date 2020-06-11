DROP TABLE IF EXISTS locations;

CREATE TABLE locations
(
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude DECIMAL(12,8),
  longitude DECIMAL(12,8)
);

-- INSERT INTO locations
--   (search_query)
-- VALUES
--   ('seattle'),
--   ('rockford'),
--   ('redmond');

