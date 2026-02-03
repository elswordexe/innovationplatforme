export interface User {
    id: number;
    fullname: string;
    email: string;
    role: string;
    organizationName?: string;
    profilePhotoUrl?: string;
}
