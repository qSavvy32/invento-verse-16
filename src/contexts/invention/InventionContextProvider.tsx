
import React, { createContext, useContext, useState, useEffect } from "react";
import { InventionContextType, InventionState, initialState } from "./types";
import { useInventionActions } from "./useInventionActions";

const InventionContext = createContext<InventionContextType | undefined>(undefined);

export const InventionContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<InventionState>(initialState);
  const actions = useInventionActions(state, setState);

  useEffect(() => {
    console.log("Invention State updated:", state);
  }, [state]);

  // Modified resetState to use the initialState from the types file
  const resetState = () => actions.resetState(initialState);

  // Create the context value with state and all actions
  const value: InventionContextType = {
    state,
    setState,
    ...actions,
    resetState,  // Override with our modified version
  };

  return (
    <InventionContext.Provider value={value}>
      {children}
    </InventionContext.Provider>
  );
};

export const useInvention = () => {
  const context = useContext(InventionContext);
  if (!context) {
    throw new Error("useInvention must be used within a InventionContextProvider");
  }
  return context;
};
