export interface User {
    id: number;
    username: string;
    email: string;
    role: 'USER' | 'ADMIN';
    enabled: boolean;
    profilePictureUrl?: string;
    bio?: string;
    followersCount?: number;
    followingCount?: number;
    postsCount?: number;
}

export interface AuthResponse {
    token: string;
}
