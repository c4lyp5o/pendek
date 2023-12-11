export const defaultSession = {
  id: '',
  username: '',
  isLoggedIn: false,
};

export const sessionOptions = {
  password: process.env.COOKIE_PASSWORD,
  cookieName: process.env.COOKIE_NAME,
  cookieOptions: {
    // secure only works in `https` environments
    // if your localhost is not on `https`, then use: `secure: process.env.NODE_ENV === "production"`
    secure: false,
  },
};

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
