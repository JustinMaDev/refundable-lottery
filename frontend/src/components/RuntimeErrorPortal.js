import React, { useState, useImperativeHandle, forwardRef } from "react";
import ReactDOM from "react-dom";

const RuntimeErrorPortal = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState(""); 

  useImperativeHandle(ref, () => ({
    open: (error) => {
      const titleMatch = error.toString().match(/(Error:\s[^;]+);/); 
      const reasonMatch = error.toString().match(/reason="([^"]+)"/);
      setTitle(titleMatch ? titleMatch[1] : "Error:");
      setReason(reasonMatch ? reasonMatch[1] : "Unknown error");

      setIsOpen(true);
    },
    close: () => setIsOpen(false),
  }));

  return (
    <>
      {isOpen &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-800 text-white rounded-lg p-6">
              <h2 className="text-xl mb-4">{title}</h2>
              <p>{reason}</p>
              <button
                className="btn btn-primary mt-4"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
});

export default RuntimeErrorPortal;
