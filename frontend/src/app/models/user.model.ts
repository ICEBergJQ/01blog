export interface User {
    id: number;
    username: string;
    email: string;
    role: 'USER' | 'ADMIN';
    enabled: boolean;
    profilePictureUrl?: string;
    bio?: string;
}

export interface AuthResponse {
    token: string;
}