import assert from "node:assert";
import test from "node:test";
import nginx from "nginx-dist";

test("nginx should respond to requests after running", async () => {
  const server = await nginx();
  const response = await fetch("http://127.0.0.1:8080/package.json").then((res) =>
    res.json()
  );
  assert.equal(response.type, "module");
  await server.stop();
});
