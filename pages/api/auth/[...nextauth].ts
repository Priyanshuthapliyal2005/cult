import NextAuth from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

export default NextAuth(authOptions);