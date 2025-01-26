import { newFrameId, newSceneId, lastSceneId, lastFrameId } from "./ids";
import { frameNodeStr, sceneListStr } from "../nodeTypes/constants";

const firstGroupNode = {
  id: newSceneId(),
  data: { label: 'sceneList ' + lastSceneId() },
  position: { x: 0, y: -50 },
  style: { width: 800, height: 165 },
  type: sceneListStr,
};

const initialNodes = [
  firstGroupNode,
  {
    id: newFrameId(),
    data: { label: 'Frame 1', image: {url:'image_placeholder.png'} },
    position: { x: 10, y: 30 },
    parentId: firstGroupNode.id,
    type:frameNodeStr,
  },
  {
    id: newFrameId(),
    data: { label: 'Frame 2', image: {url:'image_placeholder.png'} },
    position: { x: 150, y: 30 },
    parentId: firstGroupNode.id,
    type:frameNodeStr,
  },
  {
    id: newFrameId(),
    data: { label: 'Frame 3', image: {url:'image_placeholder.png'} },
    position: { x: 300, y: 30 },
    parentId: firstGroupNode.id,
    type:frameNodeStr,
  },
  {
    id: newSceneId(),
    data: {
      label: 'sceneList ' + lastSceneId(),
    },
    position: { x: 0, y: 150 },
    style: { width: 800, height: 165 },
    type: sceneListStr,
  },
  {
    id: newFrameId(),
    data: { label: lastFrameId() + ' 1', image: {url:'image_placeholder.png'} },
    position: { x: 15, y: 30 },
    parentId: lastSceneId(),
    type:frameNodeStr,
  },
  {
    id: newFrameId(),
    data: { label: lastFrameId() + ' 2', image: {url:'image_placeholder.png'} },
    position: { x: 155, y: 30 },
    parentId: lastSceneId(),
    type:frameNodeStr,
  },
];

export default initialNodes;
