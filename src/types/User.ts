type User = {
  id?: number;
  googleId?: string;
  githubId?: string;
  email?: string;
  emailVerified?: boolean;
  accountActive?: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImage?: string;
};

export default User;
