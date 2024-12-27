import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const GRID_SIZE = 28;
const BASE_CELL_SIZE = 20;
const PACMAN_SPEED = 80;
const GHOST_SPEED = 100;

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
  box-sizing: border-box;
`;

const GameBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(${GRID_SIZE}, 1fr);
  grid-template-rows: repeat(${GRID_SIZE}, 1fr);
  background: #000;
  border: 2px solid #2121de;
  box-shadow: 0 0 20px rgba(33, 33, 222, 0.3);
  position: relative;
  aspect-ratio: 1;
  width: min(70vh, 70vw, 450px);
  height: min(70vh, 70vw, 450px);
`;

const Cell = styled.div`
  width: 100%;
  height: 100%;
  background: ${(props) => (props.$isWall ? "#2121de" : "transparent")};
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: ${(props) => {
      const size = Math.min(90, 90) / GRID_SIZE;
      return props.$isDot
        ? `${size * 0.2}px`
        : props.$isPowerPellet
        ? `${size * 0.6}px`
        : "0";
    }};
    height: ${(props) => {
      const size = Math.min(90, 90) / GRID_SIZE;
      return props.$isDot
        ? `${size * 0.2}px`
        : props.$isPowerPellet
        ? `${size * 0.6}px`
        : "0";
    }};
    background: ${(props) =>
      props.$isDot || props.$isPowerPellet ? "#ffb897" : "transparent"};
    border-radius: 50%;
    box-shadow: 0 0 5px rgba(255, 184, 151, 0.5);
  }
`;

const Pacman = styled.div`
  position: absolute;
  width: ${(props) => 100 / GRID_SIZE}%;
  height: ${(props) => 100 / GRID_SIZE}%;
  top: ${(props) => (props.$position.y * 100) / GRID_SIZE}%;
  left: ${(props) => (props.$position.x * 100) / GRID_SIZE}%;
  transition: all ${PACMAN_SPEED}ms linear;
  transform: rotate(
    ${(props) => {
      switch (props.$direction) {
        case "RIGHT":
          return "0deg";
        case "DOWN":
          return "90deg";
        case "LEFT":
          return "180deg";
        case "UP":
          return "270deg";
        default:
          return "0deg";
      }
    }}
  );

  &::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    background: #ffff00;
    border-radius: 50%;
    clip-path: polygon(
      100% 50%,
      100% 25%,
      100% 0%,
      0% 0%,
      0% 100%,
      100% 100%,
      100% 75%,
      100% 50%
    );
    animation: eat 0.2s linear infinite;
  }

  @keyframes eat {
    0% {
      clip-path: polygon(
        100% 50%,
        100% 25%,
        100% 0%,
        0% 0%,
        0% 100%,
        100% 100%,
        100% 75%,
        100% 50%
      );
    }
    50% {
      clip-path: polygon(
        100% 50%,
        100% 40%,
        100% 35%,
        50% 35%,
        50% 65%,
        100% 65%,
        100% 60%,
        100% 50%
      );
    }
    100% {
      clip-path: polygon(
        100% 50%,
        100% 25%,
        100% 0%,
        0% 0%,
        0% 100%,
        100% 100%,
        100% 75%,
        100% 50%
      );
    }
  }
`;

const Ghost = styled.div`
  position: absolute;
  width: ${(props) => 100 / GRID_SIZE}%;
  height: ${(props) => 100 / GRID_SIZE}%;
  top: ${(props) => (props.$position.y * 100) / GRID_SIZE}%;
  left: ${(props) => (props.$position.x * 100) / GRID_SIZE}%;
  transition: all ${GHOST_SPEED}ms linear;
  will-change: transform;

  &::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 60%;
    top: 0;
    background: ${(props) => props.$color};
    border-radius: 50% 50% 0 0;
    box-shadow: 0 0 10px ${(props) => props.$color}40;
  }

  &::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 40%;
    bottom: 0;
    background: ${(props) => props.$color};
    border-radius: 0 0 4px 4px;
    clip-path: polygon(
      0% 0%,
      16.66% 100%,
      33.33% 0%,
      50% 100%,
      66.66% 0%,
      83.33% 100%,
      100% 0%,
      100% 100%,
      0% 100%
    );
    box-shadow: 0 0 10px ${(props) => props.$color}40;
  }
`;

