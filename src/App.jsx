import { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import "@fontsource/press-start-2p";
import SnakeGame from "./components/SnakeGame";
import TetrisGame from "./components/TetrisGame";
import PacmanGame from "./components/PacmanGame";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: #1a1a1a;
    font-family: 'Press Start 2P', cursive;
    color: #fff;
    overflow: hidden;
  }
`;

const ArcadeContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  background: #0a0a0a;
  overflow: hidden;
  perspective: 1000px;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 0;
    width: 30%;
    height: 100%;
    background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
      url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="50" height="50" fill="%23111"/><rect x="10" y="10" width="30" height="40" fill="%23222"/></svg>');
    background-size: cover, 100px 100px;
    filter: blur(5px);
    opacity: 0.5;
    z-index: -1;
  }

  &::before {
    left: 0;
    transform: perspective(500px) rotateY(30deg);
    background-color: rgba(100, 0, 150, 0.2);
  }

  &::after {
    right: 0;
    transform: perspective(500px) rotateY(-30deg);
    background-color: rgba(150, 0, 100, 0.2);
  }
`;

const ArcadeBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
      circle at 30% 50%,
      rgba(255, 0, 255, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 70% 50%,
      rgba(0, 255, 255, 0.1) 0%,
      transparent 50%
    ),
    linear-gradient(to bottom, #0a0a0a, #1a1a1a);
  z-index: -1;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: repeating-linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.03) 0px,
        rgba(255, 255, 255, 0.03) 1px,
        transparent 1px,
        transparent 30px
      ),
      repeating-linear-gradient(
        0deg,
        rgba(255, 255, 255, 0.03) 0px,
        rgba(255, 255, 255, 0.03) 1px,
        transparent 1px,
        transparent 30px
      );
  }
