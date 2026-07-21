const prisma = require('../config/prisma');

class AuthRepository {
  async findAdminByUsername(username) {
    return prisma.adminUser.findUnique({
      where: { username }
    });
  }
}

module.exports = new AuthRepository();
