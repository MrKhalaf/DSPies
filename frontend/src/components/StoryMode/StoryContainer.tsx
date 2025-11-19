import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimpleDSPyDemo } from '../../hooks/useSimpleDSPyDemo';
import { Step1_Intro } from './steps/Step1_Intro';
import { Step2_Problem } from './steps/Step2_Problem';
import { Step3_Wizards } from './steps/Step3_Wizards';
import { Step4_HowItWorks } from './steps/Step4_HowItWorks';
import { Step5_DefineGood } from './steps/Step5_DefineGood';
import { Step6_Variants } from './steps/Step6_Variants';
import { Step7_Competition } from './steps/Step7_Competition';
import { Step8_LiveDemo } from './steps/Step8_LiveDemo';
import { Step9_Results } from './steps/Step9_Results';
import { Step10_Conclusion } from './steps/Step10_Conclusion';
import { GameLayout } from './components/GameLayout';
import { NavigationButtons } from './components/NavigationButtons';
import './StoryMode.css';

export const StoryContainer: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [step, setStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [hasStartedDemo, setHasStartedDemo] = useState(false);

  // Use the existing hook for logic
  const { variants, isRunning, winner, startOptimization, reset } = useSimpleDSPyDemo();

  const steps = [
    Step1_Intro,
    Step2_Problem,
    Step3_Wizards,
    Step4_HowItWorks,
    Step5_DefineGood,
    Step6_Variants,
    Step7_Competition,
    Step8_LiveDemo,
    Step9_Results,
    Step10_Conclusion
  ];

  const CurrentStep = steps[step];

  const nextStep = () => {
    if (step < steps.length - 1) setStep(s => s + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handleRunDemo = async (input: string) => {
    setHasStartedDemo(true);
    await startOptimization(input || "I was double-charged after upgrading my plan");
  };

  return (
    <GameLayout title={`CHAPTER ${step + 1}`} level={step + 1}>
      <div className="w-full h-full flex flex-col">
        {/* The Step Content (The Scene) */}
        <div className="flex-grow relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <CurrentStep
                onNext={nextStep}
                userInput={userInput}
                setUserInput={setUserInput}
                onRunDemo={handleRunDemo}
                variants={variants}
                isRunning={isRunning}
                winner={winner}
                hasStartedDemo={hasStartedDemo}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls Overlay (if needed, but steps might handle their own controls now) */}
        <div className="absolute bottom-4 right-4 z-50 flex gap-4">
          <NavigationButtons
            onBack={prevStep}
            onNext={nextStep}
            canGoBack={step > 0}
            canGoNext={step < steps.length - 1}
            isNextDisabled={step === 7 && !hasStartedDemo}
          />
        </div>

        <button
          onClick={onExit}
          className="absolute top-4 right-4 text-xs text-white/50 hover:text-white z-50 font-mono"
        >
          [ESC] EXIT
        </button>
      </div>
    </GameLayout>
  );
};
