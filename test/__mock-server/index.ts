// deno run --allow-read --allow-env --allow-net index.ts

import express, { NextFunction, Request, Response } from "npm:express@4.18.2";

const app = express();
const port = Number(Deno.env.get("PORT")) || 3002;

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(req.method, req.originalUrl);
  next();
});

app.get("/health", (_req: Request, res: Response) => {
  res.set("x-server", "dummy/1.0.0");
  res.status(200).send({
    name: "dummy-api",
    version: "1.0.0",
    uptime: 24 * 60 * 60,
  });
});

const handle = (statusCode = 200) => (_req: Request, res: Response) => {
  res.status(statusCode).send([
    {
      id: "61469a43-994f-40ab-a81f-e02ee40adf92",
      brand: "Simca",
      model: "Simca 1000",
      creationDate: "1961-04-13T15:16:53",
      weight: 720,
      maxSpeed: 120,
    },
  ]);
};

app.post("/cars", handle(201));
app.all("/cars", handle());

app.listen(port, () => {
  console.log(`Listening on ${port} ...`);
});
