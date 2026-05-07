import bcrypt from "bcryptjs";


export function hashPassword(password: string) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

export function comparePassword(password: string, hash: string) {
    const isValid = bcrypt.compareSync(password, hash);
    return isValid;
}