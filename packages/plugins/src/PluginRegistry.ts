import type { PluginInterface, PluginContext, PluginResult } from './PluginInterface.js';

export class PluginRegistry {
  private readonly plugins = new Map<string, PluginInterface>();

  register(plugin: PluginInterface): void {
    this.plugins.set(plugin.name, plugin);
  }

  get(name: string): PluginInterface | undefined {
    return this.plugins.get(name);
  }

  async run(name: string, ctx: PluginContext): Promise<PluginResult> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      return { success: false, error: `Plugin '${name}' not registered` };
    }
    try {
      return await plugin.execute(ctx);
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  list(): string[] {
    return [...this.plugins.keys()];
  }
}
