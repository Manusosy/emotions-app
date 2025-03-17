
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";

interface QuestionCardProps {
  question: string;
  options: {
    text: string;
    points: number;
  }[];
  onSelect: (points: number) => void;
  progress: number;
  isLastQuestion: boolean;
}

const QuestionCard = ({ question, options, onSelect, progress, isLastQuestion }: QuestionCardProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleNext = () => {
    if (selectedOption !== null) {
      onSelect(selectedOption);
      setSelectedOption(null); // Reset selection after submitting
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      key={question} // This ensures the animation triggers on question change
      className="w-full max-w-3xl mx-auto"
    >
      <Card className="p-8 bg-white shadow-lg border-0">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-right text-sm text-gray-500">
            Question {Math.ceil(progress / (100 / 2))}/2
          </div>
        </div>

        {/* Question */}
        <h3 className="text-2xl font-semibold text-gray-900 mb-8">
          {question}
        </h3>

        {/* Options */}
        <RadioGroup 
          className="space-y-4" 
          value={selectedOption?.toString() || ""}
          onValueChange={(value) => setSelectedOption(Number(value))}
        >
          {options.map((option) => (
            <div
              key={option.text}
              className="flex items-center space-x-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <RadioGroupItem
                value={option.points.toString()}
                id={option.text}
                className="h-5 w-5 border-2 border-gray-300"
              />
              <Label
                htmlFor={option.text}
                className="flex-1 cursor-pointer text-gray-700"
              >
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {/* Navigation Button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleNext}
            disabled={selectedOption === null}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isLastQuestion ? "Submit" : "Next"}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default QuestionCard;
