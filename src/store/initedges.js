import { MarkerType } from '@xyflow/react';
 
const initialEdges = [
    {
        id: 'frame_1->frame_5',
        source: 'frame_1',
        target: 'frame_5',
        markerEnd: {
            type: MarkerType.ArrowClosed,
            height: 8,
            width: 8
        },
        style: {
            strokeWidth: 2
        },
        zIndex:1002
    },
    {
        id: 'scene_1->scene_2',
        source: 'scene_1',
        target: 'scene_2',
        markerEnd: {
            type: MarkerType.ArrowClosed,
            height: 8,
            width: 8
        },
        style: {
            strokeWidth: 2
        },
        zIndex:1002
    },

];

export default initialEdges