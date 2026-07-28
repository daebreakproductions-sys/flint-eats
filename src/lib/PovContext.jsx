import { createContext, useContext, useState } from "react";
import { getPovRole, setPovRole as storePovRole } from "@/components/admin/PovBanner";

const PovContext = createContext({ povRole: null, exitPov: () => {} });

export function PovProvider({ children }) {
  const [povRole, setPovRoleState] = useState(() => getPovRole());

  const exitPov = () => {
    storePovRole(null);
    setPovRoleState(null);
    window.location.reload();
  };

  return (
    <PovContext.Provider value={{ povRole, exitPov }}>
      {children}
    </PovContext.Provider>
  );
}

export function usePov() {
  return useContext(PovContext);
}