
import React from "react";

const ViewerStyles: React.FC = () => {
  return (
    <style>
      {`
      .animate-scale-in {
        animation: scaleIn 0.3s ease-out forwards;
      }
      
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      `}
    </style>
  );
};

export default ViewerStyles;
