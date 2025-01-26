let sceneId = 0;
export const newSceneId = () => `scene_${++sceneId}`;
export const lastSceneId = () => `scene_${sceneId}`;

let frameId = 0;
export const newFrameId = () => `frame_${++frameId}`;
export const lastFrameId = () => `frame_${frameId}`;
