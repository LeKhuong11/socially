"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { signInSchema } from "@/app/[locale]/signin/validation";
import { cookies } from "next/headers";
import { signUpSchema } from "@/app/[locale]/signup/validation";

interface DecodedToken {
  userId: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function signIn(formData: FormData) {
  try {
    const validatedFields = signInSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { email, password } = validatedFields.data

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user)
      return {
        errors: {
          email: ['Your email is not in the system!'],
        },
      }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return {
        errors: {
          email: ['Wrong password!'],
        },
      }

    await createCookie(user.id);
    return {
      success: true,
      user: user,
      message: "Sign in successfully!",
    };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to sign in" };
  }
}

export async function signInWithGoogle(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const username = formData.get('username') as string;
    const name = formData.get('name') as string;
    const avatar = formData.get('avatar') as string;

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      await createCookie(user.id);
    } else {
      const newUser = await prisma.user.create({
        data: {
          email,
          username,
          name,
          password: '',
          image: avatar,
        },
      });

      await createCookie(newUser.id);
      user = newUser;
    }

    return {
      success: true,
      user: user,
      message: "Sign in successfully!",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      user: null,
      message: "Server error. Please try again!",
    };
  }
}

export async function createCookie(userId: string) {
  const ACCESS_TOKEN_DURATION = parseInt(process.env.ACCESS_TOKEN_DURATION || "3600", 10);
  const REFRESH_TOKEN_DURATION = parseInt(process.env.REFRESH_TOKEN_DURATION || "604800", 10);

  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_DURATION });
  const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_DURATION });

  const cookie = await cookies()

  cookie.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: parseInt(process.env.ACCESS_TOKEN_DURATION || "3600", 10),
  });

  cookie.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: parseInt(process.env.REFRESH_TOKEN_DURATION || "604800", 10),
  });
}

export async function signUp(formData: FormData) {
  try {
    const validatedFields = signUpSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    })

    // Return errors if there are any
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { name, email, password } = validatedFields.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return {
        errors: {
          email: ['User with this email already exists'],
        },
      }
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10)
    await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        username: email.split('@')[0],
      },
    })

    return {
      success: true,
      message: "Sign up successfully!",
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Sign-up fail. Please try again 123123!", error: "Failed to sign up" };
  }
}

export async function getUserById(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id },
      omit: { password: true },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          }
        }
      }
    });
  } catch (error) {
    console.error(error);
  }
}

export async function getUserFromToken() {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('access_token')?.value as string;

    if (!accessToken) return null;
    const decoded = jwt.verify(accessToken, JWT_SECRET) as DecodedToken;

    const user = await getUserById(decoded.userId);
    if (!user) return null;

    return user;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

export async function getDbUserId() {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('access_token')?.value as string;
    if (!accessToken) return null;
    const decoded = jwt.verify(accessToken, JWT_SECRET) as jwt.JwtPayload;

    return decoded.userId;
  } catch (err) {
    console.error('Token không hợp lệ hoặc đã hết hạn:', err);
  }
}

export async function getRandomUsers() {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("User ID is null");

    const randomUser = await prisma.user.findMany({
      where: {
        AND: [
          {
            NOT: {
              id: userId as string
            }
          },
          {
            NOT: {
              followers: {
                some: {
                  followerId: userId as string
                }
              }
            }
          },
        ]
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          }
        }
      },
      take: 3,
    })

    return randomUser;
  } catch (error) {
    console.error(error);
    return [];
  }
}


export async function toggleFollow(targetUserId: string) {

  try {
    const userId = await getDbUserId();

    if (!userId) return;

    if (userId === targetUserId) throw new Error("You cannot follow yourself");

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // unfollow
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      // follow
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        }),

        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetUserId, // user being followed
            creatorId: userId, // user following
          },
        }),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.log("Error in toggleFollow", error);
    return { success: false, error: "Error toggling follow" };
  }
}