import * as esbuild from 'esbuild';
import pth from 'node:path';
import type { BuilderBundler, BuildOptions } from "@aulgn/types/builder";

export class AulgnEsbuild implements BuilderBundler<esbuild.BuildOptions> {
  private bundlerOptions: esbuild.BuildOptions;
  private cwd: string;
  private context?: esbuild.BuildContext;

  constructor(bundlerOptions?: esbuild.BuildOptions) {
    this.bundlerOptions = bundlerOptions || {};
    this.cwd = process.cwd();
  }

  async build(options: BuildOptions): Promise<void> {
    await esbuild.build(this.getBuildOptions(options));
  }

  async dev(options: BuildOptions): Promise<void> {
    this.context = await esbuild.context(this.getBuildOptions(options));
    await this.context.watch();
    await this.context.serve({
      servedir: ".",
      port: options.port || 3000
    });
  }

  async dispose(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
      this.context = undefined;
    }
  }

  getBuildOptions(options: BuildOptions): esbuild.BuildOptions {
    const outFile = pth.join(this.cwd, options.output.directory, pth.basename(options.entry));
    return {
      entryPoints: [pth.join(this.cwd, options.entry)],
      outfile: outFile,
      bundle: true,
      ...this.bundlerOptions
    }
  }
}
