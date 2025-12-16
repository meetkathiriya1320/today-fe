import React from "react";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

const Breadcrumb = ({ items = [] }) => {

    const router = useRouter()

  return (
    <div className="flex items-center text-sm text-gray-600 m-5 bg-white">
      {items.map((item, index) => {
        console.log(item.name)
       return <div key={index} className="flex items-center">
          {/* Icon */}
          {item.icon && (
            <item.icon size={16} className="mr-2" />
          )}

          {/* Name (clickable or not) */}
          <span
            className={`cursor-pointer hover:text-blue-600 ${
              !item.onClick ? "cursor-default hover:text-gray-600" : ""
            }`}
            onClick={() => router.push(item.navigation)}
          >
            {item.name}
          </span>

          {/* Chevron except last */}
          {index !== items.length - 1 && (
            <ChevronRight size={16} className="mx-2" />
          )}
        </div>
      }
        
      
      
      )}
    </div>
  );
};

export default Breadcrumb;
