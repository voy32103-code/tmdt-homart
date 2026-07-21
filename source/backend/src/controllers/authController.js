const authService = require('../services/authService');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.validatedBody || req.body;
    const result = await authService.login(username, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

exports.logout = async (req, res) => {
  res.json({ message: 'Đăng xuất thành công' });
};
