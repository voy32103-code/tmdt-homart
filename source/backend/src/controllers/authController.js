const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const JWT_SECRET = process.env.JWT_SECRET || 'homemart-super-secret-key';

async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ tài khoản và mật khẩu.' });
  }

  try {
    const user = await prisma.adminUser.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác.' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác.' });
    }

    const userResponse = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(userResponse, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ token, user: userResponse });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi trên hệ thống.' });
  }
}

async function logout(req, res) {
  return res.json({ ok: true });
}

module.exports = {
  login,
  logout
};
