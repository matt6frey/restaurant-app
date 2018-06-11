// Comment this line in for Localhost
// require('dotenv').load();

module.exports = {

  development: {
    client: 'postgres',
    connection: {
      host     : process.env.DB_HOST,
      // host     : process.env.DATABASE_URL || process.env.DB_HOST,
      user     : process.env.DB_USER,
      password : process.env.DB_PASS,
      database : process.env.DB_NAME || 'midterm',
      port     : process.env.DB_PORT,
      ssl      : process.env.DB_SSL
    },
    migrations: {
      directory: './db/migrations',
      tableName: 'migrations'
    },
    seeds: {
      directory: './db/seeds'
    },
    pool: { min:0, max: 10 }
  },

  production: {
    client: 'postgres',
    connection: {
      host     : process.env.DATABASE_URL || process.env.DB_HOST,
      user     : process.env.DB_USER,
      password : process.env.DB_PASS,
      database : process.env.DB_NAME || 'midterm',
      port     : process.env.DB_PORT,
      ssl      : process.env.DB_SSL
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'migrations'
    }
  }

};
