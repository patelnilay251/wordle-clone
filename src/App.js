import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './App.css';

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

function App() {
  const [solution, setSolution] = useState('');
  const [guesses, setGuesses] = useState(Array(MAX_GUESSES).fill(''));
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [shakingRow, setShakingRow] = useState(-1);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await axios.get('https://random-word-api.herokuapp.com/word?length=5');
        setSolution(response.data[0].toUpperCase());
        console.log(response.data[0].toUpperCase())
      } catch (error) {
        console.error('Error fetching words:', error);
      }
    };

    fetchWords();
  }, []);

  const handleKeyDown = (event) => {
    if (gameOver) return;

    if (event.key === 'Enter') {
      if (currentGuess.length !== WORD_LENGTH) {
        setShakingRow(guesses.findIndex(guess => guess === ''));
        setTimeout(() => setShakingRow(-1), 500);
        return;
      }

      const newGuesses = [...guesses];
      const currentGuessIndex = newGuesses.findIndex(guess => guess === '');
      newGuesses[currentGuessIndex] = currentGuess;

      setGuesses(newGuesses);
      setCurrentGuess('');

      if (currentGuess === solution || currentGuessIndex === MAX_GUESSES - 1) {
        setGameOver(true);
      }
    } else if (event.key === 'Backspace') {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (currentGuess.length < WORD_LENGTH && event.key.match(/^[A-Za-z]$/)) {
      setCurrentGuess(currentGuess + event.key.toUpperCase());
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, guesses, gameOver, solution]);

  const letterVariants = {
    initial: { scale: 1, rotateX: 0 },
    pop: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.3 }
    },
    flip: {
      rotateX: [0, 90, 0],
      transition: {
        duration: 0.5,
        times: [0, 0.5, 1],
        ease: "easeInOut"
      }
    },
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 }
    },
  };

  const correctVariants = {
    animate: {
      scale: [1, 1.1, 1],
      rotateY: [0, 360],
      boxShadow: [
        "0 0 0 rgba(83, 141, 78, 0)",
        "0 0 20px rgba(83, 141, 78, 0.8)",
        "0 0 0 rgba(83, 141, 78, 0)"
      ],
      transition: { duration: 1, repeat: Infinity, repeatDelay: 1 }
    }
  };

  return (
    <div className="App" tabIndex="0">
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Wordle Clone
      </motion.h1>
      <div className="game-board">
        <AnimatePresence>
          {guesses.map((guess, i) => (
            <motion.div
              key={i}
              className={`guess-row ${shakingRow === i ? 'shaking' : ''}`}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              transition={{ delay: i * 0.1 }}
              variants={letterVariants}
              onAnimationComplete={shakingRow === i ? 'shake' : ''}
            >
              {Array(WORD_LENGTH).fill().map((_, j) => {
                const letter = guess[j] || (i === guesses.findIndex(g => g === '') ? currentGuess[j] : '');
                let className = 'letter';
                if (guess && guess[j] === solution[j]) {
                  className += ' correct';
                } else if (guess && solution.includes(guess[j])) {
                  className += ' present';
                } else if (guess) {
                  className += ' absent';
                }
                return (
                  <motion.div
                    key={j}
                    className={className}
                    variants={letterVariants}
                    initial="initial"
                    animate={guess ? 'flip' : letter ? 'pop' : 'initial'}
                  >
                    {letter}
                  </motion.div>
                );
              })}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {gameOver && (
        <motion.div
          className="game-over"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Game Over! The word was {solution}
        </motion.div>
      )}
    </div>
  );
}

export default App;