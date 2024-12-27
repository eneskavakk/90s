import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const INITIAL_SPEED = 800;
const MAX_LEVEL = 10;

const GameContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #000;
  padding: 10px;
  position: relative;
`;

const GameBoard = styled.div`
  display: grid;
  grid-template-rows: repeat(${GRID_HEIGHT}, 1fr);
  grid-template-columns: repeat(${GRID_WIDTH}, 1fr);
  background: #000;
  border: 2px solid #333;
  width: min(90vw, 90vh * 0.5);
  height: min(90vh, 180vw);
  max-width: 400px;
  max-height: 800px;
  position: relative;
  gap: 1px;
`;

const Cell = styled.div`
  width: 100%;
  height: 100%;
  background: ${(props) => props.$color || "#111"};
  border: ${(props) =>
    props.$color ? "1px solid rgba(255,255,255,0.2)" : "1px solid #222"};
  box-shadow: ${(props) =>
    props.$color ? "inset 0 0 4px rgba(255,255,255,0.1)" : "none"};
`;

const NextPieceDisplay = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 80px;
  height: 80px;
  background: #111;
  border: 2px solid #333;
  display: grid;
  grid-template-rows: repeat(4, 1fr);
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  padding: 5px;
`;

const ScorePanel = styled.div`
  position: absolute;
  top: 100px;
  right: 10px;
  width: 80px;
  background: #111;
  border: 2px solid #333;
  padding: 5px;
  text-align: center;

  h2 {
    color: #fff;
    font-size: 0.7rem;
    margin-bottom: 3px;
  }

  p {
    color: #fff;
    font-size: 0.9rem;
  }
`;

const LevelPanel = styled(ScorePanel)`
  top: 160px;
`;

const GameOverScreen = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 2rem;
  gap: 20px;
  z-index: 10;
