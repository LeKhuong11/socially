"use server"

import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { signInSchema } from "@/app/[locale]/signin/validation";
import { cookies } from "next/headers";
import { signUpSchema } from "@/app/[locale]/signup/validation";
// import { auth as authUntils } from "@/utils/auth"

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

    if(!user)
      return {
        errors: {
          email: ['Your email is not in the system!'],
        },
      }
  
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if(!isPasswordCorrect) 
      return {
        errors: {
          email: ['Wrong password!'],
        },
      }
        
    // await createCookie(user.id);
    return { 
      success: true, 
      user: user,
      message: "Login successfully!",
    };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to sign in" };
  }
}


export async function createCookie(userId: string) {
  const JWT_SECRET = process.env.JWT_SECRET as string;
  const ACCESS_TOKEN_DURATION = parseInt(process.env.ACCESS_TOKEN_DURATION || "3600", 10);
  const REFRESH_TOKEN_DURATION = parseInt(process.env.REFRESH_TOKEN_DURATION || "604800", 10);

  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_DURATION });
  const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_DURATION });

  const cookie = cookies()

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


export async function syncUser() {
    try {   
        const { userId } = await auth();
        const user = await currentUser();

        if(!user || !userId) return;

        const existingUser = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if(existingUser) return existingUser;

        const dbUser = await prisma.user.create({
            data: {
                name: `${user.firstName} ${user.lastName}`,
                username: user.username ?? user.emailAddresses[0].emailAddress.split('@')[0],  
                email: user.emailAddresses[0].emailAddress,
                image: user.imageUrl,
                password: await bcrypt.hash("123456", 10),
            }
        });

        return dbUser;
    } catch (error) {
        console.error(error);
    }
}


// export async function getUserByClerkId(userId: string) {
//     return await prisma.user.findUnique({
//         where: {
//             id: userId
//         },
//         include: {
//             _count: {
//                 select: {
//                     followers: true,
//                     following: true,
//                     posts: true,
//                 }
//             }
//         }
//     });
// }

export async function getDbUserId() {
    // const { userId: clerkId } = await auth();
    // if (!clerkId) return null;

    // const user = await getUserByClerkId(clerkId);

    // if(!user) throw new Error("User not found");
    // return user.id;

    // const accessToken = authUntils.getAccessToken();

    try {
      // const decoded = jwt.verify(accessToken, secretKey);
      const userId = 'decoded.userId'; // Trích xuất userId từ payload
      console.log('User ID:', userId);

      return userId
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