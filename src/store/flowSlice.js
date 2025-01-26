import { createSlice } from "@reduxjs/toolkit";
import { MarkerType } from '@xyflow/react';
import initialEdges from "./initedges";
import initialNodes from "./initnodes";
import { newFrameId, newSceneId } from "./ids";
import { frameNodeStr, sceneListStr } from "../nodeTypes/constants";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";

const sceneListDefaultWidth = 800;
const sceneListHeight = 165;
const sceneListPadding = 15;
const frameNodeYPos = 30;
const frameNodeNextXPosDistance = 170;

function increaseSceneWidth(sceneList, frameCount) {
  if ((sceneList.style.width - sceneListPadding*2) < (frameCount * frameNodeNextXPosDistance)) {
    sceneList.style.width += frameNodeNextXPosDistance;
  }
}

function decreaseSceneWidth(sceneList, frameCount) {
  if (((sceneList.style.width - sceneListPadding*2) > (frameCount * frameNodeNextXPosDistance)) && (sceneList.style.width > sceneListDefaultWidth)) {
    sceneList.style.width -= frameNodeNextXPosDistance;
  }
}

function insertFrameToSceneList(allNodes, frameNode, parentId, beforeFrameId) {
  const allNodeIndicesDict = allNodes.reduce((acc, curr) => { acc[curr.id] = curr; return acc; }, {});
  const toSceneFrameNodes = allNodes.filter(n => n.parentId == parentId);
  toSceneFrameNodes.sort((a, b) => a.position.x - b.position.x); // sort by position.x in ascending order

  if (! beforeFrameId) {
    const lastFrameNode = toSceneFrameNodes[toSceneFrameNodes.length - 1];
    frameNode.position.x = toSceneFrameNodes.length * frameNodeNextXPosDistance + sceneListPadding;
    frameNode.position.y = frameNodeYPos;
  }
  else {
    // then insert frameNode and update it and subsequent positions
    const insertIdx = toSceneFrameNodes.findIndex(f => f.id == beforeFrameId);
    frameNode.position.x = (insertIdx + 1) * frameNodeNextXPosDistance + sceneListPadding;
    frameNode.position.y = frameNodeYPos;
    let newXPos = 0;

    for (let i=insertIdx; i<toSceneFrameNodes.length-1; i++) {
      allNodeIndicesDict[ toSceneFrameNodes[i].id ].position.x = (i + 1) * frameNodeNextXPosDistance + sceneListPadding;
    }
    allNodeIndicesDict[ toSceneFrameNodes[toSceneFrameNodes.length-1].id ].position.x = toSceneFrameNodes.length * frameNodeNextXPosDistance + sceneListPadding; //  += frameNodeNextXPosDistance;
  }

  allNodes.push(frameNode);
  return [allNodes, toSceneFrameNodes.length + 1];
}



const initialState = {
  nodes: initialNodes,
  edges: initialEdges,
};