`;

const TETROMINOES = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: "#00f0f0",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#0000f0",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "#f0a000",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#f0f000",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#00f000",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#a000f0",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#f00000",
  },
};

const TetrisGame = ({ onGameOver }) => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  function createEmptyBoard() {
    return Array(GRID_HEIGHT)
      .fill()
      .map(() => Array(GRID_WIDTH).fill(null));
  }

  const checkCollision = useCallback(
    (piece) => {
      if (!piece) return true;

      const shape = piece.shape;
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const boardX = piece.position.x + x;
            const boardY = piece.position.y + y;

            if (
              boardX < 0 ||
              boardX >= GRID_WIDTH ||
              boardY >= GRID_HEIGHT ||
              (boardY >= 0 && board[boardY][boardX])
            ) {
              return true;
            }
          }
        }
      }
      return false;
    },
    [board]
  );

  const getRandomPiece = useCallback(() => {
    const pieces = Object.keys(TETROMINOES);
    const type = pieces[Math.floor(Math.random() * pieces.length)];
    return {
      type,
      shape: TETROMINOES[type].shape,
      position: {
        x: Math.floor((GRID_WIDTH - TETROMINOES[type].shape[0].length) / 2),
        y: 0,
      },
    };
  }, []);

  const spawnNewPiece = useCallback(() => {
    const newPiece = nextPiece || getRandomPiece();

    if (checkCollision(newPiece)) {
      setGameOver(true);
      onGameOver?.(score);
      return;
    }

    setCurrentPiece(newPiece);
    setNextPiece(getRandomPiece());
  }, [nextPiece, checkCollision, score, onGameOver, getRandomPiece]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver) return;

    const rotated = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map((row) => row[row.length - 1 - i])
    );

    const newPiece = {
      ...currentPiece,
      shape: rotated,
    };

    if (!checkCollision(newPiece)) {
      setCurrentPiece(newPiece);
    }
  }, [currentPiece, gameOver, checkCollision]);

  const movePiece = useCallback(
    (dx, dy) => {
      if (!currentPiece || gameOver) return;

      const newPiece = {
        ...currentPiece,
        position: {
          x: currentPiece.position.x + dx,
          y: currentPiece.position.y + dy,
        },
      };

      if (!checkCollision(newPiece)) {
        setCurrentPiece(newPiece);
        return true;
      }

      if (dy > 0) {
        mergePiece();
        return false;
      }

      return false;
    },
    [currentPiece, gameOver, checkCollision]
  );

  const mergePiece = useCallback(() => {
    if (!currentPiece) return;

    const newBoard = board.map((row) => [...row]);
    const shape = currentPiece.shape;
    const color = TETROMINOES[currentPiece.type].color;

    if (currentPiece.position.y <= 0) {
      setGameOver(true);
      onGameOver?.(score);
      return;
    }

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardY = currentPiece.position.y + y;
          const boardX = currentPiece.position.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = color;
          }
        }
      }
    }

    setBoard(newBoard);
    clearLines(newBoard);
    spawnNewPiece();
  }, [currentPiece, board, spawnNewPiece, score, onGameOver]);

  const clearLines = useCallback(
    (newBoard) => {
      let linesCleared = 0;
      const clearedBoard = newBoard.filter((row) => {
        if (row.every((cell) => cell !== null)) {
          linesCleared++;
          return false;
        }
        return true;
      });

      while (clearedBoard.length < GRID_HEIGHT) {
        clearedBoard.unshift(Array(GRID_WIDTH).fill(null));
      }

      if (linesCleared > 0) {
        setScore((prev) => prev + linesCleared * 100 * level);
        const newLevel = Math.floor(score / 1000) + 1;

        if (newLevel > MAX_LEVEL) {
          setGameOver(true);
          onGameOver?.(score);
        } else {
          setLevel(newLevel);
        }

        setBoard(clearedBoard);
      }
    },
    [level, score, onGameOver]
  );

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver) return;

    let newY = currentPiece.position.y;
    while (
      !checkCollision({
        ...currentPiece,
        position: { ...currentPiece.position, y: newY + 1 },
      })
    ) {
      newY++;
    }

    setCurrentPiece({
      ...currentPiece,
      position: { ...currentPiece.position, y: newY },
    });
    mergePiece();
  }, [currentPiece, gameOver, checkCollision]);

  useEffect(() => {
    if (!currentPiece && !gameOver) {
      spawnNewPiece();
    }
  }, [currentPiece, gameOver, spawnNewPiece]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) {
        if (e.code === "Space") {
          setBoard(createEmptyBoard());
          setScore(0);
          setLevel(1);
          setGameOver(false);
          spawnNewPiece();
        }
        return;
      }

      switch (e.code) {
        case "ArrowLeft":
          movePiece(-1, 0);
          break;
        case "ArrowRight":
          movePiece(1, 0);
          break;
        case "ArrowDown":
          movePiece(0, 1);
          break;
        case "ArrowUp":
          rotatePiece();
          break;
        case "Space":
          hardDrop();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameOver, movePiece, rotatePiece, spawnNewPiece, hardDrop]);

  useEffect(() => {
    let dropInterval;
    if (!gameOver) {
      dropInterval = setInterval(() => {
        movePiece(0, 1);
      }, Math.max(100, INITIAL_SPEED - (level - 1) * 100));
    }
    return () => clearInterval(dropInterval);
  }, [gameOver, movePiece, level]);

  return (
    <GameContainer>
      <GameBoard>
        {board.map((row, y) =>
          row.map((cell, x) => <Cell key={`${y}-${x}`} $color={cell} />)
        )}
        {currentPiece &&
          currentPiece.shape.map((row, y) =>
            row.map((cell, x) => {
              if (cell) {
                const boardY = currentPiece.position.y + y;
                const boardX = currentPiece.position.x + x;
                if (boardY >= 0) {
                  return (
                    <Cell
                      key={`piece-${boardY}-${boardX}`}
                      style={{
                        position: "absolute",
                        top: `${(boardY / GRID_HEIGHT) * 100}%`,
                        left: `${(boardX / GRID_WIDTH) * 100}%`,
                        width: `${100 / GRID_WIDTH}%`,
                        height: `${100 / GRID_HEIGHT}%`,
                      }}
                      $color={TETROMINOES[currentPiece.type].color}
                    />
                  );
                }
              }
              return null;
            })
          )}
        {gameOver && (
          <GameOverScreen>
            {level > MAX_LEVEL ? "CONGRATULATIONS!" : "GAME OVER"}
            <div>Final Score: {score}</div>
            <div>Level: {level}</div>
            <div style={{ fontSize: "1rem", marginTop: "20px" }}>
              Press SPACE to restart
            </div>
          </GameOverScreen>
        )}
      </GameBoard>
      <NextPieceDisplay>
        {nextPiece &&
          nextPiece.shape.map((row, y) =>
            row.map((cell, x) => (
              <Cell
                key={`next-${y}-${x}`}
                $color={cell ? TETROMINOES[nextPiece.type].color : null}
              />
            ))
          )}
      </NextPieceDisplay>
      <ScorePanel>
        <h2>SCORE</h2>
        <p>{score}</p>
      </ScorePanel>
      <LevelPanel>
        <h2>LEVEL</h2>
        <p>{level}</p>
      </LevelPanel>
    </GameContainer>
  );
};

TetrisGame.propTypes = {
  onGameOver: PropTypes.func,
};

export default TetrisGame;
