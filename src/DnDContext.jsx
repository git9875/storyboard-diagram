// Drag and Drop Context Provider used to handle dragging nodes
import { createContext, useContext, useState } from 'react';
 
const DnDContext = createContext([null, (_) => {}]);
 
export const DnDProvider = ({ children }) => {
  const [dragItemType, setDragItemType] = useState(null);

  return (
    <DnDContext.Provider value={[dragItemType, setDragItemType]}>
      {children}
    </DnDContext.Provider>
  );
}
 
export default DnDContext;
 
export const useDnD = () => {
  return useContext(DnDContext);
}