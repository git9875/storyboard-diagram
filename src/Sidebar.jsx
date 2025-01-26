import React, { useRef, useEffect } from 'react';
import { useDnD } from './DnDContext';
import { useDispatch } from "react-redux";
import { updateNodeLabel, updateFrameImageUrl } from "./store/flowSlice";
import { frameNodeStr, sidebarFrameStr, sidebarSceneListStr } from "./nodeTypes/constants";

export default (props) => {
  const [dragItemType, setDragItemType] = useDnD();
  const dispatch = useDispatch();
  const nameInputRef = useRef(null);
  const imageUrlInputRef = useRef(null);


  const onDragStart = (event, nodeType) => {
    setDragItemType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.value = props.editnode?.data.label || "";
    }
    if (imageUrlInputRef.current) {
      imageUrlInputRef.current.value = props.editnode?.data.image.url || "";
    }
  }, [ props.editnode ]);

  const updateNode = () => {
    if (nameInputRef.current.value != props.editnode.data.label) {
      dispatch(updateNodeLabel({id:props.editnode.id, label:nameInputRef.current.value}));
    }
    if (props.editnode.type == frameNodeStr && imageUrlInputRef.current.value != props.editnode.data.image.url) {
      dispatch(updateFrameImageUrl({frameId:props.editnode.id, imageUrl:imageUrlInputRef.current.value}));
    }
    
    props.closeMe();
  };
 
  const nameChange = (e) => { };
  const imageUrlChange = (e) => { };


  return (
    <aside>
      <div className="description">You can drag these nodes to the pane on the right.</div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, sidebarSceneListStr)} draggable>
        Scene List
      </div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, sidebarFrameStr)} draggable>
        Frame Node
      </div>

      {props.editnode &&
        <div className='node-edit-form'>
          <div className='form-title'>Edit Node</div>
          <div className='sidebar-form-field'>
            <label>Name</label>
            <input type="text" ref={nameInputRef} onChange={nameChange} />
          </div>
          {props.editnode.data.image &&
            <div className='sidebar-form-field'>
              <label>Image</label>
              <input type="text" ref={imageUrlInputRef} onChange={imageUrlChange} />
            </div>
          }
          <div className='sidebar-form-field'>
            <button onClick={updateNode}>Update</button>
          </div>
        </div>
      }
    </aside>
  );
};