import React, { useRef, memo, useMemo } from "react";
import { Handle, Position } from '@xyflow/react';
import { useDnD } from '../DnDContext';
import FrameNode from "./FrameNode";
import { useSelector, useDispatch } from "react-redux";
import { selectNodes, deleteScene } from "../store/flowSlice";
import { sceneListStr } from "./constants";


const SceneList = ({ id, data }) => {
    const dispatch = useDispatch();
    const dragItem = useRef();
    const dragOverItem = useRef();
    const sceneName = (data.label) ? data.label : "Untitled";
    const nodes = useSelector(selectNodes);
    const [dragItemType, setDragItemType] = useDnD();

    function getOrderedFrameNodes(nodes, id) {
        const frameNodes = nodes.filter(n => n.parentId == id);
        frameNodes.sort((a, b) => a.position.x - b.position.x); // sort by position.x in ascending order
        return frameNodes;
    }
    
    const frameNodes = useMemo(() => {
        return getOrderedFrameNodes(nodes, id);
    }, [nodes, id]);

    const dragStart = (e, idx, nodeType) => {
        dragItem.current = idx;
        setDragItemType(nodeType);
        e.dataTransfer.effectAllowed = 'move';
    };

  const clickDelete = (e) => {
    e.stopPropagation(); 
    dispatch(deleteScene(id));
  }

    const rows = frameNodes.map((item, idx) => {
        return (
            <FrameNode data={item}
                onDragStart={(e) => dragStart(e, idx, sceneListStr)}
                onDragEnter={(e) => (dragOverItem.current = idx)}
                draggable
            />
        )
    });

    return (
        <>
            <Handle type="target" position={Position.Left} />
            <div className="scene-list-node" id={id}>
                <div className="node-icons">
                    <button className="node-icons-delete" onClick={clickDelete}>&#x2718;</button>
                </div>
                <div className="scene-list-name">{sceneName}</div>
                <div className="scene-list nowheel nodrag">
                </div>
            </div>
            <Handle type="source" position={Position.Right} />
        </>
    )
};

export default memo(SceneList);
