"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MobileGridLayout, SceneGrid, GridItemConfig } from '../components/MobileGridLayout';
import '../styles/mobile-grid.css';

// Image assets from Figma
const cityBackground = "http://localhost:3845/assets/f4c37b385d9bce9338fb627d1dff68333654a737.png";
const coinIcon = "http://localhost:3845/assets/a355b4c0a2026e56438cfa8fd56c1c18f1f10da3.png";
const heartIcon = "http://localhost:3845/assets/f42f094b06c3665c27c2885ab8de55abbce2ed2a.png";
const menuIcon = "http://localhost:3845/assets/ea202714d2182a56cd2aa68fa0a17f4aa2c33217.svg";
const progressDot = "http://localhost:3845/assets/fb5ad20f3cdfec0f34ae98dc8f52ca386c1a145c.svg";
const progressBg = "http://localhost:3845/assets/b4acd5ef616fa1b5895b23998af0907d4a21fbd3.svg";
const progressInner = "http://localhost:3845/assets/199d0e1e0e53cb639bf87e555baa6429bc526ee8.svg";

// 转换为 Grid 坐标系统 (12x16 网格)
const locations: Array<{
  id: string;
  title: string;
  gridColumn: number;
  gridRow: number;
  columnSpan?: number;
}> = [
  {
    id: 'buildings-conflicts',
    title: 'The Buildings of Conflicts',
    gridColumn: 5, // 原 x: 45% -> 约 column 5-6
    gridRow: 6,    // 原 y: 35% -> 约 row 6
    columnSpan: 3
  },
  {
    id: 'garden-identity', 
    title: 'The Garden of Identity',
    gridColumn: 2, // 原 x: 25% -> 约 column 2-3
    gridRow: 9,    // 原 y: 55% -> 约 row 9
    columnSpan: 3
  },
  {
    id: 'power-within',
    title: 'The Power Within: Mastering Self-Efficacy', 
    gridColumn: 7, // 原 x: 55% -> 约 column 7-8
    gridRow: 12,   // 原 y: 75% -> 约 row 12
    columnSpan: 4
  }
];

export default function CityMapPage() {
  const router = useRouter();

  const handleLocationClick = (locationId: string) => {
    if (locationId === 'buildings-conflicts') {
      router.push('/psyquest/building-interior');
    }
    // Add more location handlers as needed
  };

  // 创建 Grid 布局项目配置
  const gridItems: GridItemConfig[] = [
    // Top Header
    {
      id: 'header',
      position: { column: 2, row: 1, columnSpan: 10, rowSpan: 1 },
      element: (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-[#d9d9d9] border border-black rounded-[33px] p-3 flex items-center justify-between"
        >
          <div className="text-black font-['Gurajada'] text-xl font-normal">
            Home Place
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-6 h-6 relative">
                <img src={coinIcon} alt="Coins" className="w-full h-full object-contain" />
              </div>
              <span className="text-[#606060] font-['Urbanist'] font-bold text-sm">160</span>
            </div>
            
            <div className="w-px h-6 bg-gray-400"></div>
            
            <div className="flex items-center space-x-1">
              <div className="w-6 h-6 relative">
                <img src={heartIcon} alt="Hearts" className="w-full h-full object-contain" />
              </div>
              <span className="text-[#606060] font-['Urbanist'] font-bold text-sm">4</span>
            </div>
            
            <div className="w-6 h-6 relative cursor-pointer">
              <img src={menuIcon} alt="Menu" className="w-full h-full object-contain" />
            </div>
          </div>
        </motion.div>
      ),
      zIndex: 30
    },
    // Location Bubbles
    ...locations.map((location, index) => ({
      id: location.id,
      position: { 
        column: location.gridColumn, 
        row: location.gridRow, 
        columnSpan: location.columnSpan || 2 
      },
      element: (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + index * 0.2 }}
          className="cursor-pointer group relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleLocationClick(location.id)}
        >
          <div className="bg-[#d9d9d9] border border-black rounded-[33px] px-4 py-2 shadow-lg group-hover:bg-white transition-colors min-w-[120px]">
            <span className="text-black font-['Gurajada'] text-sm font-normal text-center block whitespace-nowrap">
              {location.title}
            </span>
          </div>
          
          {/* 装饰点 - 保留 absolute 定位 */}
          <div className="absolute -top-1 -left-1 w-1 h-1">
            <img src={progressDot} alt="" className="w-full h-full" />
          </div>
          <div className="absolute -top-1 -right-1 w-1 h-1">
            <img src={progressDot} alt="" className="w-full h-full" />
          </div>
        </motion.div>
      ),
      zIndex: 20
    })),
    // Progress Indicator at Bottom
    {
      id: 'progress',
      position: { column: 6, row: 15, columnSpan: 2 },
      element: (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="relative w-10 h-10 mx-auto">
            <div className="absolute inset-0">
              <img src={progressBg} alt="" className="w-full h-full" />
            </div>
            <div className="absolute inset-1">
              <img src={progressInner} alt="" className="w-full h-full" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[#565656] font-['Gurajada'] text-2xl font-normal">1</span>
            </div>
          </div>
        </motion.div>
      ),
      zIndex: 20
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="w-full max-w-md mx-auto min-h-screen">
        <SceneGrid
          backgroundImage={cityBackground}
          items={gridItems}
          className="scene-grid mobile-layer-background"
        />
      </div>
    </div>
  );
}