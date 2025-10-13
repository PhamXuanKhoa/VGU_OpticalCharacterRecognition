import { useEffect, useState } from 'react';

const YAMATE_SEQUENCE = 'yamate';

const useYamateEasterEgg = (soundUrl: string) => {
    const [keySequence, setKeySequence] = useState<string>('');

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const activeElement = document.activeElement;
            if (activeElement?.tagName === 'TEXTAREA' || activeElement?.tagName === 'INPUT') {
                setKeySequence('');
                return;
            }

            const newKeySequence = (keySequence + event.key).slice(-YAMATE_SEQUENCE.length);
            setKeySequence(newKeySequence);

            if (newKeySequence === YAMATE_SEQUENCE) {
                const audio = new Audio(soundUrl);
                audio.play();
                console.log("Trigger the easter egg...");
                setKeySequence('');
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [keySequence, soundUrl]);
};

const YamatePlayer = () => {
    useYamateEasterEgg('https://www.myinstants.com/media/sounds/yamate-kudasai.mp3');

    return null;
};

export default YamatePlayer;