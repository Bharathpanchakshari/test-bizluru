import express from "express";
import "dotenv/config";
import router from "./routes/index.js";
import morgan from "morgan";
import cors from "cors";

const app = express();

const port = process.env.PORT || 8000;
app.use(
  cors()
);
// app.get("/proxy-workos-request", async (req, res) => {
//   try {
//     const response = await fetch("https://api.workos.com/sso/authorize", {});

//     const data = await response.json();
//     res.json(data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

app.use("/public", express.static("public"));

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(morgan("dev"));

app.use("/", router);

app.listen(port, () => {
  console.log(`⚡️ [server]: Server is running at https://localhost:${port}`);
});
