module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: '0.0.0.0',
        port: 1025,
        ignoreTLS: true,
      },
    },
  },
});