"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MobileGridLayout, ButtonGrid, GridItemConfig } from './components/MobileGridLayout';
import './styles/mobile-grid.css';

// Image assets from Figma
const dividerLine = "http://localhost:3845/assets/555e55d3391ff9e4459f0078704399469ce1854d.svg";
const checkIcon = "http://localhost:3845/assets/45715e73233641c543bddfa6966436eb57ecefbc.svg";
const checkIconOther = "http://localhost:3845/assets/0e80c504f7b568c33185af1b3a3e04e7f4bb6ef8.svg";
const checkBg = "http://localhost:3845/assets/235c871a7a85643c6e276605fdbe7c3918a796d3.svg";
const dotIndicator = "http://localhost:3845/assets/a4c2c2b2433953441b43dcb5b366e3318cbca2c7.svg";

// Goal illustrations
const selfUnderstandingImg = "http://localhost:3845/assets/4d0e9e699d69755aa4fd8a273cab783d5ac8c6b1.png";
const improveRelationshipsImg = "http://localhost:3845/assets/f280ffb73e17d3c790e47a4ae571d284801a9804.png";
const careerPrepImg = "http://localhost:3845/assets/015b27bbce7e43e3cac065a86a0d6e072eb8c531.png";
const examPrepImg = "http://localhost:3845/assets/5c42f010a91dc3590c05d1eaeaf78aaca9623cc9.png";
const otherReasonsImg = "http://localhost:3845/assets/ed95d663a3fb3abf42839eb90861e2a92c17b3a1.png";

// Bottom illustrations - from Figma
const horseAndFoxMainImg = "http://localhost:3845/assets/eb4fd1f4fa09a23fa0b38fc1f9274fbf747adc4b.png";
const foxDetailImg = "http://localhost:3845/assets/b4bbcb22f0e99879a9fbdaf8eca2f30fbd9a5939.png";

interface LearningGoal {
  id: string;
  title: string;
  selected: boolean;
  imageUrl: string;
}

