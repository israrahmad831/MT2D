// Importăm bibliotecile necesare
import React, { useState, useEffect, useRef } from "react";
import GameWorld from "./components/GameWorld";
import Preloader from "./components/Preloader";
import CharacterSelection from "./components/CaracterSelection";
import Intro from "./components/intro";
import { Player } from "./types";
import { generateId } from "./utils";
import SkillTreeWindow from "./components/skills/SkillTreeWindow";
import { GameItems } from "./items/GameItems";
import { EquipmentStatsSystem } from "./systems/equipment/EquipmentStatsSystem";
import EscapeMenu from "./components/EscapeMenu";
import { SoundManager } from "./utils/SoundManager";
import { initializeProtection } from "./utils/gameProtection";

// Obfuscăm numele componentei App
const _0x1a2b3c: React.FC = () => {
  // Obfuscăm numele stărilor
  const [_0x2c4d5e, _0x6e7f8g] = useState("map1");
  const [_0x9h0i1j, _0x2k3l4m] = useState(false);
  const [_0x5n6o7p, _0x8q9r0s] = useState(false);
  const [_0x1t2u3v, _0x4w5x6y] = useState<Player | null>(null);
  const [_0x7z8a9b, _0x0c1d2e] = useState(false);
  const [_0x3f4g5h, _0x6i7j8k] = useState(false);
  const [_0x9l0m1n, _0x2o3p4q] = useState(false);
  const [_0x5r6s7t, _0x8u9v0w] = useState(false);
  const [_0x1x2y3z, _0x4a5b6c] = useState({ x: 0, y: 0 });
  const [_0x7d8e9f, _0x0g1h2i] = useState(3.2);
  const [_0x3j4k5l, _0x6m7n8o] = useState(false);
  const [_0x9p0q1r, _0x2s3t4u] = useState(false);
  const [_0x5v6w7x, _0x8y9z0a] = useState<HTMLAudioElement | null>(null);
  const [_0x1b2c3d, _0x4e5f6g] = useState(false);
  const _0x7h8i9j = React.useRef<HTMLAudioElement | null>(null);

  // Inițializăm protecția anti-copiere
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      initializeProtection();
    }
  }, []);

  // Inițializăm managerul de sunete
  useEffect(() => {
    SoundManager.preloadSounds();
  }, []);

  // Încărcăm starea de mute din localStorage la încărcarea inițială
  useEffect(() => {
    const savedMuteState = localStorage.getItem("isMuted") === "true";
    _0x4e5f6g(savedMuteState);
    SoundManager.setMuted(savedMuteState);
  }, []);

  // Gestionăm muzica de meniu - DOAR pentru ecranul intro
  useEffect(() => {
    // Curățăm orice audio existent mai întâi
    if (_0x7h8i9j.current) {
      _0x7h8i9j.current.pause();
      _0x7h8i9j.current.src = "";
      _0x7h8i9j.current = null;
    }

    // Creăm și redăm muzica de meniu doar dacă suntem la ecranul intro (nu la selecția personajelor sau în joc)
    if (!_0x9h0i1j && !_0x5n6o7p && !_0x1b2c3d) {
      try {
        const audio = new Audio(
          "https://github.com/mrlalex/test/raw/main/Metin%202%20OST%20-%20Intro%20Theme.mp3"
        );
        audio.volume = 0.4;
        audio.loop = true;
        audio.preload = "auto";

        // Stocăm în ref pentru acces imediat și curățare
        _0x7h8i9j.current = audio;
        _0x8y9z0a(audio);

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Menu music autoplay prevented:", error);
          });
        }
      } catch (error) {
        console.warn("Could not load menu music:", error);
      }
    } else {
      // Dacă nu suntem la ecranul intro, ne asigurăm că muzica de meniu este null
      _0x8y9z0a(null);
    }

    // Curățare la unmount sau când efectul rulează din nou
    return () => {
      if (_0x7h8i9j.current) {
        _0x7h8i9j.current.pause();
        _0x7h8i9j.current.src = "";
        _0x7h8i9j.current = null;
      }
    };
  }, [_0x9h0i1j, _0x5n6o7p, _0x1b2c3d]);

  // Gestionăm muzica de fundal a jocului - DOAR când jocul este pornit
  useEffect(() => {
    if (_0x9h0i1j) {
      // Când jocul pornește, curățăm forțat muzica de meniu
      if (_0x7h8i9j.current) {
        _0x7h8i9j.current.pause();
        _0x7h8i9j.current.src = "";
        _0x7h8i9j.current = null;
      }
      _0x8y9z0a(null);

      // Pornim muzica de fundal a jocului cu o întârziere
      setTimeout(() => {
        SoundManager.playBackgroundMusic();
      }, 1000);
    } else {
      // Când ne întoarcem la meniu, oprim muzica jocului
      SoundManager.stopBackgroundMusic();
    }
  }, [_0x9h0i1j]);

  // Gestionăm interacțiunea utilizatorului pentru a porni muzica de meniu dacă a fost prevenită de politicile browserului
  useEffect(() => {
    const handleUserInteraction = () => {
      if (
        !_0x9h0i1j &&
        !_0x5n6o7p &&
        _0x7h8i9j.current &&
        _0x7h8i9j.current.paused &&
        !_0x1b2c3d
      ) {
        _0x7h8i9j.current.play().catch((error) => {
          console.log("Menu music play failed on interaction:", error);
        });
      }
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };
  }, [_0x9h0i1j, _0x5n6o7p, _0x1b2c3d]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && _0x9h0i1j) {
        e.preventDefault();
        _0x6m7n8o((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [_0x9h0i1j]);

  useEffect(() => {
    if (_0x1t2u3v && _0x9h0i1j) {
      const autosaveInterval = setInterval(() => {
        localStorage.setItem(
          `savegame_${_0x1t2u3v.name}`,
          JSON.stringify({
            ..._0x1t2u3v,
            savedAt: Date.now(),
          })
        );
      }, 5000);

      return () => clearInterval(autosaveInterval);
    }
  }, [_0x1t2u3v, _0x9h0i1j]);

  const handleStartGame = () => {
    // Oprim muzica de meniu înainte de a merge la selecția personajelor
    if (_0x7h8i9j.current) {
      _0x7h8i9j.current.pause();
      _0x7h8i9j.current.src = "";
      _0x7h8i9j.current = null;
    }
    _0x8y9z0a(null);

    _0x8q9r0s(true);
  };

  const handleExitToMainMenu = () => {
    if (_0x1t2u3v) {
      localStorage.setItem(
        `savegame_${_0x1t2u3v.name}`,
        JSON.stringify({
          ..._0x1t2u3v,
          savedAt: Date.now(),
        })
      );
    }

    // Oprim muzica de fundal când ieșim la meniul principal
    SoundManager.stopBackgroundMusic();

    window.location.reload();
  };

  const handleOfflineModeToggle = () => {
    _0x2s3t4u((prev) => !prev);
    _0x6m7n8o(false);
  };

  const handleCharacterSelect = (selectedPlayer: Player) => {
    _0x4w5x6y(selectedPlayer);
    _0x8q9r0s(false);
    _0x0c1d2e(true);
    _0x2k3l4m(true);
    _0x2o3p4q(true);
  };

  const handleBackToMainMenu = () => {
    _0x8q9r0s(false);
    // Muzica de meniu va porni automat datorită dependenței useEffect
  };

  const handleMapSelect = (mapName: string) => {
    _0x8u9v0w(false);
    _0x0c1d2e(true);

    const playerCopy = JSON.parse(JSON.stringify(_0x1t2u3v));

    if (mapName === "map1") {
      playerCopy.position = { x: 1230, y: 1230 };
      _0x0g1h2i(3.2);
    } else if (mapName === "sohan") {
      playerCopy.position = { x: 1230, y: 1230 };
      _0x0g1h2i(3.2);
    } else if (mapName === "village") {
      playerCopy.position = { x: 1230, y: 1230 };
      _0x0g1h2i(3.2);
    }

    _0x6e7f8g(mapName);

    setTimeout(() => {
      // Asigurăm că controalele sunt activate după schimbarea hărții
      playerCopy.controlsDisabled = false;
      _0x4w5x6y(playerCopy);
      _0x0c1d2e(false);
    }, 1500);
  };

  const handleToggleMute = () => {
    const newMuteState = !_0x1b2c3d;
    _0x4e5f6g(newMuteState);

    // Actualizăm localStorage pentru persistență
    localStorage.setItem("isMuted", newMuteState.toString());

    // Actualizăm volumul elementului audio dacă există
    if (_0x7h8i9j.current) {
      _0x7h8i9j.current.volume = newMuteState ? 0 : 0.4;
    }

    // Actualizăm starea de mute în SoundManager
    SoundManager.setMuted(newMuteState);

    // Trimitem eveniment pentru ecranul de selecție a personajelor
    const event = new CustomEvent("characterSelectionMuteChanged", {
      detail: { muted: newMuteState },
    });
    document.dispatchEvent(event);
  };

  if (_0x7z8a9b) {
    return <Preloader onLoadComplete={() => _0x0c1d2e(false)} />;
  }

  // Arătăm ecranul de selecție a personajelor
  if (_0x5n6o7p) {
    return (
      <CharacterSelection
        onCharacterSelect={handleCharacterSelect}
        onBack={handleBackToMainMenu}
      />
    );
  }

  // Arătăm ecranul intro dacă jocul nu a început
  if (!_0x9h0i1j) {
    return (
      <Intro
        onStartGame={handleStartGame}
        isMuted={_0x1b2c3d}
        onToggleMute={handleToggleMute}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-900 text-white flex flex-col"
      style={{ fontFamily: 'GameFont, "Press Start 2P", monospace' }}
    >
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
        <div id="chest-notifications" className="flex flex-col gap-2" />
      </div>

      <div className="w-full h-full relative">
        {_0x2c4d5e !== "map1" &&
          _0x2c4d5e !== "yogbi" &&
          _0x2c4d5e !== "village" && (
            <div className="snow-container fixed inset-0 pointer-events-none z-[1]">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="snow"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${Math.random() * 3 + 2}s`,
                  }}
                />
              ))}
            </div>
          )}

        {_0x3j4k5l && (
          <EscapeMenu
            onClose={() => _0x6m7n8o(false)}
            onExitToMainMenu={handleExitToMainMenu}
            onOfflineModeToggle={handleOfflineModeToggle}
            isOfflineMode={_0x9p0q1r}
          />
        )}

        <GameWorld
          player={_0x1t2u3v}
          setPlayer={_0x4w5x6y}
          showMapSelection={_0x5r6s7t}
          setShowMapSelection={_0x8u9v0w}
          mapSelectionPosition={_0x1x2y3z}
          setMapSelectionPosition={_0x4a5b6c}
          onMapSelect={handleMapSelect}
          currentMap={_0x2c4d5e}
          zoomLevel={_0x7d8e9f}
          isOfflineMode={_0x9p0q1r}
          onOfflineModeToggle={handleOfflineModeToggle}
        />
        {_0x3f4g5h && (
          <SkillTreeWindow
            player={_0x1t2u3v}
            setPlayer={_0x4w5x6y}
            onClose={() => _0x6i7j8k(false)}
          />
        )}
        {_0x9l0m1n && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-900 p-8 rounded-lg max-w-2xl mx-4">
              <h2
                className="text-2xl font-bold text-yellow-400 mb-4 menu-text"
                style={{ fontFamily: 'GameFont, "Press Start 2P", monospace' }}
              >
                Welcome to MT2D v0.3
              </h2>
              <div
                className="space-y-4 text-gray-300 menu-text text-sm"
                style={{ fontFamily: 'GameFont, "Press Start 2P", monospace' }}
              >
                <p>🎮 Current Features:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Combat system with combo attacks and skills</li>
                  <li>Inventory system with equipment and upgrades</li>
                  <li>Metin stones and monsters</li>
                  <li>Autosave every second</li>
                </ul>

                <p>⌨️ Controls:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Press <span className="text-yellow-400">C</span> for
                    Character Status
                  </li>
                  <li>
                    Press <span className="text-yellow-400">V</span> for Skill
                    Tree
                  </li>
                  <li>
                    Press <span className="text-yellow-400">I</span> for
                    Inventory
                  </li>
                  <li>WASD for movement</li>
                  <li>Space for attack combos</li>
                  <li>1-4 and F1-F4 for skills</li>
                  <li>ctrl+g to equip mount </li>
                </ul>
              </div>
              <button
                onClick={() => _0x2o3p4q(false)}
                className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded menu-text text-sm"
                style={{ fontFamily: 'GameFont, "Press Start 2P", monospace' }}
              >
                Start Playing
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add the image at the bottom center */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-[5] pointer-events-none">
        <img
          src="https://i.imgur.com/KDGJQFj.png"
          alt="Bottom decoration"
          className="w-auto h-auto"
          style={{ transform: "scale(2.5) scaleY(1.5)" }}
        />
      </div>

      <style>
        {`
          .menu-text {
            font-family: 'GameFont', 'Press Start 2P', monospace;
            image-rendering: pixelated;
          }
          
          @font-face {
            font-family: 'GameFont';
            src: url('./assets/font.ttf') format('truetype'),
                 url('https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2') format('woff2');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
          
          @font-face {
            font-family: 'Press Start 2P';
            src: url('https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2') format('woff2');
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-in-out forwards;
          }
          
          .animate-fadeOut {
            animation: fadeOut 0.5s ease-in-out forwards;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(10px); }
          }
          
          .pixel-text {
            font-family: 'GameFont', 'Press Start 2P', monospace;
            image-rendering: pixelated;
          }
        `}
      </style>
    </div>
  );
};

// Exportăm componenta cu un nume obfuscat
export default _0x1a2b3c;
