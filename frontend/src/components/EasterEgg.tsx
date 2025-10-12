import { useEffect, useState } from 'react';

const YAMATE_SEQUENCE = 'yamate';

// The custom hook logic is kept separate for clarity but remains in the same file.
const useYamateEasterEgg = (soundUrl: string) => {
    const [keySequence, setKeySequence] = useState<string>('');

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Do not trigger the easter egg if the user is typing in a textarea or input field.
            const activeElement = document.activeElement;
            if (activeElement?.tagName === 'TEXTAREA' || activeElement?.tagName === 'INPUT') {
                setKeySequence(''); // Reset sequence if user starts typing in a restricted field
                return;
            }

            // Append the pressed key to the current sequence.
            const newKeySequence = (keySequence + event.key).slice(-YAMATE_SEQUENCE.length);
            setKeySequence(newKeySequence);

            // If the sequence matches, play the sound and reset.
            if (newKeySequence === YAMATE_SEQUENCE) {
                const audio = new Audio(soundUrl);
                audio.play();
                setKeySequence(''); // Reset after playing
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Cleanup function to remove the event listener when the component unmounts.
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [keySequence, soundUrl]);
};

/**
 * A component that enables the "yamate" easter egg.
 * It listens for the key sequence and plays a sound.
 * This component does not render any visible UI elements.
 */
const YamatePlayer = () => {
    // Ensure the path to your sound file in the `public` folder is correct.
    useYamateEasterEgg('/yamate.mp3');

    return null; // This component is purely for side effects and renders nothing.
};

export default YamatePlayer;