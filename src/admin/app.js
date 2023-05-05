import favicon from "./extensions/favicon.png";
import auth from "./extensions/auth.png";

const config = {
  locales: ["pt-BR"],
  head: {
    favicon: favicon
  },
  auth: {
    logo: auth
  },
  menu: {
    logo: auth
  },
  tutorials: false,
  notifications: {
    releases: false
  }
};

const bootstrap = (app) => {
  console.log(app);
};

export default {
  config,
  bootstrap
};
