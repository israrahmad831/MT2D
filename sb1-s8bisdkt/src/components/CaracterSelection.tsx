import React, { useState, useEffect, useRef } from "react";
import { Player } from "../types";
import { generateId } from "../utils";
import { GameItems } from "../items/GameItems";
import { EquipmentStatsSystem } from "../systems/equipment/EquipmentStatsSystem";
import { SoundManager } from "../utils/SoundManager";

interface Character {
  id: string;
  name: string;
  class: "Warrior";
  level: number;
  createdAt: number;
  lastPlayed: number;
}

interface CharacterSelectionProps {
  onCharacterSelect: (character: Player) => void;
  onBack: () => void;
}

const CharacterSelection: React.FC<CharacterSelectionProps> = ({
  onCharacterSelect,
  onBack,
}) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState("");
  const [nameError, setNameError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCharacterName, setDeleteCharacterName] = useState("");

  // Add a ref for character selection music
  const characterMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadCharacters();
  }, []);

  // Add this useEffect for music management
  useEffect(() => {
    console.log("CharacterSelection - Se inițializează muzica");

    // Function to completely stop music
    const stopMusic = () => {
      if (characterMusicRef.current) {
        characterMusicRef.current.pause();
        characterMusicRef.current.src = "";
        characterMusicRef.current = null;
      }
    };

    // Stop any existing music first
    stopMusic();

    // Get mute state from localStorage
    const isMuted = localStorage.getItem("isMuted") === "true";
    console.log("CharacterSelection - Mute state on load:", isMuted);

    // Only initialize and play music if NOT muted
    if (!isMuted) {
      // Create new audio element
      const audio = new Audio(
        "https://opengameart.org/sites/default/files/Woodland%20Fantasy.mp3"
      );
      audio.volume = 0.15;
      audio.loop = true;

      // Store reference
      characterMusicRef.current = audio;

      // Try to play music
      audio.play().catch((err) => {
        // Ignore AbortError as it's typically harmless (play interrupted by pause)
        if (err.name !== "AbortError") {
          console.error("Could not play character selection music:", err);
        }
      });
    }

    // Handler for mute/unmute events
    const handleMuteChange = (event: CustomEvent) => {
      const { muted } = event.detail;
      console.log("CharacterSelection - Received mute event:", muted);

      if (muted) {
        // If mute is activated, stop music
        stopMusic();
      } else {
        // If unmute is activated, start music
        if (!characterMusicRef.current) {
          const audio = new Audio(
            "https://opengameart.org/sites/default/files/Woodland%20Fantasy.mp3"
          );
          audio.volume = 0.15;
          audio.loop = true;
          characterMusicRef.current = audio;

          audio.play().catch((err) => {
            // Ignore AbortError as it's typically harmless (play interrupted by pause)
            if (err.name !== "AbortError") {
              console.error("Could not play music after unmute:", err);
            }
          });
        } else {
          characterMusicRef.current.play().catch((err) => {
            // Ignore AbortError as it's typically harmless (play interrupted by pause)
            if (err.name !== "AbortError") {
              console.error("Could not resume music after unmute:", err);
            }
          });
        }
      }
    };

    // Add listener for mute event
    document.addEventListener(
      "characterSelectionMuteChanged",
      handleMuteChange as EventListener
    );

    // Cleanup on unmount
    return () => {
      console.log("CharacterSelection - Cleaning up music on unmount");
      document.removeEventListener(
        "characterSelectionMuteChanged",
        handleMuteChange as EventListener
      );
      stopMusic();
    };
  }, []);

  const loadCharacters = () => {
    const savedCharacters = localStorage.getItem("gameCharacters");
    if (savedCharacters) {
      const parsed = JSON.parse(savedCharacters);
      setCharacters(parsed);
      if (parsed.length > 0 && !selectedCharacter) {
        setSelectedCharacter(parsed[0]);
      }
    }
  };

  const saveCharacters = (chars: Character[]) => {
    localStorage.setItem("gameCharacters", JSON.stringify(chars));
    setCharacters(chars);
  };

  const handleCreateCharacter = () => {
    SoundManager.playWindowOpenSound();

    if (!newCharacterName.trim()) {
      setNameError("Please enter a character name");
      SoundManager.playUpgradeFailSound();
      return;
    }

    if (newCharacterName.length < 3) {
      setNameError("Character name must be at least 3 characters");
      SoundManager.playUpgradeFailSound();
      return;
    }

    if (
      characters.some(
        (char) => char.name.toLowerCase() === newCharacterName.toLowerCase()
      )
    ) {
      setNameError("Character name already exists");
      SoundManager.playUpgradeFailSound();
      return;
    }

    if (characters.length >= 4) {
      setNameError("Maximum 4 characters allowed");
      SoundManager.playUpgradeFailSound();
      return;
    }

    const newCharacter: Character = {
      id: generateId(),
      name: newCharacterName.trim(),
      class: "Warrior",
      level: 1,
      createdAt: Date.now(),
      lastPlayed: Date.now(),
    };

    // Create full player data
    const initialInventory = [
      {
        ...GameItems.SWORD_PLUS_0,
        id: "sword-plus-0",
        slotId: "inv-26",
        gemSlots: [],
      },
      {
        ...GameItems.MOONLIGHT_CHEST,
        id: "moonlight-chest",
        slotId: "inv-4",
        stackSize: 5,
      },
      {
        ...GameItems.JEWELRY_CHEST,
        id: "jewelry-chest",
        slotId: "inv-6",
        stackSize: 1,
      },
      {
        ...GameItems.WARRIORS_CHEST,
        id: "warriors-chest",
        slotId: "inv-7",
        stackSize: 1,
      },
      {
        ...GameItems.GOLD_PIECE,
        id: "gold-piece",
        slotId: "inv-8",
        stackSize: 10,
      },
      {
        ...GameItems.UPGRADE_CHEST,
        id: "upgrade-chest",
        slotId: "inv-9",
        stackSize: 5,
      },
      { ...GameItems.TELEPORT_RING, id: "teleport-ring", slotId: "inv-25" },
      {
        ...GameItems.BUILDING_MATERIAL,
        id: "building-material",
        slotId: "inv-10",
        stackSize: 200,
      },
    ];

    const defaultPlayer: Player = {
      id: newCharacter.id,
      name: newCharacter.name,
      class: "Warrior",
      level: 1,
      experience: 0,
      experienceToNextLevel: 30,
      position: { x: 1230, y: 1230 },
      direction: { x: 0, y: 1 },
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      baseStats: {
        vit: 1,
        str: 1,
        int: 1,
        dex: 1,
      },
      statPoints: 0,
      skillPoints: 100,
      isStatsWindowOpen: false,
      skillLevels: {
        "sword-aura": 1,
        "sword-spin": 1,
        "three-way-cut": 1,
        dash: 1,
        berserker: 1,
        "red-potion": 1,
      },
      levelUpEffect: {
        active: false,
        startTime: 0,
        duration: 0,
      },
      attackSequence: 0,
      lastAttackTime: 0,
      isAttacking: false,
      inventory: initialInventory,
      isInventoryOpen: false,
      inventoryPosition: {
        x: window.innerWidth / 2 - 100,
        y: window.innerHeight / 2 - 300,
      },
      yang: 10,
      attack: 5,
      defense: 2,
      savedAt: Date.now(),
      controlsDisabled: false,
    };

    const playerWithStats = EquipmentStatsSystem.applyEquipmentStats(
      defaultPlayer,
      initialInventory
    );

    // Save character data
    localStorage.setItem(
      `savegame_${newCharacter.name}`,
      JSON.stringify(playerWithStats)
    );

    const updatedCharacters = [...characters, newCharacter];
    saveCharacters(updatedCharacters);
    setSelectedCharacter(newCharacter);
    setShowCreateForm(false);
    setNewCharacterName("");
    setNameError("");

    SoundManager.playUpgradeSuccessSound();
  };

  const handleDeleteCharacter = () => {
    SoundManager.playWindowOpenSound();

    if (!selectedCharacter) return;

    if (deleteCharacterName !== selectedCharacter.name) {
      setNameError("Character name does not match");
      SoundManager.playUpgradeFailSound();
      return;
    }

    // Remove character data
    localStorage.removeItem(`savegame_${selectedCharacter.name}`);

    const updatedCharacters = characters.filter(
      (char) => char.id !== selectedCharacter.id
    );
    saveCharacters(updatedCharacters);

    setSelectedCharacter(
      updatedCharacters.length > 0 ? updatedCharacters[0] : null
    );
    setShowDeleteConfirm(false);
    setDeleteCharacterName("");
    setNameError("");

    SoundManager.playWindowCloseSound();
  };

  const handleStartGame = () => {
    if (!selectedCharacter) return;

    SoundManager.playWindowOpenSound();

    const saveData = localStorage.getItem(`savegame_${selectedCharacter.name}`);
    if (saveData) {
      const parsedData = JSON.parse(saveData);

      // Update last played time
      const updatedCharacters = characters.map((char) =>
        char.id === selectedCharacter.id
          ? { ...char, lastPlayed: Date.now() }
          : char
      );
      saveCharacters(updatedCharacters);

      const playerWithEnabledControls = {
        ...parsedData,
        controlsDisabled: false,
      };

      // Stop character selection music before starting game
      if (characterMusicRef.current) {
        characterMusicRef.current.pause();
        characterMusicRef.current.src = "";
        characterMusicRef.current = null;
      }

      onCharacterSelect(playerWithEnabledControls);
    }
  };

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const prevValue = newCharacterName;

    // Play typing sound when adding a character
    if (newValue.length > prevValue.length) {
      SoundManager.playSound("/src/sounds/type.wav", 1.0);
    }
    // Play fail sound when deleting a character
    else if (newValue.length < prevValue.length) {
      SoundManager.playSound("/src/sounds/fail.wav", 1.0);
    }

    setNewCharacterName(newValue);
    setNameError("");
  };

  const handleDeleteNameInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.value;
    const prevValue = deleteCharacterName;

    // Play typing sound when adding a character
    if (newValue.length > prevValue.length) {
      SoundManager.playSound("/src/sounds/type.wav", 1.0);
    }
    // Play fail sound when deleting a character
    else if (newValue.length < prevValue.length) {
      SoundManager.playSound("/src/sounds/fail.wav", 1.0);
    }

    setDeleteCharacterName(newValue);
    setNameError("");
  };

  const handleSelectCharacter = (character: Character) => {
    SoundManager.playWindowOpenSound();
    setSelectedCharacter(character);
  };

  const handleShowCreateForm = () => {
    SoundManager.playWindowOpenSound();
    setShowCreateForm(true);
  };

  const handleShowDeleteConfirm = () => {
    SoundManager.playWindowOpenSound();
    setShowDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    SoundManager.playWindowCloseSound();
    setShowDeleteConfirm(false);
    setDeleteCharacterName("");
    setNameError("");
  };

  const handleCloseCreateForm = () => {
    SoundManager.playWindowCloseSound();
    setShowCreateForm(false);
    setNewCharacterName("");
    setNameError("");
  };

  const handleBackToMenu = () => {
    // Stop character selection music BEFORE navigating back
    if (characterMusicRef.current) {
      characterMusicRef.current.pause();
      characterMusicRef.current.src = "";
      characterMusicRef.current = null;
    }

    // Play window close sound
    SoundManager.playWindowCloseSound();

    // Navigate back to main menu
    onBack();
  };

  const canCreateNewCharacter = characters.length < 4;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col relative">
      {/* Background */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: "url(https://i.imgur.com/MaPt0Nh.png)",
          backgroundSize: "cover",
          backgroundPosition: "right bottom",
          imageRendering: "pixelated",
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-6 flex-col md:flex-row gap-4 md:gap-0">
        <div className="text-xl font-bold menu-text text-center md:text-left">
          Character Selection
        </div>
        {/* Back button: visible in header only on md and up */}
        <button
          onClick={handleBackToMenu}
          className="hidden md:block px-4 py-2 bg-red-600 hover:bg-red-700 rounded menu-text transition-colors w-fit md:w-auto"
        >
          Back
        </button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Character List - Only show if characters exist */}
          {characters.length > 0 && (
            <div className="w-full md:w-fit p-4 order-2 md:order-1 flex justify-center">
              <div className="bg-black bg-opacity-80 rounded-lg p-4 max-w-full h-fit">
                <h2 className="text-yellow-400 font-bold mb-4 menu-text text-center whitespace-nowrap">
                  Characters
                </h2>

                <div className="space-y-2 mb-4 flex flex-col items-center">
                  {characters.map((character) => (
                    <div
                      key={character.id}
                      onClick={() => handleSelectCharacter(character)}
                      className={`p-2 rounded cursor-pointer transition-colors menu-text text-center w-fit mx-auto min-w-[120px] max-w-full ${
                        selectedCharacter?.id === character.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      }`}
                    >
                      <div className="font-bold whitespace-nowrap">
                        {character.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Character Preview - Center content */}
          <div className="flex-1 flex flex-col items-center justify-center order-1 md:order-2">
            {/* Arrow placeholders for future class selection */}
            <div className="w-full flex items-center justify-between opacity-30 mb-2 md:mb-0 md:w-16 md:justify-center">
              <div className="text-3xl font-bold hidden md:block">←</div>
              <div className="text-3xl font-bold md:hidden">←</div>
              <div className="text-3xl font-bold md:hidden">→</div>
              <div className="text-3xl font-bold hidden md:block">→</div>
            </div>

            {/* Character Model Display */}
            <div className="flex-1 flex flex-col items-center h-full py-4">
              <div className="flex-grow"></div>
              <div className="mb-8 mt-auto sm:mb-16">
                <img
                  src="https://i.imgur.com/sGRAaBX.gif"
                  alt="Character Preview"
                  className="w-40 h-40 sm:w-72 sm:h-72 object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
              {selectedCharacter && (
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-8 mb-6 w-full md:w-auto">
                  <button
                    onClick={handleStartGame}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded menu-text text-xl transition-colors w-full sm:w-auto"
                  >
                    START
                  </button>
                  <button
                    onClick={handleShowDeleteConfirm}
                    className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded menu-text text-xl transition-colors w-full sm:w-auto"
                  >
                    DELETE
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Create New Character Button - Only show if we have characters but can create more */}
          {canCreateNewCharacter && characters.length > 0 && (
            <div className="w-full md:w-1/5 p-4 flex flex-row md:flex-col justify-center md:justify-end items-center md:items-end gap-2 order-3">
              <button
                onClick={handleShowCreateForm}
                className="w-fit p-3 bg-green-600 hover:bg-green-700 rounded menu-text transition-colors"
              >
                Create New Character
              </button>
              {/* Back button: only show below md, not on desktop */}
              <button
                onClick={handleBackToMenu}
                className="flex-row:block md:hidden w-fit p-3 bg-red-600 hover:bg-red-700 rounded menu-text transition-colors"
              >
                Back
              </button>
            </div>
          )}
        </div>

        {/* Character Details - Bottom left, small size */}
        {selectedCharacter && (
          <div className="fixed left-1/2 top-auto md:left-4 md:top-auto md:bottom-4 max-w-3xl:bottom-4 transform -translate-x-1/2 md:translate-x-0 bg-black bg-opacity-80 rounded-lg p-3 max-w-xs w-11/12 md:w-auto z-40 mt-4 md:mt-0">
            <div className="flex items-center text-sm">
              <div className="text-yellow-400 font-bold menu-text">
                {selectedCharacter.name}
              </div>
              <div className="text-gray-400 ml-2 menu-text text-xs">
                Lv.{selectedCharacter.level} {selectedCharacter.class}
              </div>
            </div>
            <div className="text-gray-300 menu-text text-xs mt-1">
              Created:{" "}
              {new Date(selectedCharacter.createdAt).toLocaleDateString()}
            </div>
            <div className="text-gray-300 menu-text text-xs">
              Last Played:{" "}
              {new Date(selectedCharacter.lastPlayed).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {/* Character Creation Form - At the very bottom for new players (no transparent frame) */}
      {characters.length === 0 && !showCreateForm && (
        <div className="relative z-20 w-full p-6 flex flex-col items-center mb-4">
          <div className="w-full max-w-md">
            <input
              type="text"
              value={newCharacterName}
              onChange={handleNameInputChange}
              placeholder="Enter character name"
              className="w-full p-3 rounded border-2 border-gray-600 text-white bg-black placeholder-gray-400 focus:outline-none focus:border-yellow-500 menu-text"
              maxLength={20}
            />
            {nameError && (
              <p className="text-red-500 text-sm mt-1 menu-text">{nameError}</p>
            )}
          </div>
          <button
            onClick={handleCreateCharacter}
            className="mt-4 px-8 py-3 bg-green-600 hover:bg-green-700 rounded menu-text text-xl transition-colors w-full max-w-md"
          >
            Create Character
          </button>
        </div>
      )}

      {/* Create Character Form for returning players */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6 menu-text text-center">
              Create New Character
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm mb-2 menu-text">
                  Character Name
                </label>
                <input
                  type="text"
                  value={newCharacterName}
                  onChange={handleNameInputChange}
                  placeholder="Enter character name"
                  className="w-full p-3 bg-black rounded border-2 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 menu-text"
                  maxLength={20}
                />
                {nameError && (
                  <p className="text-red-500 text-sm mt-1 menu-text">
                    {nameError}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-white text-sm mb-2 menu-text">
                  Class
                </label>
                <div className="p-3 bg-gray-700 rounded menu-text">
                  Warrior (Default)
                </div>
              </div>
              <div className="flex gap-4 mt-6 flex-col md:flex-row">
                <button
                  onClick={handleCreateCharacter}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded menu-text transition-colors w-full md:w-auto"
                >
                  Create Character
                </button>
                <button
                  onClick={handleCloseCreateForm}
                  className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 rounded menu-text transition-colors w-full md:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-red-400 mb-6 menu-text text-center">
              Delete Character
            </h2>
            <div className="space-y-4">
              <p className="text-white menu-text text-center">
                Are you sure you want to delete{" "}
                <span className="text-yellow-400">
                  {selectedCharacter.name}
                </span>
                ?
              </p>
              <div>
                <label className="block text-white text-sm mb-2 menu-text">
                  Type the character name to confirm:
                </label>
                <input
                  type="text"
                  value={deleteCharacterName}
                  onChange={handleDeleteNameInputChange}
                  placeholder={selectedCharacter.name}
                  className="w-full p-3 bg-black rounded border-2 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-red-500 menu-text"
                />
                {nameError && (
                  <p className="text-red-500 text-sm mt-1 menu-text">
                    {nameError}
                  </p>
                )}
              </div>
              <div className="flex gap-4 mt-6 flex-col sm:flex-row">
                <button
                  onClick={handleDeleteCharacter}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded menu-text transition-colors w-full sm:w-auto"
                >
                  Delete
                </button>
                <button
                  onClick={handleCloseDeleteConfirm}
                  className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 rounded menu-text transition-colors w-full sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterSelection;
