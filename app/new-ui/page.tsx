"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { Lock, LockOpen } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function NewUIPage() {
  const [isClicked, setIsClicked] = useState(false);
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [isPaperDown, setIsPaperDown] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleClick = () => {
    if (!isClicked) {
      setIsClicked(true);
    } else if (isClicked) {
      // Toggle flip state when envelope is clicked
      setIsUnlocked(!isUnlocked);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "1233") {
      setIsUnlocked(true);
      console.log("Password correct! Lock opened.");
    } else {
      console.log("Incorrect password");
    }
  };

  const handleEnvelopeOpen = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发外层的翻转
    setIsEnvelopeOpen(!isEnvelopeOpen);
  };

  const handlePaperClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    setIsPaperDown(!isPaperDown);
  };

  const handleStanfordTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    setIsZoomed(!isZoomed);
  };

  // 对角线翻转参数 (AD axis, swapOrientation=false)
  const preZ = 45; // 预旋转：将A-D对角线对齐到X轴
  const postZ = -45; // 回旋转：转回原始方向

  return (
    <div
      className={cn(
        "min-h-screen bg-gray-100 flex items-center justify-center",
        !isClicked && "cursor-pointer"
      )}
      onClick={handleClick}
    >
      <motion.div
        style={{
          width: 800,
          height: 500,
          display: "grid",
          placeItems: "center",
          perspective: 1200,
        }}
        animate={{
          y: isZoomed ? 600 : 0,
        }}
        transition={{ duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
      >
        {/* 初始动画：信封飞入 */}
        <motion.div
          initial={{ rotate: 90, y: -1000 }}
          animate={isClicked ? { rotate: 0, y: 0 } : { rotate: 90, y: -1000 }}
          transition={{ duration: 1.2, type: "spring", bounce: 0.1 }}
        >
          {/* 对角线翻转容器 */}
          <div
            style={{
              width: 800,
              height: 500,
              display: "grid",
              placeItems: "center",
              perspective: 1200,
              cursor: isClicked ? "pointer" : "default",
            }}
          >
            {/* 向下位移容器 */}
            <motion.div
              style={{
                transformStyle: "preserve-3d",
                width: 800,
                height: 500,
              }}
              initial={{ y: 0 }}
              animate={{ y: (isUnlocked ? 150 : 0) + (isPaperDown ? 700 : 0) }}
              transition={{ y: { duration: 1.0, ease: [0.33, 1, 0.68, 1] } }}
            >
              {/* 预旋转：把A-D对角线对齐到X轴 */}
              <motion.div
                style={{
                  transformStyle: "preserve-3d",
                  width: 800,
                  height: 500,
                }}
                animate={{ rotateZ: preZ }}
                initial={{ rotateZ: preZ }}
              >
                {/* 核心翻转：绕X轴180° */}
                <motion.div
                  style={{
                    transformStyle: "preserve-3d",
                    width: 800,
                    height: 500,
                  }}
                  initial={{ rotateX: 0 }}
                  animate={{ rotateX: isUnlocked ? 180 : 0 }}
                  transition={{
                    rotateX: { duration: 1.0, ease: [0.33, 1, 0.68, 1] },
                  }}
                >
                  {/* 回旋转：把坐标系转回原始朝向 */}
                  <div
                    style={{
                      transformStyle: "preserve-3d",
                      transform: `rotateZ(${postZ}deg)`,
                      width: 800,
                      height: 500,
                    }}
                  >
                    {/* 卡片本体：正反两面 */}
                    <div
                      style={{
                        position: "relative",
                        width: 800,
                        height: 500,
                        borderRadius: 16,
                        transformStyle: "preserve-3d",
                      }}
                    >
                      {/* 正面 */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: 16,
                          background: "#fbbf24",
                          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                          backfaceVisibility: "hidden",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 5,
                        }}
                      >
                        {/* 锁图标 */}
                        <div style={{ marginBottom: 16 }}>
                          {isUnlocked ? (
                            <LockOpen className="size-6 text-green-600" />
                          ) : (
                            <Lock className="size-6 text-neutral-700" />
                          )}
                        </div>

                        {/* 密码输入 */}
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handlePasswordSubmit(e);
                            }
                          }}
                          placeholder="Password"
                          className="w-48 border-neutral-700 focus-visible:ring-yellow-500"
                          disabled={isUnlocked}
                        />
                      </div>

                      {/* 背面 */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "#fbbf24",
                          borderRadius: isEnvelopeOpen ? 0 : 16,
                          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                          transform: "rotateX(180deg)", // 背面预先翻转180度
                          backfaceVisibility: "hidden",
                          overflow: "visible",
                          zIndex: 2,
                        }}
                      ></div>
                      {/* 白纸从下往上弹出 */}
                      <motion.div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 10,
                          width: 600,
                          height: 480,
                          transform: "rotateX(180deg)", // 背面预先翻转180度
                          overflow: "visible",
                          background: "white",
                          borderRadius: 8,
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                          zIndex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        initial={{ x: 700, opacity: 0 }}
                        animate={{
                          x:
                            (isEnvelopeOpen ? -100 : 700) +
                            (isPaperDown ? -700 : 0),
                          // y: isPaperDown ? -600 : 0, // 抵消信封的向下移动
                          opacity: isEnvelopeOpen ? 1 : 0,
                          scale: isZoomed ? 2 : 1,
                        }}
                        transition={{
                          x: {
                            duration: isPaperDown ? 1.0 : 0.5,
                            delay: isEnvelopeOpen ? 0.3 : 0,
                            ease: isPaperDown
                              ? [0.68, 1, 0.33, 1]
                              : [0.25, 0.8, 0.25, 1],
                          },
                          opacity: {
                            duration: 0.5,
                            delay: isEnvelopeOpen ? 0.3 : 0,
                            ease: [0.25, 0.8, 0.25, 1],
                          },
                        }}
                        onClick={handlePaperClick}
                      >
                        <div
                          style={{
                            transform: "rotateX(180deg)",
                            width: 480,
                            height: 600,
                            background: "white",
                            borderRadius: 8,
                            rotate: "90deg",
                          }}
                        >
                          <div
                            style={{
                              padding: "40px",
                              fontFamily: "Georgia, serif",
                              fontSize: "12px",
                              lineHeight: "1.6",
                              color: "#333",
                              height: "100%",
                              overflow: "auto",
                            }}
                          >
                            {/* 信头 */}
                            <div
                              style={{
                                textAlign: "center",
                                marginBottom: "30px",
                              }}
                            >
                              <h1
                                style={{
                                  fontSize: "18px",
                                  fontWeight: "bold",
                                  color: "#8C1515",
                                  margin: "0 0 5px 0",
                                }}
                                onClick={handleStanfordTitleClick}
                              >
                                STANFORD UNIVERSITY
                              </h1>
                              <p
                                style={{
                                  fontSize: "11px",
                                  margin: "0 0 15px 0",
                                  fontStyle: "italic",
                                }}
                              >
                                Office of Undergraduate Admission
                              </p>
                              <p style={{ fontSize: "10px", margin: 0 }}>
                                December 15, 2024
                              </p>
                            </div>

                            {/* 正文 */}
                            <div>
                              <p style={{ marginBottom: "20px" }}>
                                Dear Future Cardinal,
                              </p>

                              <p style={{ marginBottom: "20px" }}>
                                <strong style={{ color: "#8C1515" }}>
                                  Congratulations!
                                </strong>{" "}
                                I am delighted to offer you admission to
                                Stanford University's Class of 2029.
                              </p>

                              <p style={{ marginBottom: "20px" }}>
                                Out of nearly 60,000 applicants, you are among
                                the select few who demonstrated exceptional
                                academic achievement, intellectual curiosity,
                                and personal qualities that will contribute
                                meaningfully to our community.
                              </p>

                              <p style={{ marginBottom: "20px" }}>
                                Your journey to Stanford represents years of
                                dedication, and we are excited to support your
                                continued growth as a scholar, innovator, and
                                leader.
                              </p>

                              <p style={{ marginBottom: "30px" }}>
                                Welcome to the Stanford family. We cannot wait
                                to see the impact you will make on our campus
                                and in the world.
                              </p>

                              {/* 签名 */}
                              <div style={{ marginTop: "40px" }}>
                                <p style={{ marginBottom: "5px" }}>
                                  Sincerely,
                                </p>
                                <p
                                  style={{
                                    marginBottom: "5px",
                                    fontStyle: "italic",
                                    fontSize: "14px",
                                  }}
                                >
                                  Richard H. Shaw
                                </p>
                                <p style={{ fontSize: "10px", margin: 0 }}>
                                  Dean of Admission and Financial Aid
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* 信封封口在左侧（翻转后的顶部） */}
                      <motion.div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          width: 70,
                          height: "100%",
                          background: "#fbbf24",
                          borderRadius: isEnvelopeOpen ? 0 : 16,
                          overflow: isEnvelopeOpen ? "visible" : "hidden",
                          zIndex: isEnvelopeOpen ? -1 : 3,
                        }}
                        animate={{}}
                      >
                        <motion.div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: "#f59e0b",
                            clipPath:
                              "polygon(0 0%, 0 100%, 100% 80%, 100% 20%)",
                            cursor: "pointer",
                            transformOrigin: "0% 50%",
                          }}
                          animate={{
                            rotateY: isEnvelopeOpen ? -180 : 0,
                          }}
                          transition={{
                            duration: 0.3,
                          }}
                          onClick={handleEnvelopeOpen}
                        />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
