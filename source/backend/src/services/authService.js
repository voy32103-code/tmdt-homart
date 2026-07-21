const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepo = require('../repositories/authRepository');

class AuthService {
  async login(username, password) {
    const admin = await authRepo.findAdminByUsername(username);
    if (!admin) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác');
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác');
    }

    const secretKey = process.env.JWT_SECRET || 'homemart-secret-key-super-secure-2026';
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      secretKey,
      { expiresIn: '2h' }
    );

    return {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role
      }
    };
  }
}

module.exports = new AuthService();
