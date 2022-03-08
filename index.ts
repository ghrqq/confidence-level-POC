import express, { NextFunction } from "express";
import dotenv from "dotenv";
import { ErrorCodes } from "./errorMessages";

import { getTransactions } from "./routes/transactionRoutes";
import { Request, Response, Application } from "express";

dotenv.config();

const app: Application = express();
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get(
  "/api/transactions/:transactionId?:confidenceLevel?",
  async (req: Request, res: Response) => getTransactions(req, res)
);

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.status(404).send(ErrorCodes.fourOFour);
});


app.listen(process.env.PORT);

