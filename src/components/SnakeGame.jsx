import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

const GameContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
  background: #000;
`;

const GameBoard = styled.div`
  display: grid;
  grid-template-rows: repeat(${GRID_SIZE}, 1fr);
  grid-template-columns: repeat(${GRID_SIZE}, 1fr);
  background: #111;
  border: 4px solid #4caf50;
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.3),
    inset 0 0 20px rgba(76, 175, 80, 0.2);
  width: 100%;
  height: 100%;
  aspect-ratio: auto;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: linear-gradient(
        to right,
        rgba(76, 175, 80, 0.05) 1px,
        transparent 1px
      ),
      linear-gradient(to bottom, rgba(76, 175, 80, 0.05) 1px, transparent 1px);
    background-size: ${100 / GRID_SIZE}% ${100 / GRID_SIZE}%;
    pointer-events: none;
  }
`;

const Cell = styled.div`
  width: 100%;
  height: 100%;
  background: ${(props) => {
    if (props.isSnakeHead) return "#69f0ae";
    if (props.isSnake) return "#4caf50";
    if (props.isFood) return "#ff1744";
    return "transparent";
  }};
  border-radius: ${(props) =>
    props.isSnakeHead ? "4px" : props.isSnake ? "0px" : "50%"};
  box-shadow: ${(props) => {
    if (props.isSnakeHead) return "0 0 10px rgba(105, 240, 174, 0.5)";
    if (props.isSnake) return "0 0 5px rgba(76, 175, 80, 0.3)";
    if (props.isFood) return "0 0 10px rgba(255, 23, 68, 0.5)";
    return "none";
  }};
  transition: all 0.1s ease;
`;

const ScorePanel = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  padding: 5px 10px;
  border: 2px solid #4caf50;
  text-align: right;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.2);
  z-index: 5;

  h2 {
    color: #4caf50;
    font-size: 0.6rem;
    margin-bottom: 2px;
    text-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
  }

  p {
    color: #69f0ae;
    font-size: 0.8rem;
    text-shadow: 0 0 5px rgba(105, 240, 174, 0.5);
  }
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
  gap: 20px;
  color: #ff1744;
  text-shadow: 0 0 10px rgba(255, 23, 68, 0.5);
  font-size: 2.5rem;
  z-index: 10;
`;

const ScoreText = styled.div`
  font-size: 1.2rem;
  color: #4caf50;
  text-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
  margin: 10px 0;
`;

const HighScoreList = styled.div`
  font-size: 0.8rem;
  color: #fff;
  text-align: center;
  margin-top: 20px;

  h3 {
    color: #69f0ae;
    margin-bottom: 10px;
    font-size: 1rem;
  }

  p {
    margin: 5px 0;
    opacity: 0.8;
    &.new-high-score {
      color: #ffd700;
      text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    }
  }
`;

const NewHighScoreText = styled.div`
  color: #ffd700;
  font-size: 1.5rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  animation: pulse 1s infinite;

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }
`;

const SnakeGame = ({ onGameOver }) => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 10 });
  const [direction, setDirection] = useState("RIGHT");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScores, setHighScores] = useState(() => {
    const saved = localStorage.getItem("snakeHighScores");
    return saved ? JSON.parse(saved) : [];
  });
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const updateHighScores = useCallback(
    (newScore) => {
      const newHighScores = [...highScores, newScore]
        .sort((a, b) => b - a)
        .slice(0, 5);

      setHighScores(newHighScores);
      localStorage.setItem("snakeHighScores", JSON.stringify(newHighScores));
      setIsNewHighScore(newScore > (highScores[0] || 0));
    },
    [highScores]
  );

  const createFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // Yılanın üzerine yemek gelmesin
    if (
      snake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      )
    ) {
      return createFood();
    }
    return newFood;
  }, [snake]);

  const moveSnake = useCallback(() => {
    if (gameOver) {
      return; // Oyun bittiyse hareket etmeyi tamamen durdur
    }

    setSnake((prevSnake) => {
      const head = { ...prevSnake[0] };

      switch (direction) {
        case "UP":
          head.y -= 1;
          break;
        case "DOWN":
          head.y += 1;
          break;
        case "LEFT":
          head.x -= 1;
          break;
        case "RIGHT":
          head.x += 1;
          break;
        default:
          break;
      }

      // Çarpışma kontrolü
      const isCollision =
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE ||
        prevSnake.some(
          (segment) => segment.x === head.x && segment.y === head.y
        );

      if (isCollision) {
        setGameOver(true);
        updateHighScores(score);
        onGameOver?.(score);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Yemek yeme kontrolü
      if (head.x === food.x && head.y === food.y) {
        setScore((prev) => prev + 100);
        setFood(createFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [
    direction,
    gameOver,
    food,
    createFood,
    score,
    onGameOver,
    updateHighScores,
  ]);

  // Yön tuşları kontrolü
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) {
        if (e.code === "Space") {
          setSnake([{ x: 10, y: 10 }]);
          setFood(createFood());
          setDirection("RIGHT");
          setScore(0);
          setGameOver(false);
          setIsNewHighScore(false);
        }
        return;
      }

      switch (e.code) {
        case "ArrowUp":
          if (direction !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
          if (direction !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
          if (direction !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
          if (direction !== "LEFT") setDirection("RIGHT");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [direction, gameOver, createFood]);

  // Oyun döngüsü
  useEffect(() => {
    let gameLoop;
    if (!gameOver) {
      gameLoop = setInterval(moveSnake, INITIAL_SPEED);
    }
    return () => clearInterval(gameLoop);
  }, [moveSnake, gameOver]);

  return (
    <GameContainer>
      <GameBoard>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE;
          const y = Math.floor(index / GRID_SIZE);
          const isSnakeHead = snake[0].x === x && snake[0].y === y;
          const isSnake = snake.some(
            (segment) => segment.x === x && segment.y === y
          );
          const isFood = food.x === x && food.y === y;

          return (
            <Cell
              key={index}
              isSnakeHead={isSnakeHead}
              isSnake={isSnake}
              isFood={isFood}
            />
          );
        })}
        {gameOver && (
          <GameOverScreen>
            GAME OVER
            <ScoreText>SCORE: {score}</ScoreText>
            {isNewHighScore && (
              <NewHighScoreText>NEW HIGH SCORE!</NewHighScoreText>
            )}
            <HighScoreList>
              <h3>HIGH SCORES</h3>
              {highScores.map((highScore, index) => (
                <p
                  key={index}
                  className={
                    highScore === score && isNewHighScore
                      ? "new-high-score"
                      : ""
                  }
                >
                  {index + 1}. {highScore}
                </p>
              ))}
            </HighScoreList>
            <ScoreText style={{ fontSize: "0.8rem", marginTop: "20px" }}>
              Press SPACE to restart
            </ScoreText>
          </GameOverScreen>
        )}
      </GameBoard>
      <ScorePanel>
        <h2>SCORE</h2>
        <p>{score}</p>
      </ScorePanel>
    </GameContainer>
  );
};

SnakeGame.propTypes = {
  onGameOver: PropTypes.func,
};

export default SnakeGame;
