"use client";

import React from 'react';
import { cn } from "@/lib/utils";

// 移动端专用的 Grid 布局系统
export interface GridConfig {
  columns: number;
  rows: number;
  gap?: string;
  aspectRatio?: string;
}

export interface GridItemConfig {
  id: string;
  element: React.ReactNode;
  position: {
    column: number;
    row: number;
    columnSpan?: number;
    rowSpan?: number;
  };
  zIndex?: number;
  className?: string;
}

interface MobileGridLayoutProps {
  config: GridConfig;
  items: GridItemConfig[];
  className?: string;
  children?: React.ReactNode;
}

export function MobileGridLayout({ 
  config, 
  items, 
  className, 
  children 
}: MobileGridLayoutProps) {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
    gridTemplateRows: `repeat(${config.rows}, 1fr)`,
    gap: config.gap || '0',
    aspectRatio: config.aspectRatio || 'auto',
    width: '100%',
    height: '100%',
    position: 'relative' as const,
  };

  return (
    <div 
      className={cn("mobile-grid-container", className)}
      style={gridStyle}
    >
      {/* 背景内容 */}
      {children}
      
      {/* Grid 项目 */}
      {items.map((item) => (
        <div
          key={item.id}
          className={cn("mobile-grid-item", item.className)}
          style={{
            gridColumn: item.position.columnSpan 
              ? `${item.position.column} / span ${item.position.columnSpan}` 
              : item.position.column,
            gridRow: item.position.rowSpan 
              ? `${item.position.row} / span ${item.position.rowSpan}` 
              : item.position.row,
            zIndex: item.zIndex || 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {item.element}
        </div>
      ))}
    </div>
  );
}

// 专门用于场景布局的组件
interface SceneGridProps {
  backgroundImage?: string;
  items: GridItemConfig[];
  className?: string;
}

export function SceneGrid({ backgroundImage, items, className }: SceneGridProps) {
  return (
    <MobileGridLayout
      config={{
        columns: 12,
        rows: 16,
        aspectRatio: '9/16' // 移动端比例
      }}
      items={items}
      className={className}
    >
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
    </MobileGridLayout>
  );
}

// 简化的按钮 Grid 组件
interface ButtonGridProps {
  columns: number;
  items: React.ReactNode[];
  gap?: string;
  className?: string;
}

export function ButtonGrid({ columns, items, gap = '1rem', className }: ButtonGridProps) {
  return (
    <div 
      className={cn("button-grid", className)}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
        width: '100%',
        justifyItems: 'center',
        alignItems: 'center',
      }}
    >
      {items.map((item, index) => (
        <div key={index}>{item}</div>
      ))}
    </div>
  );
}

// 学习路径 Grid（Duolingo 风格）
interface LearningPathProps {
  steps: Array<{
    id: string;
    component: React.ReactNode;
    isCompleted?: boolean;
    isActive?: boolean;
  }>;
  className?: string;
}

export function LearningPathGrid({ steps, className }: LearningPathProps) {
  return (
    <div className={cn("learning-path-grid", className)}>
      <div 
        className="grid gap-8 py-8 px-4"
        style={{
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridAutoFlow: 'row dense',
        }}
      >
        {steps.map((step, index) => {
          // Z字形路径算法
          const isEven = index % 2 === 0;
          const row = Math.floor(index / 2) + 1;
          const column = isEven ? 2 : (index % 4 === 1 ? 1 : 3);
          
          return (
            <div
              key={step.id}
              className={cn(
                "learning-step-item",
                step.isActive && "active",
                step.isCompleted && "completed"
              )}
              style={{
                gridColumn: column,
                gridRow: row,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {step.component}
              
              {/* 连接线 - 只在移动端显示 */}
              {index < steps.length - 1 && (
                <div 
                  className="connection-line"
                  style={{
                    position: 'absolute',
                    width: '2px',
                    height: '40px',
                    backgroundColor: step.isCompleted ? '#4ade80' : '#d1d5db',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}