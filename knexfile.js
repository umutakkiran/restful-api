require('dotenv').config(); // Çevresel değişkenleri .env dosyasından okumak için// knexfile.js

module.exports = {
    development: {
      client: "pg",
      connection: {
        host: process.env.REST_API_HOST,
        user: process.env.REST_API_USER,
        password: process.env.REST_API_PASSWORD,
        database: "",
        port: process.env.REST_API_PORT,
        ssl: {
          rejectUnauthorized: false
      }
      },
      migrations: {
        directory: './db/migrations' // Migrasyon dosyalarının bulunduğu dizin
      },
      seeds: {
        directory: './db/seeds' // Seed dosyalarının bulunduğu dizin (isteğe bağlı)
      }
    }
    // Diğer çevreler (production, test) için ayrı yapılandırmalar ekleyebilirsiniz.
  };
  