export const flow = createSlice({
  name: "scenelist",
  initialState,
  reducers: {
    addScene: (state, action) => {
      const newNode = structuredClone(action.payload);
      state.nodes.push(newNode);
    },
    deleteScene: (state, action) => {
      const sceneId = action.payload;
      const newNodes = state.nodes.filter(n => !(n.id === sceneId || (('parentId' in n) && n.parentId === sceneId)));
      state.nodes = newNodes;
    },
    updateNodeLabel: (state, action) => {
      state.nodes = state.nodes.map((node) => {
        if (node.id === action.payload.id) {
          node.data = {
            ...node.data,
            label: action.payload.label
          };
        }
        return node;
      });
    },
    updateNodePosition: (state, action) => {
        state.nodes = state.nodes.map((node) => {
          if (node.id === action.payload.id) {
            node.position = { ...action.payload.position };
          }
          return node;
        });
    },
    updateNodeClassName: (state, action) => {
      state.nodes = state.nodes.map((node) => {
        if (node.id === action.payload.id) {
          node.className = { ...action.payload.className };
        }
        return node;
      });
    },
    highlightIntersectingNodes: (state, action) => {
      const intersectionNodeIds = action.payload;
      state.nodes = state.nodes.map((node) => {
        node.className = intersectionNodeIds.includes(node.id) ? 'highlight' : '';
        return node;
      });
    },

    addFrameToScene: (state, action) => {
      const frameToAdd = structuredClone(action.payload);
      const sceneList = state.nodes.find(n => n.id == frameToAdd.parentId);
      const frameNodes = state.nodes.filter(n => n.parentId == sceneList.id);
      frameNodes.sort((a, b) => a.position.x - b.position.x); // sort by position.x in ascending order

      if (frameNodes.length == 0) {
        frameToAdd.position = {x:sceneListPadding, y:frameNodeYPos};
      }
      else {
        frameToAdd.position = {x:(frameNodes.length * frameNodeNextXPosDistance + sceneListPadding), y:frameNodeYPos};
      }

      const frameCount = frameNodes.length + 1;
      increaseSceneWidth(sceneList, frameCount);

      state.nodes.push(frameToAdd);
    },
    insertFrameToScene: (state, action) => {
      const frameNode = structuredClone(action.payload.newFrameNode);
      frameNode.position = {x:0, y:0};
      const beforeFrameId = action.payload.beforeFrameId;
      const sceneList = state.nodes.find(n => n.id == frameNode.parentId);

      const [allNodes, toFrameCount] = insertFrameToSceneList(state.nodes, frameNode, frameNode.parentId, beforeFrameId);
      increaseSceneWidth(sceneList, toFrameCount);
      state.nodes = allNodes;
    },
    deleteFrameFromScene: (state, action) => {
      const frameId = action.payload.frameId;
      const fromParentId = action.payload.parentId;
      const allNodes = state.nodes.filter(n => n.id != frameId);
      const sceneNodes = allNodes.filter(n => n.parentId == fromParentId);
      sceneNodes.sort((a, b) => a.position.x - b.position.x); // // sort by position.x in ascending order

      for (let i=0; i<sceneNodes.length; i++) {
        sceneNodes[i].position.x = i * frameNodeNextXPosDistance + sceneListPadding;
      }

      const sceneNode = allNodes.find(n => n.id == fromParentId);
      decreaseSceneWidth(sceneNode, sceneNodes.length);
      state.nodes = allNodes;
    },
    updateFrameImageUrl: (state, action) => {
      const frameNode = state.nodes.find(n => n.id == action.payload.frameId);
      frameNode.data.image.url = action.payload.imageUrl;
    },
    moveFrame: (state, action) => {
      const frameNode = structuredClone(action.payload.frameNode);
      const fromParentId = frameNode.parentId;
      const toParentId = action.payload.toParentId;
      const isMovingScenes = fromParentId != toParentId;
      const stateFrameNode = state.nodes.find(n => n.id == frameNode.id);

      if (isMovingScenes) {
        stateFrameNode.parentId = toParentId;
      }
      stateFrameNode.position.y = frameNodeYPos; // reset from dragging

      const toSceneNodes = state.nodes.filter(n => n.parentId == toParentId);
      toSceneNodes.sort((a, b) => a.position.x - b.position.x); // sort by position.x in ascending order
      // I thought beforeFrameId may need to be considered when inserting, but that doesn't seem to be the case.
      // I also thought there could be a problem of order placement with the relative position.x to the fromParentId.

      for (let i=0; i<toSceneNodes.length; i++) {
        toSceneNodes[i].position.x = i * frameNodeNextXPosDistance + sceneListPadding;
      }

      if (! isMovingScenes) { return; }

      const fromSceneNodes = state.nodes.filter(n => n.parentId == fromParentId);
      fromSceneNodes.sort((a, b) => a.position.x - b.position.x); // sort by position.x in ascending order

      for (let i=0; i<fromSceneNodes.length; i++) {
        fromSceneNodes[i].position.x = i * frameNodeNextXPosDistance + sceneListPadding;
      }

      const fromSceneList = state.nodes.find(n => n.id == fromParentId);
      decreaseSceneWidth(fromSceneList, fromSceneNodes.length);
      const toSceneList = state.nodes.find(n => n.id == toParentId);
      increaseSceneWidth(toSceneList, toSceneNodes.length);

      // "Order of Nodes: It’s important that your parent nodes appear before their children in the nodes/ defaultNodes array to get processed correctly."
      // see:  https://reactflow.dev/learn/layouting/sub-flows
      // Move all scenelist nodes to the front of the state.nodes list.
      state.nodes = [...state.nodes.filter(n => n.type == sceneListStr || n.type == 'group'), ...state.nodes.filter(n => n.type == frameNodeStr) ];
      return;
    },
  

    onNodesChange: (state, action) => {
      state.nodes = applyNodeChanges(action.payload, state.nodes);
    },
    onEdgesChange: (state, action) => {
      state.edges = applyEdgeChanges(action.payload, state.edges);
    },
    onConnect: (state, action) => {
      const edge = {...action.payload, markerEnd:{type:MarkerType.ArrowClosed, height:8, width:8}, style:{strokeWidth:2}, zIndex:1002 };
      state.edges = addEdge(edge, state.edges);
    },
  },
});

export const {
  addScene,
  deleteScene,
  updateNodeLabel,
  updateNodeClassName,
  updateNodePosition,
  highlightIntersectingNodes,
  addFrameToScene,
  insertFrameToScene,
  deleteFrameFromScene,
  updateFrameImageUrl,
  moveFrame,

  onNodesChange,
  onEdgesChange,
  onConnect,
} = flow.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectCount = (state) => state.flow.value;

export const selectNodes = (state) => state.flow.nodes;
export const selectEdges = (state) => state.flow.edges;


export const makeNewFrameNode = (parentId, label, imgurl) => {
    const id = newFrameId();
    const type = frameNodeStr;
    const textLabel = (label) ? label : `${type} ${id}`;
    const imageUrl = (imgurl) ? imgurl : 'image_placeholder.png';
    return {id: id, type, parentId, data: { label:textLabel, image:{url:imageUrl} }, className:''};
};

export const makeNewSceneNode = (position, label) => {
    const id = newSceneId();
    const type = sceneListStr;
    const textLabel = (label) ? label : `${type} ${id}`;
    return {id: id, type, position:{...position}, data: { label:textLabel }, className:'', style:{ width:sceneListDefaultWidth, height:sceneListHeight } };
};

export default flow.reducer;
