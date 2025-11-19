export interface StoryStepProps {
    onNext: () => void;
    userInput: string;
    setUserInput: (s: string) => void;
    onRunDemo: (input: string) => void;
    variants: any[];
    isRunning: boolean;
    winner?: string;
    hasStartedDemo: boolean;
}
