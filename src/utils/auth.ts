'use server';

import { cookies } from 'next/headers';

export const auth = {
    getAccessToken: async (): Promise<string | undefined> => {
        const cookieStore = cookies();
        return cookieStore.get('access_token')?.value;
    },
}
