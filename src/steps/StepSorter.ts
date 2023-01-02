/** The artificial name for the root node */
const ROOT_NODE_NAME = '___ROOT_NODE___'

export interface Node {
  /** The name of the step which is the unique Id for the node */
  stepName: string

  /** A reference to all the incomming Nodes */
  incomming: Map<string, Node>

  /** A reference to all the outgoing Nodes */
  outgoing: Map<string, Node>

  /** True, if this is the start node */
  isStartNode: boolean

  /** stores the longest path to the root node */
  longestPathToRoot?: string[]

  /** When the node are ordered, this is the node before this node  */
  predecessorNode?: Node

  /** When the node are ordered, this is the node after this node  */
  successorNode?: Node
}

/**
 * Sorts all the steps in the right order.
 */
export class StepSorter {
  /** The start node of the node tree */
  nodeTree: Node

  /** Stores alle the node which are already existing by there stepNames  */
  nodeMap: Map<string, Node>

  constructor() {
    // create a start node with no elements
    this.nodeTree = createEmptyNode('', true)
    this.nodeMap = new Map<string, Node>()
  }

  /**
   * Checks if one of the new steps does already exists in the existing steps.
   * If there is no
   * @param stepNames - An array of step names to be added
   */
  public add(stepNames: string[]): void {
    // When false, then the created node chain needs to be connected to the start
    // node
    let isConnected = false
    let firstNode: Node | undefined
    let lastNode: Node | undefined

    for (const stepName of stepNames) {
      // The node for the current step name
      let newNode: Node
      if (this.nodeMap.has(stepName)) {
        // The node already exists
        newNode = this.nodeMap.get(stepName) as Node
        isConnected = true
      } else {
        // create a new empty node
        newNode = createEmptyNode(stepName)
        this.nodeMap.set(stepName, newNode)
      }

      if (firstNode === undefined) {
        firstNode = newNode
      }

      // we need to check that also following nodes do not have this step name
      if (
        lastNode !== undefined &&
        !checkIfNodeIsAlreadyConnected({ lastNode, stepName })
      ) {
        this.connectNodes({ sourceNode: lastNode, targetNode: newNode })
      }
      lastNode = newNode
    }

    if (!isConnected && firstNode !== undefined) {
      // Connect the start node with this node chain
      this.connectNodes({ sourceNode: this.nodeTree, targetNode: firstNode })
    }
  }

  /**
   * Connects two nodes with each other
   * @param request - The source node and the target node
   */
  protected connectNodes(request: {
    sourceNode: Node
    targetNode: Node
  }): void {
    const { sourceNode, targetNode } = request
    sourceNode.outgoing.set(targetNode.stepName, targetNode)
    targetNode.incomming.set(sourceNode.stepName, sourceNode)
  }

  /**
   * Each node which has no incomming connection needs to be connected with the
   * root node. Go over all nodes and check if incomming connections are defined.
   *
   */
  protected connectDanglingStartSteps(): void {
    for (const stepName of this.nodeMap.keys()) {
      const node = this.nodeMap.get(stepName)
      if (node?.incomming.size === 0) {
        // This node has no incomming connections.
        this.connectNodes({ sourceNode: this.nodeTree, targetNode: node })
      }
    }
  }

  /**
   * Returns all the steps in the right order. This method mus only be called after all
   * the steps are added
   * @returns stepname - The step names in the right order
   */
  public getSteps(): string[] {
    this.connectDanglingStartSteps()
    cleanupRootNode(this.nodeTree)
    this.setLongestPathToRootForAllNodes()
    this.orderNodes()
    return this.getOrderedStepNames()
  }

  /**
   * returns an array with all the steps in the right order
   * @returns stepNames - The names of all the steps in the right order
   */
  protected getOrderedStepNames(): string[] {
    const stepNames: string[] = []

    let currentNode = this.nodeTree.successorNode
    while (currentNode !== undefined) {
      stepNames.push(currentNode.stepName)
      currentNode = currentNode.successorNode
    }

    return stepNames
  }

  /**
   * Put all the nodes in one order.
   *
   */
  protected orderNodes(): void {
    debugger
    for (const stepName of this.nodeMap.keys()) {
      const node = this.nodeMap.get(stepName) as Node
      if (node.predecessorNode === undefined) {
        // this node is not yet ordered.
        // get the predecessor step name
        const longestPathToRoot = node.longestPathToRoot as string[]
        const predecessorStepName = longestPathToRoot[0]

        let predecessorNode = this.nodeMap.get(predecessorStepName) as Node
        if (predecessorStepName === ROOT_NODE_NAME) {
          predecessorNode = this.nodeTree
        }
        insertNodeInOrder(node, predecessorNode)
      }
    }
  }

  protected setLongestPathToRootForAllNodes(): void {
    for (const stepName of this.nodeMap.keys()) {
      const node = this.nodeMap.get(stepName) as Node
      if (node.longestPathToRoot === undefined) {
        // This node has no pathToRoot, create it
        createLongestPathToRoot({ node, nodeMap: this.nodeMap })
      }
    }
  }
}

