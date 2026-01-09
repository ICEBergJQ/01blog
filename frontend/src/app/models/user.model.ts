export interface User {
    id: number;
    username: string;
    email: string;
    role: 'USER' | 'ADMIN';
    enabled: boolean;
}

export interface AuthResponse {
    token: string;
}