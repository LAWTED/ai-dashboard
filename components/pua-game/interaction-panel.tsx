import React from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

// Define types
type InteractionMode = "idle" | "choices" | "dice";

interface Choice {
  text: string;
  toolCallId: string;
}

interface InteractionPanelProps {
  interactionMode: InteractionMode;
  currentChoices: Choice[];
  diceValue: number | null;
  isManualRolling: boolean;
  gameStarted: boolean;
  onSelectChoice: (choice: string, toolCallId: string) => void;
  onDiceClick: () => void;
  onSendHelp: () => void;
  startGame: () => void;
}

export function InteractionPanel({
  interactionMode,
  currentChoices,
  diceValue,
  isManualRolling,
  gameStarted,
  onSelectChoice,
  onDiceClick,
  onSendHelp,
  startGame,
}: InteractionPanelProps) {
  if (!gameStarted) {
    // Game not started, show start button
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Button
          onClick={startGame}
          size="lg"
          className="flex items-center gap-2 px-8 py-6 text-lg"
        >
          <Play className="h-5 w-5" />
          开始游戏
        </Button>
      </div>
    );
  }

  // Based on current interaction mode
  switch (interactionMode) {
    case "choices":
      return (
        <div className="space-y-2">
          <div className="text-center mb-3  text-muted-foreground">
            请选择你的行动:
          </div>
          {currentChoices.map((choice, choiceIndex) => (
            <Button
              key={choiceIndex}
              variant="secondary"
              size="sm"
              className="w-full text-left justify-start "
              onClick={() => onSelectChoice(choice.text, choice.toolCallId)}
            >
              {choice.text}
            </Button>
          ))}
        </div>
      );

    case "dice":
      return (
        <div className="flex flex-col items-center justify-center py-4">
          {diceValue === null ? (
            <>
              <div className="text-center mb-4">点击骰子来决定你的行动结果</div>
              <button
                onClick={() => !isManualRolling && onDiceClick()}
                disabled={isManualRolling}
                className="relative w-24 h-24 mb-4 cursor-pointer hover:scale-110 transition-transform disabled:cursor-not-allowed"
              >
                <div
                  className={`absolute inset-0 flex items-center justify-center ${
                    isManualRolling ? "animate-spin" : ""
                  }`}
                >
                  <div
                    className={`${
                      isManualRolling
                        ? "rounded-full h-16 w-16 border-b-2 border-primary"
                        : ""
                    }`}
                  ></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl">🎲</span>
                </div>
              </button>
              <div className=" text-muted-foreground text-center">
                {isManualRolling
                  ? "骰子正在转动..."
                  : "骰子结果将决定你的行动是否成功"}
                <br />
                <span className="text-xs">(1-10: 失败, 11-20: 成功)</span>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-4  font-medium">骰子结果已出:</div>
              <div className="w-24 h-24 mb-4 bg-background/60 rounded-lg flex items-center justify-center">
                <div className="text-4xl font-bold">{diceValue}</div>
              </div>
              <div
                className={`text-center font-semibold ${
                  diceValue > 10 ? "text-green-600" : "text-red-600"
                }`}
              >
                {diceValue > 10 ? "成功!" : "失败!"}
              </div>
              <div className="mt-3  text-muted-foreground text-center">
                等待教授的回应...
              </div>
            </>
          )}
        </div>
      );

    default:
      // Idle mode
      return (
        <div className=" text-center text-muted-foreground py-4">
          <p className="mb-2">当前没有可用选项</p>
          <Button variant="ghost" onClick={onSendHelp} className="mt-20">
            请给我一些可以选择的行动(ops, 卡死了)
          </Button>
        </div>
      );
  }
}
