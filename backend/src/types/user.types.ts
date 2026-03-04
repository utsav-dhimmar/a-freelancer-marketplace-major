/**
 * User registration data
 */
export interface CreateUserData {
  username: string;
  fullname: string;
  email: string;
  password: string;
  role?: 'client' | 'admin' | 'freelancer';
  profilePicture?: string;
}
