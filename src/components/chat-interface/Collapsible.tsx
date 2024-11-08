import React, { useState } from "react";

interface CollapsibleProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

const Collapsible: React.FC<CollapsibleProps> = ({ id, title, children }) => {
  const [isActive, setIsActive] = useState(true);

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  return (
    <div>
      <button
        id={`clpse-btn-${id}`}
        onClick={handleToggle}
        className={`clpse ${isActive ? "clpse-active" : ""}`}
      >
        {title}
      </button>
      <div style={{ display: isActive ? "block" : "none" }}>
        {children}
      </div>
    </div>
  );
};

export default Collapsible;
