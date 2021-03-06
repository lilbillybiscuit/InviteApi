const cluster = require("cluster");
const totalCPUs =
  process.env.NODE_ENV === "production" ? require("os").cpus().length : 1;
  const maxAttempts = 1;
var attempts = 0;
if (cluster.isMaster) {
  console.log(`Master PID: ${process.pid}`);
  console.log(`Spawning ${totalCPUs} workers`);

  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    if (process.env.NODE_ENV === "production" || attempts < maxAttempts) {
      console.log(`Worker ${worker.process.pid} exited`);
      cluster.fork();
      attempts++;
    } else {
      console.log("Error, too many worker failures during debug");
      process.exit(0);
    }
  });
} else {
  var app = require("./app");
  app.listen();
}
