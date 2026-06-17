import { Injectable, INestApplication } from '@nestjs/common';
import { SpelunkerModule } from 'nestjs-spelunker';
import * as fs from 'node:fs';

@Injectable()
export class AppGraphService {
  private readonly isEnabled: boolean;

  constructor() {
    // Enable/disable based on environment variable or configuration
    this.isEnabled =
      process.env.ENABLE_APP_GRAPH === 'true' ||
      process.env.NODE_ENV === 'development';
  }

  /**
   * Generates a mermaid graph of the application module dependencies
   * @param app - The NestJS application instance
   * @param outputPath - Optional path to save the graph file (default: 'app.module.mmd')
   * @returns The mermaid graph string or null if disabled
   */
  generateAppGraph(
    app: INestApplication,
    outputPath: string = 'app.module.mmd',
  ): string | null {
    if (!this.isEnabled) {
      return null;
    }

    try {
      const tree = SpelunkerModule.explore(app);
      const root = SpelunkerModule.graph(tree);
      const edges = SpelunkerModule.findGraphEdges(root);

      let graph = 'graph LR\n';
      edges.forEach(({ from, to }) => {
        graph += `  ${from.module.name} --> ${to.module.name}\n`;
      });

      // Save to file
      fs.writeFileSync(outputPath, graph);

      return graph;
    } catch (error) {
      console.error('Error generating app graph:', error);
      return null;
    }
  }

  /**
   * Check if graph generation is enabled
   */
  isGraphGenerationEnabled(): boolean {
    return this.isEnabled;
  }
}