const ScorePanel = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #000;
  border: 2px solid #2121de;
  padding: 10px;
  color: #fff;
  font-family: "Press Start 2P", cursive;
  text-align: center;
  min-width: 100px;

  h2 {
    font-size: 0.8rem;
    margin-bottom: 5px;
    color: #ffff00;
  }

  p {
    font-size: 1.2rem;
  }
`;

const LivesPanel = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 10px;
`;

const Life = styled.div`
  width: 20px;
  height: 20px;
  background: #ffff00;
  border-radius: 50%;
  clip-path: polygon(100% 50%, 50% 50%, 0 0, 0 100%);
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
  color: #ffff00;
  font-family: "Press Start 2P", cursive;
  gap: 20px;
  z-index: 10;

  h1 {
    font-size: 2rem;
    text-shadow: 0 0 10px rgba(255, 255, 0, 0.5);
  }

  p {
    font-size: 1.2rem;
  }

  button {
    background: #2121de;
    border: none;
    padding: 10px 20px;
    color: #fff;
    font-family: "Press Start 2P", cursive;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: #4141fe;
      transform: scale(1.1);
    }
  }
`;

const MAZE_LAYOUT = [
  "1111111111111111111111111111",
  "1000000000000110000000000001",
  "1011110111110110111110111101",
  "1311110111110110111110111131",
  "1011110111110110111110111101",
  "1000000000000000000000000001",
  "1011110110111111110110111101",
  "1011110110111111110110111101",
  "1000000110000110000110000001",
  "1111110111110110111110111111",
  "1111110110000000000110111111",
  "1111110110000000000110111111",
  "1111110110000000000110111111",
  "0000000000000000000000000000",
  "1111110110000000000110111111",
  "1111110110000000000110111111",
  "1111110110000000000110111111",
  "1111110110111111110110111111",
  "1000000000000110000000000001",
  "1011110111110110111110111101",
  "1011110111110110111110111101",
  "1300110000000000000000110031",
  "1110110110111111110110110111",
  "1000000110000110000110000001",
  "1011111111110110111111111101",
  "1000000000000000000000000001",
  "1111111111111111111111111111",
];

const GHOST_COLORS = {
  BLINKY: "#ff0000", // Kırmızı hayalet
  PINKY: "#ffb8ff", // Pembe hayalet
  INKY: "#00ffff", // Mavi hayalet
  CLYDE: "#ffb852", // Turuncu hayalet
};

