
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface EmotionButtonProps {
  emotion: {
    name: string;
    icon: string;
    color: string;
  };
  selected?: boolean;
  onClick: () => void;
}

const EmotionButton = ({ emotion, selected, onClick }: EmotionButtonProps) => {
  const messages = {
    "Happy": "Awesome! Being happy is a good thing and we are glad that you are happy. Now, let's extend your happiness. Cool?",
    "Calm": "Great! Staying calm gives you mental clarity & helps you think straight. You are doing good, no pressure. Now, lets, assess the calmness and provide you support to keep going.",
    "Sad": "Heey, we are sorry for your current state and we are here to support you feel better. Help us in asessing your situation further by taking a quick mental test. Sound cool?",
    "Angry": "Please Calm down. Relax. Take a deep breath. Don't allow anger to win over you. Now, let's take care of that by reducing it to zero. Cool? Begin the test.",
    "Worried": "Have you heard of the word, \"Hakuna Matata?\" It means No Worries. Now read that again. Hakuna Matata. Sing it allitle more as we go onto the quick check up. Sound cool?",
  };

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative z-10 w-full"
      >
        <Button
          onClick={onClick}
          className={cn(
            "relative overflow-hidden transition-all duration-300 group",
            "h-20 w-full sm:h-24 sm:w-24 rounded-2xl", 
            "bg-white/90 backdrop-blur-xl shadow-md",
            selected ? [
              "border-2 border-brand-purple",
              "shadow-lg shadow-brand-purple/30",
              "after:absolute after:inset-0",
              "after:bg-gradient-to-br after:from-brand-purple/20 after:to-brand-blue/20",
              "after:opacity-100"
            ] : [
              "border border-white/40",
              "hover:border-brand-blue/70",
              "hover:bg-brand-blue hover:bg-opacity-90",
              "hover:shadow-lg hover:shadow-brand-blue/10",
              "after:absolute after:inset-0",
              "after:bg-gradient-to-br after:from-brand-blue/80 after:to-brand-blue/80",
              "after:opacity-0 hover:after:opacity-100"
            ],
            "after:transition-opacity after:duration-300"
          )}
        >
          <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
            <span className="text-3xl sm:text-4xl filter drop-shadow-md transition-colors group-hover:text-white">{emotion.icon}</span>
            <span className="text-sm font-medium bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent transition-colors group-hover:text-white">
              {emotion.name}
            </span>
          </div>
        </Button>
      </motion.div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full z-20 mt-4 w-64 sm:w-72"
          >
            <div className="relative">
              <div 
                className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-brand-purple to-brand-blue rotate-45 shadow-sm"
              />
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-purple to-brand-blue p-[1.5px]">
                <div className="relative bg-white/95 backdrop-blur-xl p-4 rounded-2xl">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {messages[emotion.name as keyof typeof messages]}
                    </p>
                    <div className="flex justify-end">
                      <Button 
                        onClick={onClick}
                        className="rounded-full bg-gradient-to-r from-brand-purple to-brand-blue text-white hover:shadow-lg hover:shadow-brand-purple/30 transition-all duration-300"
                        size="sm"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmotionButton;
