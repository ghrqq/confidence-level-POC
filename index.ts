import express, { NextFunction } from "express";

import { ErrorCodes } from "./errorMessages";

import { getTransactions } from "./routes/transactionRoutes";
import { Request, Response, Application } from "express";

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

let port: number | string = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);
