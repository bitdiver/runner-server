import { Node, StepTree } from './StepTree'

interface SortNode {
  /** The incomming SortNode. If this is the root node it is undefined */
  incommingNode?: SortNode

  /** all the nodes in the same level */
  nodes: Node[]

  /** The outgoing Sort node */
  outgoingNode?: SortNode
}

/**
 * Sorts all the steps in the right order.
 */
export class StepSorter {
  /** The root Sort Node */
  sortRoot: SortNode

  /** A map which maps which step is in which sort node */
  nodeToSortNodeMap: Map<string, SortNode>

  /** The treeStep object which should be sorted */
  stepTree: StepTree

  constructor(stepTree: StepTree) {
    // create a start node with the root node
    this.sortRoot = {
      nodes: [stepTree.nodeTree]
    }

    this.nodeToSortNodeMap = new Map<string, SortNode>()

    this.stepTree = stepTree

    // add the root sort node to the map
    this.nodeToSortNodeMap.set(stepTree.nodeTree.stepName, this.sortRoot)
  }

  /**
   * Returns all the steps in the right order.
   * @returns stepNames - The step names in the right order
   */
  public getSteps(): string[] {
    this.stepTree.setLongestPathToRootForAllNodes()
    this.createSortNodeTree()
    return this.getStepNames()
  }

  /**
   * Returns all the steps in the right order
   * @returns stepNames - The names of the steps in the execution order
   */
  protected getStepNames(): string[] {
    const stepNames: string[] = []

    let currentNode = this.sortRoot

    while (currentNode.outgoingNode !== undefined) {
      for (const node of currentNode.outgoingNode.nodes) {
        stepNames.push(node.stepName)
      }
      currentNode = currentNode.outgoingNode
    }
    return stepNames
  }

  /**
   * Put all the nodes in one order.
   * Per order one SortNode is created. Each node with the same
   * order position is added to the same Sort node. Each SortNode
   * has only one predecessor and one successor.
   */
  protected createSortNodeTree(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    const nodeMap = this.stepTree.nodeMap

    for (const stepName of nodeMap.keys()) {
      const node = nodeMap.get(stepName) as Node
      if (!node.isStartNode) {
        addNodeToSortNode(node)
      }
    }

    function addNodeToSortNode(node: Node): void {
      const longestPathToRoot = node.longestPathToRoot as string[]
      const predecessorName = longestPathToRoot[0]

      // check if the node is already done
      if (!self.nodeToSortNodeMap.has(node.stepName)) {
        // get the Sort node of the predecessor
        if (!self.nodeToSortNodeMap.has(predecessorName)) {
          // the predecessor is not yet added. need to add this node first
          const predecessorNode = node.incomming.get(predecessorName) as Node
          addNodeToSortNode(predecessorNode)
        }
        const predecessorSortNode = self.nodeToSortNodeMap.get(
          predecessorName
        ) as SortNode
        if (predecessorSortNode.outgoingNode === undefined) {
          // create a new sort node and add it as outgoingNode
          predecessorSortNode.outgoingNode = {
            nodes: []
          }
        }
        predecessorSortNode.outgoingNode.nodes.push(node)
        self.nodeToSortNodeMap.set(
          node.stepName,
          predecessorSortNode.outgoingNode
        )
      }
    }
  }
}
