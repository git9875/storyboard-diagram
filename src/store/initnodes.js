import { newFrameId, newSceneId, lastSceneId, lastFrameId } from "./ids";
import { frameNodeStr, sceneListStr } from "../nodeTypes/constants";

const firstGroupNode = {
  id: newSceneId(),
  data: { label: 'The Birds ' + lastSceneId() },
  position: { x: 0, y: -50 },
  style: { width: 800, height: 165 },
  type: sceneListStr,
};

const initialNodes = [
  firstGroupNode,
  {
    id: newFrameId(),
    data: { label: 'Frame 1', image: {url:'the-birds/frame1.png'} },
    position: { x: 15, y: 30 },
    parentId: firstGroupNode.id,
    type:frameNodeStr,
  },
  {
    id: newFrameId(),
    data: { label: 'Frame 2', image: {url:'the-birds/frame2.png'} },
    position: { x: 185, y: 30 },
    parentId: firstGroupNode.id,
    type:frameNodeStr,
  },
  {
    id: newFrameId(),
    data: { label: 'Frame 3', image: {url:'the-birds/frame3.png'} },
    position: { x: 355, y: 30 },
    parentId: firstGroupNode.id,
    type:frameNodeStr,
  },
  {
    id: newSceneId(),
    data: {
      label: 'The Birds ' + lastSceneId(),
    },
    position: { x: 0, y: 150 },
    style: { width: 800, height: 165 },
    type: sceneListStr,
  },
  {
    id: newFrameId(),
    data: { label: 'Frame 4', image: {url:'the-birds/frame5.png'} },
    position: { x: 15, y: 30 },
    parentId: lastSceneId(),
    type:frameNodeStr,
  },
  {
    id: newFrameId(),
    data: { label: 'Frame 5', image: {url:'the-birds/frame6.png'} },
    position: { x: 185, y: 30 },
    parentId: lastSceneId(),
    type:frameNodeStr,
  },
];

export default initialNodes;
