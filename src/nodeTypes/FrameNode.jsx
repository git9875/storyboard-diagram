import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useDispatch } from "react-redux";
import { deleteFrameFromScene } from "../store/flowSlice";


function FrameNode(item) {
  const dispatch = useDispatch();

  const clickDelete = (e) => {
    e.stopPropagation(); 
    dispatch(deleteFrameFromScene({frameId:item.id, parentId:item.parentId}));
  }

  if (! item) {
    return (
      <div></div>
    )
  }

  item = ('id' in item) ? item : item.data;
  const data = item ? item.data : {};
 
  return (
    <>
      <Handle type="target" position={Position.Left} id={item.id} />
        <div className={'frame-wrapper ' + item.className} id={item.id}>
          <div className="frame">
            <div className="node-icons">
              <button className="node-icons-delete" onClick={clickDelete}>&#x2718;</button>
            </div>
            <label>{data.label}</label>
          {data.image && <img src={data.image.url} draggable="false" />}
        </div>
      </div>
      <Handle type="source" position={Position.Right} id={item.id} />
      </>
  );
}

export default memo(FrameNode);
