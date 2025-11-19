import React from 'react';
import { motion } from 'framer-motion';
import { StoryStepProps } from '../types';

export const Step6_Variants: React.FC<StoryStepProps> = () => {
    return (
        <div className="w-full h-full flex flex-col relative">
            {/* Stage: The Variants */}
            <div className="rpg-character-stage flex gap-8 items-end pb-12">
                {/* Variant 1 */}
                <div className="flex flex-col items-center">
                    <div className="text-6xl mb-2">📜</div>
                    <div className="text-[10px] text-blue-300">VARIANT 1</div>
                </div>

                {/* Variant 2 */}
                <div className="flex flex-col items-center">
                    <div className="text-6xl mb-2">📜</div>
                    <div className="text-[10px] text-purple-300">VARIANT 2</div>
                </div>

                {/* Variant 3 */}
                <div className="flex flex-col items-center">
                    <div className="text-6xl mb-2">📜</div>
                    <div className="text-[10px] text-orange-300">VARIANT 3</div>
                </div>
            </div>

            {/* Dialogue Box */}
            <div className="rpg-dialogue-box">
                <h3 className="text-blue-400 font-bold mb-2 text-lg">STEP 2: THE VARIANTS</h3>
                <p className="typing-effect">
                    The wizards have worked their magic! They've each written a different prompt. <br />
                    Now we have 3 candidates competing for the top spot.
                </p>
            </div>
        </div>
    );
};
