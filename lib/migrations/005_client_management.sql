-- CMCS Client Management
-- Client records are shared by operations and finance workflows.

CREATE SEQUENCE IF NOT EXISTS client_id_sequence START 1;

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id VARCHAR(20) UNIQUE NOT NULL DEFAULT (
    'CLT-' || to_char(CURRENT_DATE, 'YYYY') || '-' ||
    lpad(nextval('client_id_sequence')::text, 4, '0')
  ),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  client_type VARCHAR(20) NOT NULL DEFAULT 'Company'
    CHECK (client_type IN ('Individual', 'Company', 'Organization')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS clients_name_unique
  ON clients (lower(name))
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS clients_email_unique
  ON clients (lower(email))
  WHERE email IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS clients_type_idx ON clients(client_type);
CREATE INDEX IF NOT EXISTS clients_created_at_idx ON clients(created_at DESC);

CREATE TABLE IF NOT EXISTS project_clients (
  project_id VARCHAR(100) PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS project_clients_client_idx
  ON project_clients(client_id);

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_clients_updated_at ON project_clients;
CREATE TRIGGER update_project_clients_updated_at BEFORE UPDATE ON project_clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO permissions (name, description, category) VALUES
  ('view_clients', 'View client information', 'clients'),
  ('manage_clients', 'Create and edit client records', 'clients')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name = 'view_clients'
WHERE r.name IN (
  'CEO / Founder Manager',
  'Head of Operations',
  'Finance Officer'
)
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name = 'manage_clients'
WHERE r.name IN ('CEO / Founder Manager', 'Head of Operations')
ON CONFLICT DO NOTHING;
