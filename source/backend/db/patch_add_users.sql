USE HomeMartDb;
GO

IF OBJECT_ID('dbo.users', 'U') IS NULL
BEGIN
  CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(64) NOT NULL,
    full_name NVARCHAR(180) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('admin', 'staff')),
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END;
GO

IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')
BEGIN
  INSERT INTO users (username, password_hash, full_name, role, status)
  VALUES ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', N'Quan tri vien', 'admin', 'active');
END;
GO