const PacmanGame = ({ onGameOver }) => {
  const [board, setBoard] = useState([]);
  const [pacman, setPacman] = useState({ x: 14, y: 23, direction: "RIGHT" });
  const [ghosts, setGhosts] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const initializeGame = () => {
    // Labirenti oluştur
    const newBoard = MAZE_LAYOUT.map((row) =>
      row.split("").map((cell) => ({
        isWall: cell === "1",
        isDot: cell === "0",
        isPowerPellet: cell === "3",
      }))
    );
    setBoard(newBoard);

    // Pacman'i başlangıç pozisyonuna yerleştir
    setPacman({ x: 14, y: 23, direction: "RIGHT" });

    // Hayaletleri yeni başlangıç pozisyonlarına yerleştir
    setGhosts([
      {
        id: "BLINKY",
        x: 13,
        y: 13,
        direction: "LEFT",
        color: GHOST_COLORS.BLINKY,
        speed: GHOST_SPEED * 0.7,
      },
      {
        id: "PINKY",
        x: 14,
        y: 13,
        direction: "RIGHT",
        color: GHOST_COLORS.PINKY,
        speed: GHOST_SPEED * 0.75,
      },
      {
        id: "INKY",
        x: 13,
        y: 14,
        direction: "UP",
        color: GHOST_COLORS.INKY,
        speed: GHOST_SPEED * 0.8,
      },
      {
        id: "CLYDE",
        x: 14,
        y: 14,
        direction: "DOWN",
        color: GHOST_COLORS.CLYDE,
        speed: GHOST_SPEED * 0.85,
      },
    ]);
  };

  const moveCharacter = useCallback(
    (character, direction) => {
      const newPos = {
        x: character.x,
        y: character.y,
        direction,
      };

      switch (direction) {
        case "UP":
          newPos.y -= 1;
          break;
        case "DOWN":
          newPos.y += 1;
          break;
        case "LEFT":
          newPos.x -= 1;
          break;
        case "RIGHT":
          newPos.x += 1;
          break;
        default:
          break;
      }

      // Tünel kontrolü
      if (newPos.x < 0) newPos.x = GRID_SIZE - 1;
      if (newPos.x >= GRID_SIZE) newPos.x = 0;
      if (newPos.y < 0) newPos.y = GRID_SIZE - 1;
      if (newPos.y >= GRID_SIZE) newPos.y = 0;

      // Duvar kontrolü
      if (board[newPos.y][newPos.x].isWall) return null;

      return newPos;
    },
    [board]
  );

  const movePacman = useCallback(
    (direction) => {
      if (gameOver || isPaused) return;

      const newPos = moveCharacter(pacman, direction);
      if (!newPos) return;

      // Yem kontrolü
      if (board[newPos.y][newPos.x].isDot) {
        const newBoard = [...board];
        newBoard[newPos.y][newPos.x].isDot = false;
        setBoard(newBoard);
        setScore((prev) => prev + 10);
      }

      // Güç hapı kontrolü
      if (board[newPos.y][newPos.x].isPowerPellet) {
        const newBoard = [...board];
        newBoard[newPos.y][newPos.x].isPowerPellet = false;
        setBoard(newBoard);
        setScore((prev) => prev + 50);
        // TODO: Hayaletleri yenilebilir yap
      }

      setPacman(newPos);
    },
    [board, gameOver, isPaused, moveCharacter, pacman]
  );

  const moveGhost = useCallback(
    (ghost) => {
      if (gameOver || isPaused) return null;

      // Basit yön seçimi - her hayalet için farklı davranış
      const directions = ["UP", "DOWN", "LEFT", "RIGHT"];
      let possibleMoves = [];

      // Tüm olası yönleri kontrol et
      directions.forEach((dir) => {
        const testPos = {
          x: ghost.x,
          y: ghost.y,
          direction: dir,
        };

        switch (dir) {
          case "UP":
            testPos.y -= 1;
            break;
          case "DOWN":
            testPos.y += 1;
            break;
          case "LEFT":
            testPos.x -= 1;
            break;
          case "RIGHT":
            testPos.x += 1;
            break;
          default:
            break;
        }

        // Tünel kontrolü
        if (testPos.x < 0) testPos.x = GRID_SIZE - 1;
        if (testPos.x >= GRID_SIZE) testPos.x = 0;
        if (testPos.y < 0) testPos.y = GRID_SIZE - 1;
        if (testPos.y >= GRID_SIZE) testPos.y = 0;

        // Duvar kontrolü
        if (!board[testPos.y][testPos.x].isWall) {
          const distToPacman =
            Math.abs(testPos.x - pacman.x) + Math.abs(testPos.y - pacman.y);
          possibleMoves.push({ ...testPos, distance: distToPacman });
        }
      });

      if (possibleMoves.length === 0) return null;

      // Her hayalet için farklı hareket stratejisi
      let selectedMove;
      switch (ghost.id) {
        case "BLINKY": // Kırmızı - En kısa yolu seçer
          selectedMove = possibleMoves.reduce((best, move) =>
            move.distance < best.distance ? move : best
          );
          break;

        case "PINKY": // Pembe - Pacman'in önünü kesmeye çalışır
          possibleMoves = possibleMoves.map((move) => {
            const futureX =
              pacman.x +
              (pacman.direction === "RIGHT"
                ? 4
                : pacman.direction === "LEFT"
                ? -4
                : 0);
            const futureY =
              pacman.y +
              (pacman.direction === "DOWN"
                ? 4
                : pacman.direction === "UP"
                ? -4
                : 0);
            return {
              ...move,
              distance: Math.abs(move.x - futureX) + Math.abs(move.y - futureY),
            };
          });
          selectedMove = possibleMoves.reduce((best, move) =>
            move.distance < best.distance ? move : best
          );
          break;

        case "INKY": // Mavi - Yarı rastgele hareket eder
          selectedMove =
            possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
          if (Math.random() < 0.7) {
            // %70 ihtimalle Pacman'e yaklaşır
            selectedMove = possibleMoves.reduce((best, move) =>
              move.distance < best.distance ? move : best
            );
          }
          break;

        case "CLYDE": // Turuncu - Pacman yakınsa kaçar, uzaksa yaklaşır
          const distanceToTarget =
            Math.abs(ghost.x - pacman.x) + Math.abs(ghost.y - pacman.y);
          if (distanceToTarget < 8) {
            // Pacman yakınsa en uzak noktaya git
            selectedMove = possibleMoves.reduce((best, move) =>
              move.distance > best.distance ? move : best
            );
          } else {
            // Pacman uzaksa yaklaş
            selectedMove = possibleMoves.reduce((best, move) =>
              move.distance < best.distance ? move : best
            );
          }
          break;

        default:
          selectedMove = possibleMoves[0];
      }

      return selectedMove;
    },
    [gameOver, isPaused, board, pacman]
  );

  const checkCollision = useCallback(() => {
    return ghosts.some((ghost) => ghost.x === pacman.x && ghost.y === pacman.y);
  }, [ghosts, pacman]);

  // Oyun döngüsü
  useEffect(() => {
    if (gameOver || isPaused) return;

    const moveGhosts = () => {
      requestAnimationFrame(() => {
        setGhosts((prevGhosts) =>
          prevGhosts.map((ghost) => {
            const newPos = moveGhost(ghost);
            return newPos ? { ...ghost, ...newPos } : ghost;
          })
        );
      });
    };

    // Her hayalet için ayrı interval
    const ghostIntervals = ghosts.map((ghost) =>
      setInterval(moveGhosts, ghost.speed)
    );

    // Çarpışma kontrolü
    const collisionInterval = setInterval(() => {
      requestAnimationFrame(() => {
        if (checkCollision()) {
          if (lives > 1) {
            setLives((prev) => prev - 1);
            setPacman({ x: 14, y: 23, direction: "RIGHT" });
          } else {
            setGameOver(true);
            onGameOver?.(score);
          }
        }
      });
    }, 50); // Daha sık çarpışma kontrolü

    return () => {
      ghostIntervals.forEach((interval) => clearInterval(interval));
      clearInterval(collisionInterval);
    };
  }, [
    gameOver,
    isPaused,
    moveGhost,
    checkCollision,
    lives,
    score,
    onGameOver,
    ghosts,
  ]);

  // Klavye kontrollerini güncelle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver || isPaused) return;

      let newDirection = null;
      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          newDirection = "UP";
          break;
        case "ArrowDown":
        case "KeyS":
          newDirection = "DOWN";
          break;
        case "ArrowLeft":
        case "KeyA":
          newDirection = "LEFT";
          break;
        case "ArrowRight":
        case "KeyD":
          newDirection = "RIGHT";
          break;
        case "KeyP":
          setIsPaused((prev) => !prev);
          break;
        default:
          return;
      }

      if (newDirection) {
        e.preventDefault();
        movePacman(newDirection);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, isPaused, movePacman]);

  // Oyunu başlat
  useEffect(() => {
    initializeGame();
  }, []); // Sadece bir kere çalışsın

  return (
    <GameContainer>
      <GameBoard>
        {board.map((row, y) =>
          row.map((cell, x) => (
            <Cell
              key={`${y}-${x}`}
              $isWall={cell.isWall}
              $isDot={cell.isDot}
              $isPowerPellet={cell.isPowerPellet}
            />
          ))
        )}
        <Pacman $position={pacman} $direction={pacman.direction} />
        {ghosts.map((ghost) => (
          <Ghost
            key={ghost.id}
            $position={{ x: ghost.x, y: ghost.y }}
            $color={ghost.color}
          />
        ))}
      </GameBoard>
      <ScorePanel>
        <h2>SCORE</h2>
        <p>{score}</p>
      </ScorePanel>
      <LivesPanel>
        {Array.from({ length: lives }).map((_, i) => (
          <Life key={i} />
        ))}
      </LivesPanel>
      {gameOver && (
        <GameOverScreen>
          <h1>GAME OVER</h1>
          <p>Score: {score}</p>
          <button onClick={() => window.location.reload()}>Play Again</button>
        </GameOverScreen>
      )}
    </GameContainer>
  );
};

PacmanGame.propTypes = {
  onGameOver: PropTypes.func,
};

export default PacmanGame;
