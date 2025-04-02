'use server';

import { getUserById } from '@/actions/user.action';
import { User } from '@prisma/client';
import { Omit } from '@prisma/client/runtime/library';
import { cookies } from 'next/headers';

export const auth = {
    getAccessToken: async (): Promise<string | undefined> => {
        const cookieStore = cookies();
        return cookieStore.get('access_token')?.value;
    },

    getCurrentUser: async (id: string): Promise<Omit<User, 'password'> | null> => {
        const cookieStore = cookies();
        const accessToken = cookieStore.get('access_token')?.value;
        if (!accessToken) return null;

        try {
            const user = await getUserById(id);
            if (!user) return null;
            return user;
        } catch (error) {
            console.error('Error fetching current user:', error);
            return null;
        }
    }
}
