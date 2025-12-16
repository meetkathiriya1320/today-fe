"use client";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

const CredentialsDisplay = ({ email, password, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const credentialsText = `Email: ${email}\nPassword: ${password}`;

    try {
      await navigator.clipboard.writeText(credentialsText);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
        if (onCopy) onCopy(); // auto close modal
      }, 800);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="space-y-4 mt-5">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="space-y-3 relative">
          {/* COPY BUTTON */}
          <div className="flex justify-end right-0 absolute">
            {copied ? (
              <Check className="text-green-600" size={18} />
            ) : (
              <Copy
                onClick={copyToClipboard}
                className="cursor-pointer hover:text-blue-600"
                size={18}
              />
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">
              Email : {email}
            </label>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">
              Password : ***********
            </label>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Note: You can copy these credentials by selecting the text or clicking
        the Copy button above. This modal will close automatically after
        copying.
      </p>
    </div>
  );
};

export default CredentialsDisplay;