`;

const ArcadeCabinet = styled.div`
  width: 80%;
  max-width: 800px;
  height: 95vh;
  background: linear-gradient(135deg, #4a148c 0%, #311b92 100%);
  border-radius: 10px 10px 0 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.7);
  transform: rotateX(5deg);
  z-index: 1;

  &::before {
    content: "ARCADE MACHINE";
    position: absolute;
    top: -20px;
    left: -20px;
    right: -20px;
    height: 40px;
    background: linear-gradient(90deg, #e91e63 0%, #9c27b0 100%);
    border-radius: 10px 10px 0 0;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: #fff;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    letter-spacing: 2px;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -50px;
    left: -30px;
    right: -30px;
    height: 50px;
    background: linear-gradient(90deg, #311b92 0%, #4a148c 100%);
    border-radius: 0 0 20px 20px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
`;

const MarqueeLight = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  background: #ffeb3b;
  border-radius: 50%;
  box-shadow: 0 0 10px #ffeb3b;
  animation: marqueeGlow 1s ease-in-out infinite alternate;

  @keyframes marqueeGlow {
    from {
      opacity: 0.3;
    }
    to {
      opacity: 1;
    }
  }
`;

const MarqueeLights = styled.div`
  position: absolute;
  top: -15px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 0 30px;
`;

const ArcadeFrame = styled.div`
  width: 90%;
  height: 60%;
  position: relative;
  background: #000;
  border-radius: 10px;
  padding: 20px;
  margin-top: 40px;
  box-shadow: 0 0 0 10px #2d1b4e, 0 0 0 12px #1a0f2e,
    0 0 20px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.1) 1px,
        transparent 1px
      ),
      linear-gradient(0deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
  }
`;

const ControlPanel = styled.div`
  width: 100%;
  height: 180px;
  background: linear-gradient(45deg, #1a0f2e 0%, #2d1b4e 100%);
  margin-top: 30px;
  border-radius: 20px;
  position: relative;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3), inset 0 0 10px rgba(0, 0, 0, 0.5);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 3px;
    background: #e91e63;
    box-shadow: 0 0 10px rgba(233, 30, 99, 0.5);
  }

  &::after {
    content: "CONTROLS";
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.8rem;
    color: #9575cd;
    letter-spacing: 2px;
  }
`;

const Joystick = styled.div`
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #424242 0%, #212121 100%);
  border-radius: 50%;
  position: relative;
  box-shadow: 0 0 0 5px #4a148c, 0 5px 15px rgba(0, 0, 0, 0.5);

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #9575cd 0%, #7e57c2 100%);
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(156, 39, 176, 0.5);
    transform: translate(-50%, -50%);
  }

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 15px;
    height: 15px;
    background: #ff1744;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(255, 23, 68, 0.5);
  }
`;

const Buttons = styled.div`
  display: flex;
  gap: 25px;
  position: relative;
`;

const Button = styled.div`
  width: 45px;
  height: 45px;
  background: ${(props) => props.color || "#ff0000"};
  border-radius: 50%;
  box-shadow: 0 0 0 5px #4a148c, 0 5px 15px rgba(0, 0, 0, 0.5),
    inset 0 0 15px rgba(255, 255, 255, 0.2);
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 0 5px #4a148c, 0 5px 15px rgba(0, 0, 0, 0.5),
      inset 0 0 20px rgba(255, 255, 255, 0.3),
      0 0 10px ${(props) => props.color || "#ff0000"};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ScreenGlow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.03) 100%
  );
  pointer-events: none;
  border-radius: 20px;
`;

const Title = styled.h1`
  font-size: 3rem;
  text-align: center;
  margin-bottom: 2rem;
  color: ${(props) => {
    switch (props.game) {
      case "PACMAN":
        return "#ffff00";
      case "SNAKE":
        return "#4caf50";
      case "TETRIS":
        return "#ff1744";
      default:
        return "#ff00ff";
    }
  }};
  text-shadow: ${(props) => {
    switch (props.game) {
      case "PACMAN":
        return "0 0 5px #ffff00, 0 0 10px #ffff00, 0 0 20px #ffff00, 0 0 40px #ffff00";
      case "SNAKE":
        return "0 0 5px #4caf50, 0 0 10px #4caf50, 0 0 20px #4caf50, 0 0 40px #4caf50";
      case "TETRIS":
        return "0 0 5px #ff1744, 0 0 10px #ff1744, 0 0 20px #ff1744, 0 0 40px #ff1744";
      default:
        return "0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 40px #ff00ff";
    }
  }};
  animation: ${(props) => {
      switch (props.game) {
        case "PACMAN":
          return "neonYellow";
        case "SNAKE":
          return "neonGreen";
        case "TETRIS":
          return "neonRed";
        default:
          return "neon";
      }
    }}
    1.5s ease-in-out infinite alternate;

  @keyframes neonYellow {
    from {
      text-shadow: 0 0 5px #ffff00, 0 0 10px #ffff00, 0 0 20px #ffff00,
        0 0 40px #ffff00;
    }
    to {
      text-shadow: 0 0 2px #ffff00, 0 0 5px #ffff00, 0 0 10px #ffff00,
        0 0 20px #ffff00;
    }
  }

  @keyframes neonGreen {
    from {
      text-shadow: 0 0 5px #4caf50, 0 0 10px #4caf50, 0 0 20px #4caf50,
        0 0 40px #4caf50;
    }
    to {
      text-shadow: 0 0 2px #4caf50, 0 0 5px #4caf50, 0 0 10px #4caf50,
        0 0 20px #4caf50;
    }
  }

  @keyframes neonRed {
    from {
      text-shadow: 0 0 5px #ff1744, 0 0 10px #ff1744, 0 0 20px #ff1744,
        0 0 40px #ff1744;
    }
    to {
      text-shadow: 0 0 2px #ff1744, 0 0 5px #ff1744, 0 0 10px #ff1744,
        0 0 20px #ff1744;
    }
  }

  @keyframes neon {
    from {
      text-shadow: 0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 20px #ff00ff,
        0 0 40px #ff00ff;
    }
    to {
      text-shadow: 0 0 2px #ff00ff, 0 0 5px #ff00ff, 0 0 10px #ff00ff,
        0 0 20px #ff00ff;
    }
  }
`;

const GameList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  margin-top: 2rem;
`;

const GameOption = styled.div.attrs((props) => ({
  $selected: props.selected,
  $gameName: props.gameName,
}))`
  font-size: 1.2rem;
  color: ${(props) =>
    props.$selected
      ? props.$gameName === "PACMAN"
        ? "#ffff00"
        : props.$gameName === "SNAKE"
        ? "#4caf50"
        : "#ff1744"
      : "#888"};
  text-shadow: ${(props) =>
    props.$selected
      ? props.$gameName === "PACMAN"
        ? "0 0 5px #ffff00, 0 0 10px #ffff00"
        : props.$gameName === "SNAKE"
        ? "0 0 5px #4caf50, 0 0 10px #4caf50"
        : "0 0 5px #ff1744, 0 0 10px #ff1744"
      : "none"};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  padding-left: 2rem;

  &:hover {
    color: ${(props) =>
      props.$gameName === "PACMAN"
        ? "#ffff00"
        : props.$gameName === "SNAKE"
        ? "#4caf50"
        : "#ff1744"};
    text-shadow: ${(props) =>
      props.$gameName === "PACMAN"
        ? "0 0 5px #ffff00, 0 0 10px #ffff00"
        : props.$gameName === "SNAKE"
        ? "0 0 5px #4caf50, 0 0 10px #4caf50"
        : "0 0 5px #ff1744, 0 0 10px #ff1744"};
  }

  &::before {
    content: ${(props) => (props.$selected ? '">"' : '""')};
    position: absolute;
    left: 0;
    color: ${(props) =>
      props.$gameName === "PACMAN"
        ? "#ffff00"
        : props.$gameName === "SNAKE"
        ? "#4caf50"
        : "#ff1744"};
    animation: ${(props) =>
      props.$selected ? "blink 1s step-end infinite" : "none"};
  }
`;

const InsertCoin = styled.div`
  font-size: 1rem;
  color: #ffff00;
  animation: blink 1s step-end infinite;
  margin-top: 2rem;

  @keyframes blink {
    50% {
      opacity: 0;
    }
  }
`;

const CoinSlot = styled.div`
  width: 30px;
  height: 80px;
  background: linear-gradient(135deg, #424242 0%, #212121 100%);
  border-radius: 4px;
  position: absolute;
  left: 40px;
  top: 30px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.8), 0 0 0 2px #4a148c;
  display: flex;
  flex-direction: column;
  align-items: center;

  &::before {
    content: "";
    width: 22px;
    height: 3px;
    background: #000;
    position: absolute;
    top: 15px;
    border-radius: 2px;
    box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.2);
  }
`;

const Coin = styled.div.attrs((props) => ({
  $isAnimating: props.isAnimating,
}))`
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #ffd700 0%, #ffa000 100%);
  border-radius: 50%;
  position: absolute;
  left: 45px;
  top: ${(props) => (props.$isAnimating ? "25px" : "-50px")};
  opacity: ${(props) => (props.$isAnimating ? 1 : 0)};
  transition: all 0.5s ease;
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.5),
    0 0 5px rgba(255, 215, 0, 0.5);
  transform: ${(props) =>
    props.$isAnimating ? "translateY(70px)" : "translateY(0)"};

  &::before {
    content: "¢";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #b17f00;
    font-size: 12px;
    font-weight: bold;
  }
`;

const GameMenu = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
`;

const GameBackground = styled.div.attrs((props) => ({
  $game: props.game,
}))`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  opacity: 0.2;
  ${(props) => {
    switch (props.$game) {
      case "PACMAN":
        return `
          background: #000;

          &::before {
            content: '';
            position: absolute;
            width: 40px;
            height: 40px;
            background: #ffff00;
            border-radius: 50%;
            top: 30%;
            left: 20%;
            clip-path: polygon(0 0, 100% 50%, 0 100%, 0 80%, 60% 50%, 0 20%);
          }

          &::after {
            content: '';
            position: absolute;
            width: 30px;
            height: 30px;
            background: #ff0000;
            border-radius: 20px 20px 0 0;
            top: 60%;
            right: 30%;
            box-shadow: 
              60px -50px 0 0 #00ffff,
              -60px -50px 0 0 #ff69b4,
              0 -100px 0 0 #ffa500;
          }
        `;
      case "SNAKE":
        return `
          background: 
            linear-gradient(to right, #4caf50 1px, transparent 1px),
            linear-gradient(to bottom, #4caf50 1px, transparent 1px);
          background-size: 20px 20px;
          background-color: #000;

          &::before {
            content: '';
            position: absolute;
            width: 20px;
            height: 20px;
            background: #4caf50;
            border-radius: 4px;
            top: 40%;
            left: 30%;
            box-shadow: 
              20px 0 0 0 #4caf50,
              40px 0 0 0 #4caf50,
              60px 0 0 0 #4caf50,
              80px 0 0 0 #4caf50;
          }

          &::after {
            content: '';
            position: absolute;
            width: 15px;
            height: 15px;
            background: #ff0000;
            border-radius: 50%;
            top: 60%;
            right: 40%;
            box-shadow: 0 0 10px #ff0000;
          }
        `;
      case "TETRIS":
        return `
          background-color: #000;
          overflow: hidden;

          &::before {
            content: '';
            position: absolute;
            inset: 0;
            box-shadow:
              /* L Şekli */
              20px 50px 0 15px #ff1744,
              20px 80px 0 15px #ff1744,
              20px 110px 0 15px #ff1744,
              50px 110px 0 15px #ff1744,
              
              /* T Şekli */
              120px 50px 0 15px #2979ff,
              150px 50px 0 15px #2979ff,
              180px 50px 0 15px #2979ff,
              150px 80px 0 15px #2979ff,
              
              /* Z Şekli */
              250px 80px 0 15px #00e676,
              280px 80px 0 15px #00e676,
              280px 110px 0 15px #00e676,
              310px 110px 0 15px #00e676,
              
              /* I Şekli */
              380px 50px 0 15px #ffeb3b,
              380px 80px 0 15px #ffeb3b,
              380px 110px 0 15px #ffeb3b,
              380px 140px 0 15px #ffeb3b,
              
              /* O Şekli */
              120px 200px 0 15px #ff69b4,
              150px 200px 0 15px #ff69b4,
              120px 230px 0 15px #ff69b4,
              150px 230px 0 15px #ff69b4,

              /* Ekstra L Şekli */
              250px 200px 0 15px #ff1744,
              250px 230px 0 15px #ff1744,
              250px 260px 0 15px #ff1744,
              280px 260px 0 15px #ff1744,

              /* Ekstra I Şekli */
              380px 200px 0 15px #ffeb3b,
              380px 230px 0 15px #ffeb3b,
              380px 260px 0 15px #ffeb3b,
              380px 290px 0 15px #ffeb3b;
          }
        `;
      default:
        return "";
    }
  }}
`;

const MenuOption = styled.div`
  font-size: 1.5rem;
  color: ${(props) => (props.selected ? "#00ff00" : "#888")};
  text-shadow: ${(props) =>
    props.selected ? "0 0 5px #00ff00, 0 0 10px #00ff00" : "none"};
  cursor: pointer;
  margin: 1rem 0;
  transition: all 0.3s ease;
  position: relative;
  padding-left: 2rem;

  &:hover {
    color: #00ff00;
    text-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00;
  }

  &::before {
    content: ${(props) => (props.selected ? '">"' : '""')};
    position: absolute;
    left: 0;
    color: #00ff00;
    animation: ${(props) =>
      props.selected ? "blink 1s step-end infinite" : "none"};
  }
`;

const HighScore = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 1rem;
  color: #ffff00;
  text-shadow: 0 0 5px #ffff00;
  text-align: right;

  span {
    color: #ff00ff;
    text-shadow: 0 0 5px #ff00ff;
  }
`;

const GameScreen = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

function App() {
  const [currentScreen, setCurrentScreen] = useState("INSERT_COIN");
  const [selectedGame, setSelectedGame] = useState(0);
  const [selectedOption, setSelectedOption] = useState(0);
  const [isCoinAnimating, setIsCoinAnimating] = useState(false);
  const [highScores, setHighScores] = useState({
    PACMAN: 10000,
    SNAKE: 150,
    TETRIS: 5000,
  });

  const games = ["PACMAN", "SNAKE", "TETRIS"];
  const menuOptions = ["START GAME", "HIGH SCORES"];
  const coinSound = new Audio("/coin.mp3");
  const selectSound = new Audio("/select.wav");

  const playCoinSound = () => {
    coinSound.currentTime = 0;
    coinSound.play();
  };

  const playSelectSound = () => {
    selectSound.currentTime = 0;
    selectSound.volume = 0.5;
    selectSound.play();
  };

  const handleCoinAnimation = () => {
    setIsCoinAnimating(true);
    setTimeout(() => {
      setIsCoinAnimating(false);
    }, 500);
  };

  useEffect(() => {
    const handleControls = (e) => {
      e.preventDefault();

      switch (currentScreen) {
        case "INSERT_COIN":
          if (e.code === "Space") {
            playCoinSound();
            handleCoinAnimation();
            setTimeout(() => {
              setCurrentScreen("GAME_SELECT");
            }, 500);
          }
          break;

        case "GAME_SELECT":
          switch (e.code) {
            case "ArrowUp":
              playSelectSound();
              setSelectedGame((prev) =>
                prev > 0 ? prev - 1 : games.length - 1
              );
              break;
            case "ArrowDown":
              playSelectSound();
              setSelectedGame((prev) =>
                prev < games.length - 1 ? prev + 1 : 0
              );
              break;
            case "Enter":
              playSelectSound();
              setCurrentScreen("GAME_MENU");
              break;
            case "Escape":
              setCurrentScreen("INSERT_COIN");
              break;
          }
          break;

        case "GAME_MENU":
          switch (e.code) {
            case "ArrowUp":
              playSelectSound();
              setSelectedOption((prev) =>
                prev > 0 ? prev - 1 : menuOptions.length - 1
              );
              break;
            case "ArrowDown":
              playSelectSound();
              setSelectedOption((prev) =>
                prev < menuOptions.length - 1 ? prev + 1 : 0
              );
              break;
            case "Enter":
              playSelectSound();
              if (selectedOption === 0) {
                setCurrentScreen("GAME_PLAY");
              }
              break;
            case "Escape":
              setCurrentScreen("GAME_SELECT");
              setSelectedOption(0);
              break;
          }
          break;

        case "GAME_PLAY":
          if (e.code === "Escape") {
            setCurrentScreen("GAME_MENU");
          }
          break;
      }
    };

    window.addEventListener("keydown", handleControls);
    return () => window.removeEventListener("keydown", handleControls);
  }, [
    currentScreen,
    selectedGame,
    selectedOption,
    games.length,
    menuOptions.length,
  ]);

  const renderScreen = () => {
    switch (currentScreen) {
      case "INSERT_COIN":
        return (
          <>
            <Title>RETRO ARCADE</Title>
            <InsertCoin>INSERT COIN (PRESS SPACE)</InsertCoin>
          </>
        );

      case "GAME_SELECT":
        return (
          <>
            <Title>SELECT GAME</Title>
            <GameList>
              {games.map((game, index) => (
                <GameOption
                  key={game}
                  selected={selectedGame === index}
                  gameName={game}
                >
                  {game}
                </GameOption>
              ))}
            </GameList>
          </>
        );

      case "GAME_MENU":
        return (
          <>
            <GameBackground game={games[selectedGame]} />
            <GameMenu>
              <Title game={games[selectedGame]}>{games[selectedGame]}</Title>
              {menuOptions.map((option, index) => (
                <MenuOption key={option} selected={selectedOption === index}>
                  {option}
                </MenuOption>
              ))}
              <HighScore>
                HIGH SCORE
                <br />
                <span>{highScores[games[selectedGame]]}</span>
              </HighScore>
            </GameMenu>
          </>
        );

      case "GAME_PLAY":
        return (
          <GameScreen>
            {games[selectedGame] === "SNAKE" && (
              <SnakeGame
                onGameOver={(score) => {
                  setHighScores((prev) => ({
                    ...prev,
                    SNAKE: Math.max(prev.SNAKE, score),
                  }));
                  setCurrentScreen("GAME_MENU");
                }}
              />
            )}
            {games[selectedGame] === "TETRIS" && (
              <TetrisGame
                onGameOver={(score) => {
                  setHighScores((prev) => ({
                    ...prev,
                    TETRIS: Math.max(prev.TETRIS, score),
                  }));
                  setCurrentScreen("GAME_MENU");
                }}
              />
            )}
            {games[selectedGame] === "PACMAN" && (
              <PacmanGame
                onGameOver={(score) => {
                  setHighScores((prev) => ({
                    ...prev,
                    PACMAN: Math.max(prev.PACMAN, score),
                  }));
                  setCurrentScreen("GAME_MENU");
                }}
              />
            )}
          </GameScreen>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <GlobalStyle />
      <ArcadeContainer>
        <ArcadeBackground />
        <ArcadeCabinet>
          <MarqueeLights>
            {[...Array(8)].map((_, i) => (
              <MarqueeLight key={i} style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </MarqueeLights>
          <ArcadeFrame>
            <ScreenGlow />
            {renderScreen()}
          </ArcadeFrame>
          <ControlPanel>
            <CoinSlot />
            <Coin isAnimating={isCoinAnimating} />
            <Joystick />
            <Buttons>
              <Button color="#ff1744" />
              <Button color="#00e676" />
              <Button color="#2979ff" />
            </Buttons>
          </ControlPanel>
        </ArcadeCabinet>
      </ArcadeContainer>
    </>
  );
}

export default App;
