import React from "react";

const VersionDisplay: React.FC = () => {
  return (
    <p style={{ position: "fixed", top: "10px", right: "10px" }}>
      version: KH_APP_VERSION
    </p>
  );
};

export default VersionDisplay;

