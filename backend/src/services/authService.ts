import { prisma } from '../config/prisma';
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AuthUser, UserRole } from '../types/auth';

export class AuthService {
  static async login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      createdAt: user.createdAt,
    };

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    });

    return { token, user: authUser };
  }

  static async getCurrentUser(userId: string): Promise<AuthUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      createdAt: user.createdAt,
    };
  }
}
