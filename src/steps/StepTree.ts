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
}

/**
 * Sorts all the steps in the right order.
 */
export class StepTree {
  /** The start node of the node tree */
  nodeTree: Node

  /** Stores alle the node which are already existing by there stepName  */
  nodeMap: Map<string, Node>

  constructor() {
    // create a start node with no elements
    this.nodeTree = createEmptyNode('', true)
    this.nodeMap = new Map<string, Node>()
    this.nodeMap.set(this.nodeTree.stepName, this.nodeTree)
  }

  /**
   * Adds a list of steps to the existong ones.
   * If the step does not yet exists it creates a new one.
   * Then connects the steps to each other.
   * @param stepNames - An array of step names to be added
   */
  public add(stepNames: string[]): void {
    // When false, then the created node chain needs to be connected to the start node
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

    this.connectDanglingStartStep(stepNames[0])
    cleanupRootNode(this.nodeTree)
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
   * Checks if the first step is connected to the root node.
   * If not, it will create the connection
   * @param stepName - The name of the first step
   */
  protected connectDanglingStartStep(stepName: string): void {
    const node = this.nodeMap.get(stepName)
    if (node?.incomming.size === 0) {
      // This node has no incomming connections.
      this.connectNodes({ sourceNode: this.nodeTree, targetNode: node })
    }
  }

  /**
   * This method add the longest path to the root node to each node.
   * So the prdecessor is always the first name of the longest path.
   * This method is called by the sorter.
   */
  public setLongestPathToRootForAllNodes(): void {
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
 * Creates the longest path to the root node.
 * The logest path is used to get the right path from the root to the end.
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
    const incommingNode = nodeMap.get(incommingStepname) as Node
    if (!incommingNode.isStartNode) {
      if (incommingNode.longestPathToRoot === undefined) {
        // This node does not yet have the longest path. So it mus be created first
        createLongestPathToRoot({ node: incommingNode, nodeMap })
      }
      incommingPathes.push([
        incommingStepname,
        ...(incommingNode.longestPathToRoot as string[])
      ])
    } else {
      incommingPathes.push([incommingNode.stepName])
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
 * If the root node has more than one connection to the same grapth
 * and the node has alreay an incomming node, then the connection must
 * be removed.
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
  for (const stepName of rootNode.outgoing.keys()) {
    const node = rootNode.outgoing.get(stepName) as Node
    if (node.incomming.size > 1) {
      // The node has an other incomming connection. So the connection from the root
      // could be deleted
      deleteConnection(rootNode, node)
    }
  }
}

/**
 * Deletes an existing connection
 * @param source - The source node
 * @param target - The target node
 */
function deleteConnection(source: Node, target: Node): void {
  source.outgoing.delete(target.stepName)
  target.incomming.delete(source.stepName)
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
