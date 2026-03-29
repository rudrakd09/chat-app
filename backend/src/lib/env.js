import dotenv from "dotenv"
dotenv.config(); 

export const ENV  =  {
    PORT :  process.env.PORT || 3000,
    MONGODB_URL  :  process.env.MONGODB_URL,
    JWT_SECRET :  process.env.JWT_SECRET,
    NODE_ENV : process.env.NODE_ENV,
    RESEND_API_KEY: process.env.RESEND_API_KEY,

    EMAIL_FROM : process.env.EMAIL_FROM,
    EMAIL_FROM_NAME : process.env.EMAIL_FROM_NAME,
    CLIENT_URL : process.env.CLIENT_URL
}

// MONGODB_URL  = mongodb+srv://sohamn7805_db_user:mUlEw1L89ZYUfj4i@cluster0.zltikwo.mongodb.net/chatify_db?appName=Cluster0
// PORT  = 3000
// NODE_ENV = development
 
// JWT_SECRET = mysecretkey


// RESEND_API_KEY = re_7ARMNWJQ_6KvFCrirx5RzL6g5PoTLis1M

// EMAIL_FROM = "onboarding@resend.dev"
// EMAIL_FROM_NAME  =  "Soham Naukudkar"

// CLIENT_URL = http://localhost:3000
