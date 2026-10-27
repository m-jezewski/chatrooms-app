import * as bcrypt from 'bcrypt';

export const getHashedPassword = (password: string) => {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
};

export const comparePasswords = (rawPassword: string, hash: string) => {
  return bcrypt.compareSync(rawPassword, hash);
};
