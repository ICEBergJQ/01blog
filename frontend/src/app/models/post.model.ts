export interface Post {
    id: number;
    content: string;
    mediaUrl?: string;
    mediaType?: string;
    timestamp: string;
    username: string;
    userId: number;
    hidden: boolean;
}
