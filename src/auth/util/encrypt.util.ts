import bcrypt from "bcrypt";
export const hashingString = async (password: string) => {
  const saltRound = 10;
  const salt = await bcrypt.genSalt(saltRound);
  return await bcrypt.hash(password, salt);
};
export const compareHash = async (a: string, b: string) => {
  return await bcrypt.compare(a, b);
};
