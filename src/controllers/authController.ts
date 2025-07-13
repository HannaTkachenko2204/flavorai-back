import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prismaClient';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwtUtils';

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hash } });
    res.status(201).json({ id: user.id, email: user.email });
  } catch {
    res.status(400).json({ message: 'User already exists' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true, // обов'язково, якщо бекенд на HTTPS
    sameSite: 'none', // дозволяє крос-доменні куки
    maxAge: 24 * 60 * 60 * 1000, // 1 день
  });

  res.json({ token: accessToken, user: { id: user.id, email: user.email } });
};

export const refreshToken = (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const payload = verifyRefreshToken(token);
    const accessToken = generateAccessToken(payload.userId);
    res.json({ token: accessToken });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};
