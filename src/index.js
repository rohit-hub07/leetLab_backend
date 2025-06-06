import express from 'express';
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser'
import cors from 'cors'


import problemRoutes from './routes/problem.routes.js';
import executionRoute from './routes/executeCode.routes.js';
import submissionRoutes from './routes/submissionRoutes.routes.js';
import playlistRoutes from './routes/playlist.routes.js';

dotenv.config();
const app = express();


const allowedOrigins = ['http://localhost:5173', 'https://leet-lab-frontend-eta.vercel.app'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('/*splat', cors(corsOptions));


app.use(express.json());
app.use(cookieParser());


const port = process.env.PORT || 8080;

app.get("/", (req, res) =>{
  res.send("Hello guys! Welcome to leetlab");
})


app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/problems", problemRoutes)
app.use("/api/v1/execute-code", executionRoute)
app.use("/api/v1/submission", submissionRoutes)
app.use("/api/v1/playlist", playlistRoutes)

app.listen(port, () => {
  console.log(`App is listening on port: ${port}`)
}) 