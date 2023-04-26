CREATE TABLE IF NOT EXISTS countries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255)
);

CREATE INDEX ON countries (name);

INSERT INTO
  countries (name)
VALUES
  ('Afghanistan'),
  ('Albania'),
  ('Algeria'),
  ('Andorra'),
  ('Angola'),
  ('Antigua and Barbuda'),
  ('Argentina'),
  ('Armenia'),
  ('Australia'),
  ('Austria'),
  ('Azerbaijan'),
  ('Bahamas'),
  ('Bahrain'),
  ('Bangladesh'),
  ('Barbados'),
  ('Belarus'),
  ('Belgium'),
  ('Belize'),
  ('Benin'),
  ('Bhutan'),
  ('Bolivia'),
  ('Bosnia and Herzegovina'),
  ('Botswana'),
  ('Brazil'),
  ('Brunei'),
  ('Bulgaria'),
  ('Burkina Faso'),
  ('Burundi'),
  ('Cabo Verde'),
  ('Cambodia'),
  ('Cameroon'),
  ('Canada'),
  ('Central African Republic (CAR)'),
  ('Chad'),
  ('Chile'),
  ('China'),
  ('Colombia'),
  ('Comoros'),
  ('Democratic Republic of the Congo'),
  ('Republic of the Congo'),
  ('Costa Rica'),
  ('Cote d''Ivoire'),
  ('Croatia'),
  ('Cuba'),
  ('Cyprus'),
  ('Czech Republic'),
  ('Denmark'),
  ('Djibouti'),
  ('Dominica'),
  ('Dominican Republic'),
  ('Ecuador'),
  ('Egypt'),
  ('El Salvador'),
  ('Equatorial Guinea'),
  ('Eritrea'),
  ('Estonia'),
  ('Ethiopia'),
  ('Fiji'),
  ('Finland'),
  ('France'),
  ('Gabon'),
  ('Gambia'),
  ('Georgia'),
  ('Germany'),
  ('Ghana'),
  ('Greece'),
  ('Grenada'),
  ('Guatemala'),
  ('Guinea'),
  ('Guinea-Bissau'),
  ('Guyana'),
  ('Haiti'),
  ('Honduras'),
  ('Hungary'),
  ('Iceland'),
  ('India'),
  ('Indonesia'),
  ('Iran'),
  ('Iraq'),
  ('Ireland'),
  ('Israel'),
  ('Italy'),
  ('Jamaica'),
  ('Japan'),
  ('Jordan'),
  ('Kazakhstan'),
  ('Kenya'),
  ('Kiribati'),
  ('Kosovo'),
  ('Kuwait'),
  ('Kyrgyzstan'),
  ('Laos'),
  ('Latvia'),
  ('Lebanon'),
  ('Lesotho'),
  ('Liberia'),
  ('Libya'),
  ('Liechtenstein'),
  ('Lithuania'),
  ('Luxembourg'),
  ('Macedonia (FYROM)'),
  ('Madagascar'),
  ('Malawi'),
  ('Malaysia'),
  ('Maldives'),
  ('Mali'),
  ('Malta'),
  ('Marshall Islands'),
  ('Mauritania'),
  ('Mauritius'),
  ('Mexico'),
  ('Micronesia'),
  ('Moldova'),
  ('Monaco'),
  ('Mongolia'),
  ('Montenegro'),
  ('Morocco'),
  ('Mozambique'),
  ('Myanmar (Burma)'),
  ('Namibia'),
  ('Nauru'),
  ('Nepal'),
  ('Netherlands'),
  ('New Zealand'),
  ('Nicaragua'),
  ('Niger'),
  ('Nigeria'),
  ('North Korea'),
  ('Norway'),
  ('Oman'),
  ('Pakistan'),
  ('Palau'),
  ('Palestine'),
  ('Panama'),
  ('Papua New Guinea'),
  ('Paraguay'),
  ('Peru'),
  ('Philippines'),
  ('Poland'),
  ('Portugal'),
  ('Qatar'),
  ('Romania'),
  ('Russia'),
  ('Rwanda'),
  ('Saint Kitts and Nevis'),
  ('Saint Lucia'),
  ('Saint Vincent and the Grenadines'),
  ('Samoa'),
  ('San Marino'),
  ('Sao Tome and Principe'),
  ('Saudi Arabia'),
  ('Senegal'),
  ('Serbia'),
  ('Seychelles'),
  ('Sierra Leone'),
  ('Singapore'),
  ('Slovakia'),
  ('Slovenia'),
  ('Solomon Islands'),
  ('Somalia'),
  ('South Africa'),
  ('South Korea'),
  ('South Sudan') 
  ON CONFLICT DO NOTHING;