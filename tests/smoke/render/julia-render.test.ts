import { assert, assertMatch } from "jsr:@std/assert";
import { join } from "jsr:@std/path";
import { existsSync } from "jsr:@std/fs/exists";

const isWindows = Deno.build.os === "windows";
function quartoCmd(): string {
  return isWindows ? "quarto.cmd" : "quarto";
}
function docs(path: string): string {
  return join("docs", path);
}

function renderQmd(
  file: string,
  args: string[] = [],
  cwd?: string,
): Deno.CommandOutput {
  const allArgs = ["render", file, ...args];
  const output = new Deno.Command(quartoCmd(), { args: allArgs, cwd })
    .outputSync();
  if (!output.success) {
    console.error("Render failed:");
    console.error("stdout:\n" + new TextDecoder().decode(output.stdout));
    console.error("stderr:\n" + new TextDecoder().decode(output.stderr));
    throw new Error(`quarto render ${file} failed`);
  }
  return output;
}

Deno.test("source ranges with includes", async () => {
  const dir = docs("smoke-all/julia");
  const input = join(dir, "source-ranges-test.qmd");
  renderQmd(input, ["--to", "markdown"]);

  const outputFile = join(dir, "source-ranges-test.md");
  assert(existsSync(outputFile), `Output file ${outputFile} should exist`);
  const content = await Deno.readTextFile(outputFile);

  // Verify source range annotations appear correctly
  assertMatch(content, /source-ranges-test\.qmd:15/m);
  assertMatch(content, /_included\.qmd:2/m);

  // Clean up
  try { Deno.removeSync(outputFile); } catch { /* ok */ }
});

Deno.test("engine reordering", () => {
  const dir = docs("smoke-all/engine-reordering/julia-engine");
  renderQmd("notebook.qmd", ["--to", "html"], dir);

  const outputFile = join(dir, "notebook.html");
  assert(existsSync(outputFile), `Output file ${outputFile} should exist`);

  // Clean up
  try { Deno.removeSync(outputFile); } catch { /* ok */ }
});