/**
 * Inserts the node. If the predecessor already have a successor, the successor node
 * will be attached to the inserted node.
 * @param currentNode - The node to be inserted
 * @param predecessorNode - The predecessor for this node
 */
function insertNodeInOrder(currentNode: Node, predecessorNode: Node): void {
  if (predecessorNode.successorNode !== undefined) {
    currentNode.successorNode = predecessorNode.successorNode
  }
  currentNode.predecessorNode = predecessorNode
  predecessorNode.successorNode = currentNode
}

/**
 * Creates the longest path to the root node.
 * Iterates all the incomming nodes. For each of them it calculates the path to the root.
 * If there is a node in the way which has no path to root, it will call itself again
 * for this node
 * @param request - The current node and the nodeMap
 */
function createLongestPathToRoot(request: {
  node: Node
  nodeMap: Map<string, Node>
}): void {
  const { node, nodeMap } = request

  const incommingPathes: string[][] = []
  // stores all the incomming pathes of this node
  for (const incommingStepname of node.incomming.keys()) {
    if (incommingStepname !== ROOT_NODE_NAME) {
      const incommingNode = nodeMap.get(incommingStepname) as Node
      if (incommingNode.longestPathToRoot === undefined) {
        // This node does not yet have the longest path. So it mus be created first
        createLongestPathToRoot({ node: incommingNode, nodeMap })
      }
      incommingPathes.push([
        incommingStepname,
        ...(incommingNode.longestPathToRoot as string[])
      ])
    } else {
      incommingPathes.push([ROOT_NODE_NAME])
    }
  }

  // now check which path is the longest and put this path to the node
  let currentLongestPath: string[] = []
  for (const incommingPath of incommingPathes) {
    if (incommingPath.length > currentLongestPath.length) {
      currentLongestPath = incommingPath
    }
  }

  node.longestPathToRoot = currentLongestPath
}

/**
 * Checks the connections from the root node to all the other nodes.
 * If the root node has more than one connection to the same node,
 * one of them needs to be deleted.
 *
 * Start with the root and for each node store the path from the root to the
 * node. In the first iteration all the nodes are visited.
 * For the second and all the following connections the algorithem stops on the
 * first node wich was already visited. Then checks which path is the shorstes.
 * If the  new path is the shortest the first connection could be removed.
 * If not the current connection could be removed
 * @param rootNode - The root node of all the nodes
 */
function cleanupRootNode(rootNode: Node): void {
  const nodeMap: Map<string, string[]> = new Map()

  // create the node map
  for (const stepName of rootNode.outgoing.keys()) {
    const nextNode = rootNode.outgoing.get(stepName) as Node
    iterate(nextNode, [stepName])
  }

  // now check the connections from the root to the outgoing nodes
  for (const stepName of rootNode.outgoing.keys()) {
    const nodePath = nodeMap.get(stepName) as string[]
    if (nodePath.length > 1) {
      // in this case delete this connection
      const targetNode = rootNode.outgoing.get(stepName)
      rootNode.outgoing.delete(stepName)
      targetNode?.incomming.delete(rootNode.stepName)
    }
  }

  /**
   *
   * @param node - The node
   * @param path - The path of this node from the root node
   * @returns
   */
  function iterate(node: Node, nodePath: string[]): void {
    const stepName = node.stepName
    if (nodeMap.has(stepName)) {
      // the node was already visited
      // get the last path for this node
      const lastNodePath = nodeMap.get(stepName) as string[]
      if (lastNodePath.length < nodePath.length) {
        // store always the longest path
        nodeMap.set(stepName, nodePath)
      }
    } else {
      // ok the current node was not yet visited.
      nodeMap.set(stepName, nodePath)
    }

    for (const key of node.outgoing.keys()) {
      const newNode: Node = node.outgoing.get(key) as Node
      iterate(newNode, [...nodePath, newNode.stepName])
    }
  }
}

/**
 * Checks if the stepName is already connected. Not only with the last node, also
 * with all the following nodes.
 * @param request - The parameter as defined
 * @returns status - True if the connection exists
 */
function checkIfNodeIsAlreadyConnected(request: {
  lastNode: Node
  stepName: string
}): boolean {
  const { lastNode, stepName } = request
  let status = false

  iterate(lastNode)

  function iterate(node: Node): void {
    if (node.outgoing.has(stepName)) {
      status = true
      return
    }
    for (const key of node.outgoing.keys()) {
      const newNode: Node = node.outgoing.get(key) as Node
      iterate(newNode)
      if (status) {
        return
      }
    }
  }

  return status
}

/**
 * Creates an empty node from a step name
 * @param stepName - The stepName of this node
 * @param isStartNode - set to true if this is the start node
 * @returns The created Node
 */
function createEmptyNode(stepName: string, isStartNode: boolean = false): Node {
  const node: Node = {
    stepName,
    isStartNode,
    incomming: new Map<string, Node>(),
    outgoing: new Map<string, Node>()
  }
  if (isStartNode) {
    node.stepName = ROOT_NODE_NAME
  }
  return node
}
