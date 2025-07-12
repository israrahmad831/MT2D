import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { SoundManager } from "../utils/SoundManager";

interface IntroProps {
  onStartGame: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const Intro: React.FC<IntroProps> = ({
  onStartGame,
  isMuted,
  onToggleMute,
}) => {
  const [selectedChannel, setSelectedChannel] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const channels = [
    { id: 1, name: "CH1", status: "ON", online: true },
    { id: 2, name: "CH2", status: "OFF", online: false },
    { id: 3, name: "CH3", status: "OFF", online: false },
    { id: 4, name: "CH4", status: "OFF", online: false },
  ];

  const handleChannelSelect = (channelId: number) => {
    setSelectedChannel(channelId);
    setErrorMessage(null); // Clear any previous error
    SoundManager.playWindowOpenSound();

    // Show offline message if needed
    const selectedCh = channels.find((ch) => ch.id === channelId);
    if (selectedCh && !selectedCh.online) {
      setErrorMessage("This channel is offline!");
    }
  };

  const handleOkClick = () => {
    // Check if selected channel is online
    const selectedCh = channels.find((ch) => ch.id === selectedChannel);

    if (selectedCh && selectedCh.online) {
      console.log(`Connecting to channel ${selectedChannel}`);
      SoundManager.playWindowOpenSound();
      onStartGame();
    } else {
      SoundManager.playWindowCloseSound(); // Play error sound
      setErrorMessage("This channel is offline!");
    }
  };

  const handleDiscordClick = () => {
    SoundManager.playWindowOpenSound();
    window.open("https://discord.gg/gMV4AmBb", "_blank");
  };

  const handleWebsiteClick = () => {
    SoundManager.playWindowOpenSound();
    window.open("https://www.mt2d.info", "_blank");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: 'url("https://i.imgur.com/113zqEp.png")',
      }}
    >
      {/* Mute Button - Top Center */}
      <div className="absolute left-1/2 transform -translate-x-1/2 z-50 top-20 md:top-4 top-[18px] md:top-4">
        <button
          onClick={onToggleMute}
          className="bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition-colors shadow-lg"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="text-red-500 w-7 h-7" />
          ) : (
            <Volume2 className="text-green-500 w-7 h-7" />
          )}
        </button>
      </div>

      {/* Version Text - Top Right */}
      <div className="absolute top-6 right-6 text-yellow-400 font-bold text-lg pixel-text">
        MT2D BETA v0.5
      </div>

      {/* Discord & Website Buttons - Responsive Layout */}
      <div className="absolute bottom-6 w-full flex flex-col items-center md:flex-row md:justify-between md:space-x-0 space-y-4 md:space-y-0 items-end md:items-end">
        <button
          onClick={handleDiscordClick}
          className="hover:scale-105 transition-all duration-200 focus:outline-none"
        >
          <img
            src="https://i0.wp.com/peakofserenity.com/wp-content/uploads/2018/12/wZgPoYaVlU0gAAAABJRU5ErkJggg.png?fit=777%2C249&ssl=1&w=640"
            alt="Discord"
            className="h-12 w-auto"
          />
        </button>
        <button
          onClick={handleWebsiteClick}
          className="hover:scale-105 transition-all duration-200 focus:outline-none"
        >
          <img
            src="https://www.rankcardgame.com/images/How%20to%20play.png"
            alt="Website"
            className="h-12 w-auto rounded-lg"
          />
        </button>
      </div>
      {/* Responsive Styles for stacking buttons and lowering volume button on mobile */}
      <style>{`
        @media (max-width: 767px) {
          .volume-mobile-lower {
            top: 32px !important;
          }
          .discord-website-mobile {
            flex-direction: column !important;
            left: 1.5rem !important;
            right: 1.5rem !important;
            bottom: 1.5rem !important;
            align-items: flex-end !important;
            gap: 1rem !important;
          }
        }
      `}</style>

      {/* Transparent Frame */}
      <div className="relative bg-black/40 backdrop-blur-sm border border-gray-600/50 rounded-lg p-8 w-96 h-80">
        {/* Left Side - Server Selection */}
        <div className="absolute left-6 top-6">
          <div className="space-y-2">
            <div
              className="text-yellow-400 font-bold text-lg cursor-pointer hover:text-yellow-300 transition-colors border border-gray-500/50 bg-gray-800/50 px-3 py-2 rounded pixel-text"
              onClick={() => {
                SoundManager.playWindowOpenSound();
                console.log("MT2D Server selected");
              }}
            >
              MT2D
            </div>
          </div>
        </div>

        {/* Right Side - Channel List */}
        <div className="absolute right-6 top-6">
          <div className="space-y-1">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className={`cursor-pointer text-sm transition-colors px-2 py-1 rounded pixel-text ${
                  selectedChannel === channel.id
                    ? "bg-yellow-600/30 text-yellow-300"
                    : "text-gray-300 hover:text-white"
                }`}
                onClick={() => handleChannelSelect(channel.id)}
              >
                <span className="font-semibold">{channel.name}</span>
                {channel.online ? (
                  <span className="ml-2 text-green-400 font-bold">ON</span>
                ) : (
                  <span className="ml-2 text-red-400 font-bold">OFF</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="absolute bottom-20 left-0 right-0 text-center">
            <p className="text-red-400 text-sm font-bold pixel-text">
              {errorMessage}
            </p>
          </div>
        )}

        {/* OK Button */}
        <div className="absolute bottom-6 right-6">
          <button
            onClick={handleOkClick}
            className={`${
              channels.find((ch) => ch.id === selectedChannel)?.online
                ? "bg-gray-700/80 hover:bg-gray-600/80"
                : "bg-gray-700/50 cursor-not-allowed"
            } text-white font-bold py-2 px-6 rounded border border-gray-500/50 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 pixel-text`}
          >
            OK
          </button>
        </div>

        {/* Decorative Border Effects */}
        <div className="absolute inset-0 rounded-lg border border-yellow-600/20 pointer-events-none"></div>
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-yellow-500/40 rounded-tl"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-yellow-500/40 rounded-tr"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-yellow-500/40 rounded-bl"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-yellow-500/40 rounded-br"></div>
      </div>
    </div>
  );
};

export default Intro;
