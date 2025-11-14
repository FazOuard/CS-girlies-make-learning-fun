import React, { createContext, useContext, useState } from "react";
const XpContext = createContext();

export const XpProvider = ({ children }) => {
  const [xp, setXp] = useState(0);
  const addXp = (num = 1) => setXp(prev => prev + num); // FIXED
  return (
    <XpContext.Provider value={{ xp, addXp }}>
      {children}
    </XpContext.Provider>
  );
};

export const useXp = () => useContext(XpContext);
