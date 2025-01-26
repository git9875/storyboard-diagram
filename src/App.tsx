import { useRef, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  MiniMap,
  Controls,
  useReactFlow,
  Background,
} from '@xyflow/react';

import { useSelector, useDispatch } from "react-redux";
import {
  selectEdges, selectNodes,
  onNodesChange, onEdgesChange, onConnect,
  makeNewFrameNode, makeNewSceneNode,
  addScene, highlightIntersectingNodes, updateNodePosition,
  addFrameToScene, insertFrameToScene, moveFrame
} from "./store/flowSlice";

import '@xyflow/react/dist/style.css';
 
import Sidebar from './Sidebar';
import { DnDProvider, useDnD } from './DnDContext';
import FrameNode from "./nodeTypes/FrameNode";
import SceneList from "./nodeTypes/SceneList";
import { frameNodeStr, sceneListStr, sidebarFrameStr, sidebarSceneListStr } from "./nodeTypes/constants";


const nodeTypes = {
  frameNode: FrameNode,
  sceneList: SceneList
};

let dragNode = null;
let dragFrameNode = null;
let editingNode = null;

const NestedFlow = () => {
  const dispatch = useDispatch();
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();
  const { getIntersectingNodes } = useReactFlow();
  const [dragItemType, setDragItemType] = useDnD();
  const edges = useSelector(selectEdges);
  const nodes = useSelector(selectNodes);
  const tempNodes = useRef([]);
  const screenNodeWidth = 804;
  const screenNodeHeight = 188;

  tempNodes.current = nodes;


  // sidebar drag new node over
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const nodeHtmlBounds = getNodeHtmlBounds();
    const intersectionNodeIds = getNodesByEventClientPosition(event, nodeHtmlBounds).map((n) => n.id);
    dispatch(highlightIntersectingNodes(intersectionNodeIds));
  }, []);

  const onNodeDrag = useCallback((_: MouseEvent, node: Node) => {
    const intersectionNodeIds = getIntersectingNodes(node).map((n) => n.id);
    dispatch(highlightIntersectingNodes(intersectionNodeIds));
  }, []);


  // sidebar drop item
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const nodeHtmlBounds = getNodeHtmlBounds();
      const nodesInMouseArea = getNodesByEventClientPosition(event, nodeHtmlBounds);
      const dragItemTypeLocal = dragItemType;

      if (nodesInMouseArea.length == 0) {
        if (dragItemTypeLocal == sidebarSceneListStr) {
          const screenPosition = screenToFlowPosition({
            x: event.clientX - (screenNodeWidth /2),
            y: event.clientY - (screenNodeHeight/2),
          });
    
          const newSceneNode = makeNewSceneNode(screenPosition, null);
          dispatch(addScene(newSceneNode));
        }
        else {
          // must drop a frame on a scene list
          alert("Cannot add a frame here!");
          return;
        }
      }
      else { // nodesInMouseArea.length > 0
        if (dragItemTypeLocal == sidebarSceneListStr) {
          // don't let a scene list land on another scene list
          alert("Cannot add a scene here!");
          return;
        }
        if (dragItemTypeLocal == sidebarFrameStr) {
          if (nodesInMouseArea.length == 1 && nodesInMouseArea[0].type == sceneListStr) {
            const newFrameNode = makeNewFrameNode(nodesInMouseArea[0].id, null, null);
            dispatch(addFrameToScene(newFrameNode));
          }
          else {
            // insert before the hovered frame node
            const foundFrameNode = nodesInMouseArea.findLast((n) => n.type == frameNodeStr);
            const newFrameNode = makeNewFrameNode(foundFrameNode.parentId, null, null);
            dispatch(insertFrameToScene({beforeFrameId:foundFrameNode.id, newFrameNode:newFrameNode}));
            return;
          }
        }
      }
    },
    [screenToFlowPosition, dragItemType],
  );

  const getNodeHtmlBounds = () => {
    const htmlNodes = document.querySelectorAll('div.react-flow__renderer div.scene-list-node, div.react-flow__renderer div.frame-wrapper');

    const foundElems = Array.from(htmlNodes).map((elem) => {
      const rect = elem.getBoundingClientRect();
      const topLeft = screenToFlowPosition({ x:rect.left, y:rect.top });
      const bottomRight = screenToFlowPosition({ x:rect.right, y:rect.bottom });
      return { htmlRect:rect, id:elem.id, nodeRect:{top:topLeft.y, left:topLeft.x, bottom:bottomRight.y, right:bottomRight.x} };
    });
    return foundElems;
  };

  const getNodesByEventClientPosition = (event, nodeHtmlBounds) => {
    const foundElems = nodeHtmlBounds.filter(elemRectObj => {
      const rect = elemRectObj.htmlRect;
      return (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      );
    }).map(el => el.id);

    if (!foundElems.length) { return []; }
    const foundNodes = tempNodes.current.filter(n => foundElems.includes(n.id) );
    return foundNodes;
  };

  const onNodeClick = (e, node) => {
    editingNode = node;
  };


  const onNodeDragStart = (e, node) => {
    setDragItemType(node.type);
    dragNode = node;

    if (node.type == frameNodeStr) {
      dragFrameNode = node;
    }
  };


  const onNodeDragStop = (e, node) => {
    const dragItemTypeLocal = dragItemType;
    setDragItemType(null);
    dispatch(highlightIntersectingNodes([]));

    const nodeHtmlBounds = getNodeHtmlBounds();
    const nodesInMouseArea = getNodesByEventClientPosition(e, nodeHtmlBounds);

    // don't allow scene list to drop onto another scene list
    if (node.type == sceneListStr) {
      if (doesSceneToucheOtherScene(e, node)) {
        dispatch(updateNodePosition(dragNode)); // reset scene list position
        dragNode = null;
        alert("Don't drag scene lists on top of each other!");
        return;
      }
    }

    // don't allow a frame to be dropped on an empty area, must drop on a scene list
    if (nodesInMouseArea.length < 2 && dragFrameNode && nodesInMouseArea[1] == dragFrameNode.id) {
      if (dragItemTypeLocal == frameNodeStr) {
        dispatch(updateNodePosition(dragFrameNode)); // reset frame position
        dragFrameNode = null;
        alert("Cannot add a frame here!");
        return;
      }
    }
    else {
      const sceneListCount = nodesInMouseArea.reduce((count, node) => {return node.type == sceneListStr ? count+1 : count; }, 0);

      // don't allow scene list to drop onto another scene list
      if (dragItemTypeLocal == sceneListStr && sceneListCount > 1) {
        dispatch(updateNodePosition(dragNode)); // reset scene list position
        dragNode = null;
        alert("Don't drag scene lists on top of each other!");
        return;
      }
      // flowSlice onNodesChange() updates the nodes positions; the scene list new position is already handled there (last drag position)

      // moving a frame node
      if (dragItemTypeLocal == frameNodeStr && dragFrameNode) { // move position
        const foundFrameNode = nodesInMouseArea.find((n) => n.type == frameNodeStr && n.id != dragFrameNode.id);

        // insert frame before other frame (foundFrameNode)
        if (foundFrameNode) {
          dispatch(moveFrame({beforeFrameId:foundFrameNode.id, frameNode:dragFrameNode, toParentId:foundFrameNode.parentId}));
        }
        else {
          // don't allow a frame to be dropped on an empty area, must drop on a scene list
          if (sceneListCount == 0) {
            alert("Must drop frame onto a scene.");
            dispatch(updateNodePosition(dragFrameNode)); // reset frame position
            return;
          }

          // append frame to the end of a scene list
          const foundSceneNode = nodesInMouseArea.findLast((n) => n.type == sceneListStr);
          dispatch(moveFrame({beforeFrameId:'', frameNode:dragFrameNode, toParentId:foundSceneNode.id}));
        }

        return;
      }
    }

  };

  const doesSceneToucheOtherScene = (e, node) => {
    const nodeHtmlBounds = getNodeHtmlBounds().filter(h => h.id.startsWith('scene'));
    const snelRect = nodeHtmlBounds.find(h => h.id == node.id).htmlRect;

    const foundElems = nodeHtmlBounds.filter(elemRectObj => {
      const elRect = elemRectObj.htmlRect;
      return (
        elemRectObj.id != node.id &&
        (
          ( // this scene node appears in top right corner over the other node
            snelRect.left    >= elRect.left &&
            snelRect.left    <= elRect.right &&
            snelRect.bottom  >= elRect.top &&
            snelRect.bottom  <= elRect.bottom
          ) ||
          ( // this scene node appears in bottom right corner over the other node
            snelRect.left >= elRect.left &&
            snelRect.left <= elRect.right &&
            snelRect.top  >= elRect.top &&
            snelRect.top  <= elRect.bottom
          ) ||
          ( // this scene node appears in bottom left corner over the other node
            snelRect.right >= elRect.left &&
            snelRect.right <= elRect.right &&
            snelRect.top   >= elRect.top &&
            snelRect.top   <= elRect.bottom
          ) ||
          ( // this scene node appears in top left corner over the other node
            snelRect.right   >= elRect.left &&
            snelRect.right   <= elRect.right &&
            snelRect.bottom  >= elRect.top &&
            snelRect.bottom  <= elRect.bottom
          )
        )
      );
    }).map(el => el.id);

    return foundElems.length > 0;
  };

  const closeSidebar = () => {
    editingNode = null;
  };


  return (
    <div className="dndflow">
      <Sidebar editnode={editingNode} closeMe={closeSidebar} />
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={(e) => dispatch(onNodesChange(e))}
          onEdgesChange={(e) => dispatch(onEdgesChange(e))}
          onConnect={(e) => dispatch(onConnect(e))}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          className="react-flow-subflows-example"
          onDrop={onDrop}
          onNodeDrag={onNodeDrag}
          onDragOver={onDragOver}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          fitView
          style={{ backgroundColor: "#F7F9FB" }}
        >
            <MiniMap />
            <Controls />
            <Background color='#E6E6E6' />
        </ReactFlow>
      </div>
    </div>
  );
};
 
export default () => (
  <ReactFlowProvider>
    <DnDProvider>
      <NestedFlow />
    </DnDProvider>
  </ReactFlowProvider>
);