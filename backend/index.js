import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDb from "./db/db.js";
import authRouter from "./routes/auth.routes.js";
import repoRouter from "./routes/repo.routes.js";
import AnalysisRouter from "./routes/Analysis.routes.js";
import AiRequestRouter from "./routes/AiRequest.routes.js";
import fileRouter from "./routes/file.routes.js";
import dependencyRouter from "./routes/dependency.routes.js";
import chatRouter from "./routes/chat.routes.js";

dotenv.config();
const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.get("/", (req, res) => {
  res.send("hii kaise ho");
});

app.use("/api/auth", authRouter);
app.use("/api/repo", repoRouter);
app.use("/api/Analysis", AnalysisRouter);
app.use("/api/AiRequest", AiRequestRouter);
app.use("/api/file", fileRouter);
app.use("/api/dependency", dependencyRouter);
app.use("/api/chat", chatRouter);

app.listen(PORT, () => {
  connectDb();
  console.log(`server is running at ${PORT}`);
});
