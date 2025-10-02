import React, { useCallback, useEffect, useMemo, useState } from 'react'

const WORDS = [
  'REACT', 'VITE', 'JAVASCRIPT', 'PROGRAMMING', 'HANGMAN',
  'COMPONENT', 'STATE', 'HOOKS', 'FUNCTION', 'ASYNC', 'ALGORITHM',
  'DEVELOPER', 'INTERFACE', 'LAYOUT', 'STYLES', 'DEBUG', 'PACKAGE', 'MODULE'
]

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const MAX_WRONG = 6

function getRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)]
}

export default function App() {
  const [word, setWord] = useState(() => getRandomWord())
  const [guessed, setGuessed] = useState(() => new Set())
  const [status, setStatus] = useState('playing') // 'playing' | 'won' | 'lost'

  const uniqueLetters = useMemo(() => {
    return new Set(word.split('').filter(ch => /[A-Z]/.test(ch)))
  }, [word])

  const wrongLetters = useMemo(() => {
    return [...guessed].filter(l => !word.includes(l))
  }, [guessed, word])

  const wrongCount = wrongLetters.length

  const resetGame = useCallback(() => {
    setWord(getRandomWord())
    setGuessed(new Set())
    setStatus('playing')
  }, [])

  const handleGuess = useCallback((letter) => {
    if (status !== 'playing') return
    setGuessed(prev => {
      if (prev.has(letter)) return prev
      const next = new Set(prev)
      next.add(letter)

      const wrongNow = [...next].filter(l => !word.includes(l)).length
      if (wrongNow >= MAX_WRONG) {
        setStatus('lost')
      } else {
        const allGuessed = [...uniqueLetters].every(l => next.has(l))
        if (allGuessed) setStatus('won')
      }
      return next
    })
  }, [status, word, uniqueLetters])

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toUpperCase()
      if (/^[A-Z]$/.test(k)) {
        handleGuess(k)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleGuess])

  const revealWord = useCallback(() => {
    const next = new Set(guessed)
    for (const ch of word) {
      if (/[A-Z]/.test(ch)) next.add(ch)
    }
    setGuessed(next)
  }, [guessed, word])

  useEffect(() => {
    if (status === 'lost') revealWord()
  }, [status, revealWord])

  return (
    <div className="page">
      <header className="header">
        <h1>Hangman</h1>
        <p className="subtitle">Guess the word — limited attempts. Use keyboard or click letters.</p>
      </header>

      <main className="game">
        <section className="left">
          <HangmanDrawing wrongCount={wrongCount} />
          <div className="info">
            <div><strong>Wrong guesses:</strong> {wrongLetters.join(', ') || '—'}</div>
            <div><strong>Attempts left:</strong> {Math.max(0, MAX_WRONG - wrongCount)}</div>
          </div>
        </section>

        <section className="right">
          <div className="word">
            {word.split('').map((ch, i) => (
              <span key={i} className={`letter ${/[A-Z]/.test(ch) ? 'alpha' : 'punct'}`}>
                {(/[A-Z]/.test(ch) ? (guessed.has(ch) ? ch : '_') : ch)}
              </span>
            ))}
          </div>

          <div className="keyboard">
            {ALPHABET.map(letter => (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                className="key"
                disabled={guessed.has(letter) || status !== 'playing'}
              >
                {letter}
              </button>
            ))}
          </div>

          <div className="controls">
            <button onClick={resetGame} className="btn">New Game</button>
            <button
              onClick={() => { setGuessed(new Set([...guessed, ...uniqueLetters])); setStatus('won') }}
              className="btn btn-ghost"
            >
              Give Up (Reveal)
            </button>
          </div>

          {status !== 'playing' && (
            <div className={`overlay ${status}`}>
              <div className="overlay-card">
                <h2>{status === 'won' ? 'You won 🎉' : 'You lost ☠️'}</h2>
                <p className="big-word">The word was: <strong>{word}</strong></p>
                <div className="overlay-actions">
                  <button onClick={resetGame} className="btn large">Play Again</button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <small>Fun Guessing!!</small>
      </footer>
    </div>
  )
}

function HangmanDrawing({ wrongCount = 0 }) {
  return (
    <svg className="hangman" viewBox="0 0 200 260">
      <line x1="10" y1="250" x2="150" y2="250" stroke="#222" strokeWidth="6" />
      <line x1="40" y1="20" x2="40" y2="250" stroke="#222" strokeWidth="6" />
      <line x1="40" y1="20" x2="120" y2="20" stroke="#222" strokeWidth="6" />
      <line x1="120" y1="20" x2="120" y2="50" stroke="#222" strokeWidth="6" />
      {wrongCount > 0 && <circle cx="120" cy="80" r="20" stroke="#222" strokeWidth="4" fill="none" />}
      {wrongCount > 1 && <line x1="120" y1="100" x2="120" y2="155" stroke="#222" strokeWidth="4" />}
      {wrongCount > 2 && <line x1="120" y1="115" x2="95" y2="140" stroke="#222" strokeWidth="4" />}
      {wrongCount > 3 && <line x1="120" y1="115" x2="145" y2="140" stroke="#222" strokeWidth="4" />}
      {wrongCount > 4 && <line x1="120" y1="155" x2="95" y2="195" stroke="#222" strokeWidth="4" />}
      {wrongCount > 5 && <line x1="120" y1="155" x2="145" y2="195" stroke="#222" strokeWidth="4" />}
    </svg>
  )
}
