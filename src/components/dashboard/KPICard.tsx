// import React from "react";
// import { TrendingUp, TrendingDown } from "lucide-react";

// interface KPICardProps {
//   title: string;
//   value: string | number;
//   icon: React.ReactNode;
//   change?: number;
//   color: string;
// }

// const KPICard: React.FC<KPICardProps> = ({
//   title,
//   value,
//   icon,
//   change,
//   color,
// }) => {
//   // Add more color options
//   const bgColorMap: Record<string, string> = {
//     blue: "bg-blue-50",
//     green: "bg-green-50",
//     orange: "bg-orange-50",
//     purple: "bg-purple-50",
//     yellow: "bg-yellow-50",
//     indigo: "bg-indigo-50",
//     pink: "bg-pink-50",
//     gray: "bg-gray-50",
//   };

//   const iconBgColorMap: Record<string, string> = {
//     blue: "bg-blue-500",
//     green: "bg-green-500",
//     orange: "bg-orange-500",
//     purple: "bg-purple-500",
//     yellow: "bg-yellow-500",
//     indigo: "bg-indigo-500",
//     pink: "bg-pink-500",
//     gray: "bg-gray-500",
//   };

//   const getChangeColor = () => {
//     if (!change) return "text-gray-500";
//     return change > 0 ? "text-green-500" : "text-red-500";
//   };

//   const getChangeIcon = () => {
//     if (!change) return null;
//     return change > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
//   };

//   // const getBgColor = () => {
//   //   switch (color) {
//   //     case 'blue': return 'bg-blue-50';
//   //     case 'green': return 'bg-green-50';
//   //     case 'orange': return 'bg-orange-50';
//   //     default: return 'bg-gray-50';
//   //   }
//   // };

//   // const getIconBgColor = () => {
//   //   switch (color) {
//   //     case 'blue': return 'bg-blue-500';
//   //     case 'green': return 'bg-green-500';
//   //     case 'orange': return 'bg-orange-500';
//   //     default: return 'bg-gray-500';
//   //   }
//   // };

//   return (
//     <div
//       className={`rounded-lg shadow-sm ${
//         bgColorMap[color] || "bg-gray-50"
//       } p-6 transition-all duration-300 hover:shadow-md`}
//     >
//       <div className="flex items-center">
//         <div
//           className={`flex items-center justify-center w-12 h-12 rounded-full ${
//             iconBgColorMap[color] || "bg-gray-500"
//           } text-white`}
//         >
//           {icon}
//         </div>
//         <div className="ml-4">
//           <h3 className="text-lg font-medium text-gray-500">{title}</h3>
//           <div className="flex items-center">
//             <span className="text-2xl font-bold text-gray-900">{value}</span>
//             {change !== undefined && (
//               <div className={`flex items-center ml-2 ${getChangeColor()}`}>
//                 {getChangeIcon()}
//                 <span className="ml-1 text-sm font-medium">
//                   {Math.abs(change)}%
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default KPICard;


import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  color: string; // used for icon background
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  change,
  color,
}) => {
  const iconBgColorMap: Record<string, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
    yellow: "bg-yellow-500",
    indigo: "bg-indigo-500",
    pink: "bg-pink-500",
    gray: "bg-gray-500",
  };

  const getChangeColor = () => {
    if (change === undefined) return "text-muted-foreground";
    return change > 0 ? "text-success" : "text-destructive";
  };

  const getChangeIcon = () => {
    if (change === undefined) return null;
    return change > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
  };

  return (
    <div className="rounded-xl border border-border bg-card text-foreground shadow-sm transition-colors duration-300 hover:shadow-md">
      <div className="flex items-center gap-4 p-6">
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-full text-white ${
            iconBgColorMap[color] || "bg-gray-500"
          }`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold">{value}</span>
            {change !== undefined && (
              <span className={`flex items-center text-sm font-medium ${getChangeColor()}`}>
                {getChangeIcon()}
                <span className="ml-1">{Math.abs(change)}%</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPICard;
