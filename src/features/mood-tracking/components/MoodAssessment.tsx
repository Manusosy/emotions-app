
import { AnimatePresence, motion } from "framer-motion";
import { useState, RefObject } from "react";
import EmotionButton from "./EmotionButton";
import QuestionCard from "./QuestionCard";
import { Button } from "@/components/ui/button";

// Emotion data
const emotions = [{
  name: "Happy",
  icon: "😊",
  color: "hover:shadow-yellow-500/20"
}, {
  name: "Calm",
  icon: "😌",
  color: "hover:shadow-green-500/20"
}, {
  name: "Sad",
  icon: "😢",
  color: "hover:shadow-blue-500/20"
}, {
  name: "Angry",
  icon: "😠",
  color: "hover:shadow-red-500/20"
}, {
  name: "Worried",
  icon: "😰",
  color: "hover:shadow-purple-500/20"
}];

// Assessment questions
const questions = [{
  text: "Are you feeling nervous, anxious, or on edge?",
  options: [{
    text: "Not at all",
    points: 0
  }, {
    text: "I have had this feeling for some 1-2 days",
    points: 1
  }, {
    text: "I have had this feeling for 3-4 days",
    points: 2
  }, {
    text: "I have had this feeling for 4-5 days",
    points: 3
  }]
}, {
  text: "Do you struggle to control your worries?",
  options: [{
    text: "Not at all",
    points: 0
  }, {
    text: "I have been struggling for some 1-2 days",
    points: 1
  }, {
    text: "I have been struggling for 3-4 days",
    points: 2
  }, {
    text: "I have been struggling for 4-5 days",
    points: 3
  }]
}];

type MoodAssessmentProps = {
  emotionsRef: RefObject<HTMLDivElement>;
};

const MoodAssessment = ({ emotionsRef }: MoodAssessmentProps) => {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleEmotionSelect = (emotion: string) => {
    if (selectedEmotion === emotion) {
      setShowQuestions(true);
    } else {
      setSelectedEmotion(emotion);
    }
  };

  const handleAnswerSelect = (points: number) => {
    setScore(prev => prev + points);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const resetAll = () => {
    setSelectedEmotion(null);
    setShowQuestions(false);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
  };

  const navigateToJournal = () => {
    console.log("Navigate to journal page");
  };

  return (
    <div className="relative py-12 bg-[#e6f5ff]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-purple-light/20 via-transparent to-brand-blue-light/20" />
      
      <div className="container mx-auto px-4">
        <div ref={emotionsRef} className="max-w-4xl mx-auto relative z-20">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-purple-light rounded-full blur-3xl opacity-20" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-blue-light rounded-full blur-3xl opacity-20" />
            
            <motion.div 
              className="flex justify-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-blue-500 text-white py-2 px-6 rounded-full font-medium text-sm flex items-center shadow-md">
                <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                <span>Start Assessment</span>
                <span className="w-2 h-2 bg-white rounded-full ml-2"></span>
              </div>
            </motion.div>
            
            <div className="relative bg-white/60 backdrop-blur-md rounded-3xl shadow-sm p-5 sm:p-6 border border-white/40">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="font-jakarta text-3xl md:text-4xl font-bold text-[#001A41] leading-tight">
                    How Are You Feeling
                    <span className="text-brand-blue"> Right Now?</span>
                  </h2>
                  <p className="text-sm text-gray-600 font-jakarta font-light max-w-2xl mx-auto">
                    Select your current mood by clicking one of the emojis below
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {!showQuestions && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                      {emotions.map(emotion => (
                        <EmotionButton
                          key={emotion.name}
                          emotion={emotion}
                          selected={selectedEmotion === emotion.name}
                          onClick={() => handleEmotionSelect(emotion.name)}
                        />
                      ))}
                    </div>
                  )}

                  {showQuestions && !showResults && (
                    <QuestionCard
                      question={questions[currentQuestion].text}
                      options={questions[currentQuestion].options}
                      onSelect={handleAnswerSelect}
                      progress={(currentQuestion + 1) / questions.length * 100}
                      isLastQuestion={currentQuestion === questions.length - 1}
                    />
                  )}

                  {showResults && (
                    <div className="space-y-6">
                      <div className="p-6 rounded-2xl bg-white/90 backdrop-blur-lg shadow-md border border-blue-100">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                          Your Assessment Results
                        </h2>
                        {score <= 3 ? (
                          <div className="space-y-4">
                            <p className="text-gray-700 text-base">
                              Your assessment is fine. You are currently not experiencing significant mental health issues.
                            </p>
                            <div className="space-y-3">
                              <p className="text-gray-600 text-sm">
                                Would you like to journal your feelings to maintain your emotional well-being?
                              </p>
                              <Button onClick={navigateToJournal} className="bg-blue-500 hover:bg-blue-600 text-white shadow shadow-blue-500/20 transform transition-all duration-200 hover:scale-105 text-sm">
                                Go to Journal
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-gray-700 text-base">
                              Based on your assessment, you seem to be experiencing significant mental health challenges.
                            </p>
                            <div className="space-y-3">
                              <p className="text-gray-600 text-sm">
                                We recommend either booking a session with a therapist or journaling your feelings.
                              </p>
                              <div className="flex flex-wrap gap-3 justify-center">
                                <Button
                                  className="bg-blue-500 hover:bg-blue-600 text-white shadow shadow-blue-500/20 transform transition-all duration-200 hover:scale-105 text-sm"
                                  onClick={() => console.log("Book therapist")}
                                >
                                  Book a Therapist
                                </Button>
                                <Button
                                  onClick={navigateToJournal}
                                  variant="outline"
                                  className="border-blue-500 text-blue-500 hover:bg-blue-50 transform transition-all duration-200 hover:scale-105 text-sm"
                                >
                                  Go to Journal
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        onClick={resetAll}
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 transform transition-all duration-200 hover:scale-105 text-sm"
                      >
                        Start Over
                      </Button>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodAssessment;
