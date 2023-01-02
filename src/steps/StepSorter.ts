import { Node, StepTree } from "./StepTree"



interface SortNode {
  /** The incomming SortNode. If this is the root node it is undefined */
  incommingNode?:SortNode

  /** all the nodes in the same level */
  nodes:Node[]

  /** The outgoing Sort node */
  outgoingNode? :SortNode
}


/**
 * Sorts all the steps in the right order.
 */
export class StepSorter {

  /** The root Sort Node */
  sortRoot:SortNode
  
  /** A map which maps which step is in which sort node */
  nodeToSortNodemap:Map<string,SortNode>

  /** The treeStep object which should be sorted */
  stepTree: StepTree

  constructor(stepTree:StepTree) {
    // create a start node with the root node
    this.sortRoot = {
      nodes : [stepTree.nodeTree],
    }

     this.nodeToSortNodemap = new Map<string, SortNode>()

     this.stepTree = stepTree

     // add the root sort node to the map
     this.nodeToSortNodemap.set(stepTree.nodeTree.stepName, this.sortRoot)
  }

  /**
   * Returns all the steps in the right order. 
   * @returns stepNames - The step names in the right order
   */
  public getSteps(): string[] {
    this.stepTree.setLongestPathToRootForAllNodes()
    this.createSortNodeTree()
    return ['']}


     /**
   * Put all the nodes in one order.
   *
   */
  protected createSortNodeTree(): void {
    debugger
    const self = this
    const nodeMap = this.stepTree.nodeMap
    
    for (const stepName of nodeMap.keys()) {
      const node = nodeMap.get(stepName) as Node
      addNodeToSortNode(node)
    }

    function addNodeToSortNode(node:Node){
      const longestPathToRoot = node.longestPathToRoot as string[]
      const predecessorName = longestPathToRoot[0]
      
      // get the Sort node of the predecessor
      if(!self.nodeToSortNodemap.has(predecessorName)){
        // the predecessor is not yet added. need to add this node first
        const predecessorNode = nodeMap.get(predecessorName)
        addNodeToSortNode(node)
      }
      const predecessorSortNode = self.nodeToSortNodemap.get(predecessorName) as SortNode
      if(predecessorSortNode.outgoingNode=== undefined){
        // create a new sort node and add it as outgoingNode
        predecessorSortNode.outgoingNode = {
          nodes : [],
        }
      }
      predecessorSortNode.outgoingNode.nodes.push(node)
    }
  }
}
