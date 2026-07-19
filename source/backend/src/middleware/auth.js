const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'homemart-super-secret-key';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Vui lòng đăng nhập hệ thống để thực hiện thao tác này.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.' });
    }
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Vui lòng đăng nhập tài khoản quản trị để thực hiện thao tác này.' });
    }
    next();
  });
}

module.exports = {
  authenticateToken,
  requireAdmin
};
