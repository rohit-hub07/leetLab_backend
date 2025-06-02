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


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
)
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