export default function PsyQuestLearningGoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<LearningGoal[]>([
    {
      id: 'self-understanding',
      title: 'Self-understanding',
      selected: true,
      imageUrl: selfUnderstandingImg,
    },
    {
      id: 'improve-relationships',
      title: 'Improve relationships',
      selected: false,
      imageUrl: improveRelationshipsImg,
    },
    {
      id: 'career-preparation',
      title: 'Career preparation',
      selected: false,
      imageUrl: careerPrepImg,
    },
    {
      id: 'exam-preparation',
      title: 'Exam preparation',
      selected: false,
      imageUrl: examPrepImg,
    },
    {
      id: 'other-reasons',
      title: 'Other reasons',
      selected: true,
      imageUrl: otherReasonsImg,
    },
  ]);

  const toggleGoal = (id: string) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, selected: !goal.selected } : goal
    ));
  };

  // 创建 Grid 布局项目配置
  const gridItems: GridItemConfig[] = [
    // Header section
    {
      id: 'header',
      position: { column: 1, row: 1, columnSpan: 12, rowSpan: 2 },
      element: (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center w-full"
        >
          <h1 className="text-3xl font-extrabold text-black leading-tight tracking-tight mb-4">
            Learning Goals
          </h1>
          <div className="w-full max-w-md mx-auto h-px">
            <img src={dividerLine} alt="" className="w-full h-full object-cover" />
          </div>
        </motion.div>
      ),
      zIndex: 10
    },
    // Question section
    {
      id: 'question',
      position: { column: 1, row: 3, columnSpan: 12, rowSpan: 1 },
      element: (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center px-4"
        >
          <h2 className="text-xl font-bold text-black leading-tight">
            What is your main goal in learning psychology?
          </h2>
        </motion.div>
      ),
      zIndex: 10
    },
    // Goals - Top row (2 items)
    {
      id: 'goal-1',
      position: { column: 3, row: 5, columnSpan: 3 },
      element: (
        <GoalItem 
          goal={goals[0]}
          onToggle={() => toggleGoal('self-understanding')}
          delay={0.1}
        />
      ),
      zIndex: 20
    },
    {
      id: 'goal-2', 
      position: { column: 7, row: 5, columnSpan: 3 },
      element: (
        <GoalItem 
          goal={goals[1]}
          onToggle={() => toggleGoal('improve-relationships')}
          delay={0.2}
        />
      ),
      zIndex: 20
    },
    // Goals - Bottom row (3 items)
    {
      id: 'goal-3',
      position: { column: 2, row: 7, columnSpan: 3 },
      element: (
        <GoalItem 
          goal={goals[2]}
          onToggle={() => toggleGoal('career-preparation')}
          delay={0.3}
        />
      ),
      zIndex: 20
    },
    {
      id: 'goal-4',
      position: { column: 5, row: 7, columnSpan: 2 },
      element: (
        <GoalItem 
          goal={goals[3]}
          onToggle={() => toggleGoal('exam-preparation')}
          delay={0.4}
        />
      ),
      zIndex: 20
    },
    {
      id: 'goal-5',
      position: { column: 8, row: 7, columnSpan: 3 },
      element: (
        <GoalItem 
          goal={goals[4]}
          onToggle={() => toggleGoal('other-reasons')}
          delay={0.5}
        />
      ),
      zIndex: 20
    },
    // Next Button
    {
      id: 'next-button',
      position: { column: 4, row: 9, columnSpan: 5 },
      element: (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative"
        >
          <button 
            onClick={() => router.push('/psyquest/city-map')}
            className="relative bg-[#c6bdb4] text-white font-extrabold text-lg rounded-[35px] border-2 border-[#666666] w-[190px] h-[48px] flex items-center justify-center hover:bg-[#b5aca3] transition-colors shadow-lg"
            style={{ fontFamily: 'Urbanist, sans-serif' }}
          >
            Next Step
            
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-[5.7px] h-[5.7px]">
              <img src={dotIndicator} alt="" className="w-full h-full" />
            </div>
            
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-[5.7px] h-[5.7px]">
              <img src={dotIndicator} alt="" className="w-full h-full" />
            </div>
          </button>
        </motion.div>
      ),
      zIndex: 30
    },
    // Bottom Illustrations
    {
      id: 'illustration-main',
      position: { column: 2, row: 11, columnSpan: 6 },
      element: (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0 }}
        >
          <img 
            src={horseAndFoxMainImg} 
            alt="Horse and Fox Illustration" 
            className="w-48 h-32 object-contain"
          />
        </motion.div>
      ),
      zIndex: 5
    },
    {
      id: 'illustration-detail',
      position: { column: 8, row: 11, columnSpan: 3 },
      element: (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
        >
          <img 
            src={foxDetailImg} 
            alt="Fox Detail" 
            className="w-24 h-24 object-contain"
          />
        </motion.div>
      ),
      zIndex: 5
    }
  ];

  return (
    <div className="min-h-screen bg-[#f3f3f3] relative overflow-hidden">
      <div className="w-full max-w-md mx-auto min-h-screen px-4 py-8">
        <MobileGridLayout
          config={{
            columns: 12,
            rows: 12,
            gap: '0.5rem'
          }}
          items={gridItems}
          className="scene-grid mobile-layer-background"
        />
      </div>
    </div>
  );
}

interface GoalItemProps {
  goal: LearningGoal;
  onToggle: () => void;
  delay: number;
}

function GoalItem({ goal, onToggle, delay }: GoalItemProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="flex flex-col items-center cursor-pointer group"
      onClick={onToggle}
    >
      {/* Goal Image Circle */}
      <div className="relative mb-3">
        <motion.div 
          className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden transition-transform duration-200 group-hover:scale-105"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img 
            src={goal.imageUrl} 
            alt={goal.title}
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        {/* Selection indicator */}
        {goal.selected && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-[37px] h-[37px] flex items-center justify-center"
          >
            {/* Circular background */}
            <div className="absolute inset-0 w-full h-full">
              <img src={checkBg} alt="" className="w-full h-full" />
            </div>
            
            {/* Check icon positioned inside circle */}
            <div className="absolute w-[32px] h-[32px] flex items-center justify-center">
              <img 
                src={goal.id === 'self-understanding' ? checkIcon : checkIconOther} 
                alt="Selected" 
                className="w-full h-full" 
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Label */}
      <motion.div 
        className={`
          bg-gray-200 border border-gray-800 rounded-xl px-2 py-1 sm:px-3 sm:py-1.5
          transition-colors duration-200
          ${goal.selected ? 'bg-blue-100 border-blue-500' : 'group-hover:bg-gray-300'}
        `}
        whileHover={{ scale: 1.02 }}
      >
        <span className="text-xs sm:text-sm font-bold text-gray-900 text-center block whitespace-nowrap">
          {goal.title}
        </span>
      </motion.div>
    </motion.div>
  );
}