import { Node } from '../../src/steps/StepTree'

/**
 * Creates a graph of the nodes from the StepTree
 * @param rootNode - The root node of the StepTree
 * @returns graph - A graph in DOT representation of all the nodes
 */
export function createStepTreeGraph(rootNode: Node): string {
  const nodesDone = new Set<string>()
  const lines: string[] = ['digraph G {']

  iterate(rootNode, lines)

  lines.push('}')
  return lines.join('\n')

  function iterate(node: Node, lines: string[]): void {
    if (!nodesDone.has(node.stepName)) {
      nodesDone.add(node.stepName)
      for (const outStepName of node.outgoing.keys()) {
        const outNode = node.outgoing.get(outStepName) as Node
        lines.push(`\t"${node.stepName}" -> "${outNode.stepName}"`)
        iterate(outNode, lines)
      }
    }
  }
}
