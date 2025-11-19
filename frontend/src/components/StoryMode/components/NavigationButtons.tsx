import React from 'react';

interface NavigationButtonsProps {
    onBack: () => void;
    onNext: () => void;
    canGoBack: boolean;
    canGoNext: boolean;
    isNextDisabled?: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
    onBack,
    onNext,
    canGoBack,
    canGoNext,
    isNextDisabled = false
}) => {
    return (
        <div className="flex gap-4">
            <button
                onClick={onBack}
                disabled={!canGoBack}
                className="retro-btn"
            >
                BACK
            </button>

            {canGoNext && (
                <button
                    onClick={onNext}
                    disabled={isNextDisabled}
                    className="retro-btn"
                    style={{ borderColor: '#ff0', color: '#ff0' }}
                >
                    NEXT
                </button>
            )}
        </div>
    );
};
