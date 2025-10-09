import React, { useState, useRef, useEffect } from 'react';

const MusicPlayer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0); // For seek bar
  const [duration, setDuration] = useState(0); // Track duration
  const [currentTime, setCurrentTime] = useState(0); // Current playback time
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  // Sample full-length tracks that actually work
  const [tracks, setTracks] = useState([
    {
      id: 'sample1',
      title: "Acoustic Breeze",
      artist: "Benjamin Tissot",
      url: "https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3",
      album: "Sample Collection",
      year: "2023",
      duration: "2:35"
    },
    {
      id: 'sample2',
      title: "Relaxing Tune",
      artist: "Free Music",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      album: "Sample Collection",
      year: "2023",
      duration: "4:20"
    },
    {
      id: 'sample3',
      title: "Sunny",
      artist: "Benjamin Tissot",
      url: "https://www.bensound.com/bensound-music/bensound-sunny.mp3",
      album: "Sample Collection",
      year: "2023",
      duration: "2:30"
    }
  ]);

  const togglePlayer = () => {
    setIsOpen(!isOpen);
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  // Handle seek bar change
  const handleSeekChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    
    // Update audio playback position
    if (audioRef.current) {
      const newTime = (newProgress / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Format time in MM:SS format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    
    try {
      // Use Jio Saavn API for music search
      let results = [];
      
      try {
        console.log('Searching Jio Saavn for:', searchQuery);
        
        // Use the unofficial Jio Saavn API
        const saavnResponse = await fetch(
          `https://saavn.dev/api/search/songs?query=${encodeURIComponent(searchQuery)}&page=1&limit=15`
        );
        
        console.log('Jio Saavn response status:', saavnResponse.status);
        
        if (saavnResponse.ok) {
          const saavnData = await saavnResponse.json();
          console.log('Jio Saavn raw data:', saavnData);
          
          if (saavnData.data && saavnData.data.results && saavnData.data.results.length > 0) {
            const songs = saavnData.data.results.slice(0, 15);
            
            results = songs.map((song, index) => ({
              id: `saavn-${song.id || index}`,
              title: song.name,
              artist: song.artists.primary.map(artist => artist.name).join(', '),
              album: song.album.name,
              year: song.year || '',
              duration: song.duration ? formatDuration(song.duration) : '',
              url: song.downloadUrl && song.downloadUrl.length > 0 ? song.downloadUrl[song.downloadUrl.length - 1].url : '',
              cover: song.image && song.image.length > 0 ? song.image[song.image.length - 1].url : '',
              source: 'Jio Saavn',
              fullLength: true
            }));
            console.log('Found Jio Saavn results:', results.length);
          }
        }
      } catch (saavnError) {
        console.log('Jio Saavn API error:', saavnError);
      }
      
      // If Jio Saavn didn't work, try a CORS proxy approach
      if (results.length === 0) {
        try {
          const proxyUrl = 'https://api.allorigins.win/get?url=';
          
          // Try Jamendo API through proxy (provides full tracks)
          console.log('Searching Jamendo for:', searchQuery);
          const jamendoResponse = await fetch(
            `${proxyUrl}${encodeURIComponent(
              `https://api.jamendo.com/v3.0/tracks/?client_id=58f38bc0&format=json&limit=10&search=${encodeURIComponent(searchQuery)}&include=album_image&audioformat=mp32`
            )}`
          );
          
          console.log('Jamendo response status:', jamendoResponse.status);
          
          if (jamendoResponse.ok) {
            const jamendoData = await jamendoResponse.json();
            console.log('Jamendo raw data:', jamendoData);
            const jamendoJson = JSON.parse(jamendoData.contents);
            console.log('Jamendo parsed data:', jamendoJson);
            
            if (jamendoJson.results && jamendoJson.results.length > 0) {
              results = jamendoJson.results.map((track) => ({
                id: `jamendo-${track.id}`,
                title: track.name,
                artist: track.artist_name,
                album: track.album_name,
                year: track.album_release_date ? new Date(track.album_release_date).getFullYear() : '',
                duration: formatDuration(track.duration),
                url: track.audio, // Full track URL for playback
                cover: track.album_image,
                source: 'Jamendo',
                fullLength: true
              }));
              console.log('Found Jamendo results:', results.length);
            }
          }
        } catch (jamendoError) {
          console.log('Jamendo API error:', jamendoError);
        }
      }
      
      // Set results or show message
      console.log('Final results count:', results.length);
      if (results.length > 0) {
        setSearchResults(results);
      } else {
        // Show a message that no results were found
        setSearchResults([{
          id: 'no-results',
          title: 'No tracks found',
          artist: 'Try a different search term',
          album: '',
          url: '',
          cover: '',
          fullLength: false
        }]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([{
        id: 'error',
        title: 'Search failed',
        artist: 'Please try again later',
        album: '',
        url: '',
        cover: '',
        fullLength: false
      }]);
    } finally {
      setIsSearching(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const playTrack = (track) => {
    // Check if track has a playable URL
    if (!track.url) {
      alert('This track is for informational purposes only. Unfortunately, we cannot play this track directly due to licensing restrictions. You can search for it on your preferred music streaming service.');
      return;
    }
    
    // Add the track to our playlist and play it
    const newTrack = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      url: track.url,
      album: track.album,
      year: track.year,
      duration: track.duration
    };
    
    const newTracks = [...tracks, newTrack];
    setTracks(newTracks);
    setCurrentTrack(newTracks.length - 1);
    setIsPlaying(true);
    
    // Close search results and show player
    setSearchResults([]);
    setSearchQuery('');
  };

  const addToPlaylist = (track) => {
    // Check if track has a playable URL
    if (!track.url) {
      alert('This track is for informational purposes only. Unfortunately, we cannot add this track to the playlist due to licensing restrictions.');
      return;
    }
    
    // Add the selected track to our playlist
    const newTrack = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      url: track.url,
      album: track.album,
      year: track.year,
      duration: track.duration
    };
    
    const newTracks = [...tracks, newTrack];
    setTracks(newTracks);
    
    // Show confirmation
    alert(`"${track.title}" added to playlist!`);
  };

  // Update progress as audio plays
  const updateProgress = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 0;
      
      setCurrentTime(currentTime);
      setDuration(duration);
      
      if (duration > 0) {
        const progressPercent = (currentTime / duration) * 100;
        setProgress(progressPercent);
      }
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.log("Auto-play prevented:", error);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrack, volume]);

  // Add event listeners for audio progress
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration || 0);
      });
      
      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('loadedmetadata', () => {
          setDuration(audio.duration || 0);
        });
      };
    }
  }, []);

  return (
    <div className="fixed bottom-24 right-6 z-40">
      {/* Audio element */}
      <audio 
        ref={audioRef}
        src={tracks[currentTrack]?.url}
        onEnded={nextTrack}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
      
      {/* Floating music player button */}
      <div 
        className="w-14 h-14 rounded-full shadow-lg cursor-pointer flex items-center justify-center mb-3"
        onClick={togglePlayer}
        style={{ 
          backgroundColor: '#f77f00',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="white"
        >
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      </div>

      {/* Music player panel */}
      {isOpen && (
        <div 
          className="w-96 rounded-xl shadow-xl p-2"
          style={{ 
            backgroundColor: '#fff',
            border: '1px solid #f6efe6',
            maxHeight: '550px',
            overflow: 'hidden'
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg" style={{ color: '#5a4632' }}>Music Player</h3>
            <button 
              onClick={togglePlayer}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs, artists..."
                className="flex-1 px-3 py-2 rounded-l border border-r-0 border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-r bg-orange-500 text-white hover:bg-orange-600"
                disabled={isSearching}
              >
                {isSearching ? '...' : 'Search'}
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Search includes full-length tracks and previews from various music libraries
            </div>
          </form>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="mb-4 max-h-60 overflow-y-auto">
              <h4 className="font-semibold mb-2" style={{ color: '#5a4632' }}>Search Results:</h4>
              {searchResults.map((track) => (
                <div 
                  key={track.id}
                  className={`p-2 border-b border-gray-100 hover:bg-orange-50 cursor-pointer ${track.id === 'no-results' || track.id === 'error' ? 'cursor-default hover:bg-white' : ''}`}
                >
                  <div className="flex items-center">
                    {track.cover && (
                      <img 
                        src={track.cover} 
                        alt={track.title} 
                        className="w-10 h-10 rounded mr-2"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate" style={{ color: '#5a4632' }}>{track.title}</div>
                      <div className="text-xs text-gray-500 truncate">{track.artist}</div>
                      {track.album && (
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{track.album}</span>
                          <span>{track.duration}</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-300">
                        {track.source}
                        {track.fullLength && (
                          <span className="ml-2 bg-green-100 text-green-800 text-xs px-1 rounded">Full Length</span>
                        )}
                        {!track.url && track.id !== 'no-results' && track.id !== 'error' && (
                          <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-1 rounded">Info Only</span>
                        )}
                      </div>
                    </div>
                    {track.id !== 'no-results' && track.id !== 'error' && track.url && (
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playTrack(track);
                          }}
                          className="p-1 text-orange-500 hover:text-orange-700"
                          title="Play"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToPlaylist(track);
                          }}
                          className="p-1 text-green-500 hover:text-green-700"
                          title="Add to playlist"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="text-xs text-gray-500 p-2 border-t border-gray-200">
                Note: Due to licensing restrictions, only sample tracks and previews are available for playback.
              </div>
            </div>
          )}

          {/* Now playing section */}
          <div className="mb-4">
            <div className="text-center mb-2">
              <div className="font-semibold text-md truncate" style={{ color: '#5a4632' }}>
                {tracks[currentTrack]?.title || 'No track selected'}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {tracks[currentTrack]?.artist || ''}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeekChange}
                className="w-full"
                style={{
                  accentColor: '#f77f00',
                  height: '4px'
                }}
              />
            </div>

            <div className="flex justify-center items-center space-x-4 mb-4">
              <button 
                onClick={prevTrack}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5a4632" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 19 2 12 11 5 11 19"></polygon>
                  <polygon points="22 19 13 12 22 5 22 19"></polygon>
                </svg>
              </button>

              <button 
                onClick={togglePlay}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#f77f00' }}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                    <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
              </button>

              <button 
                onClick={nextTrack}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5a4632" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 19 22 12 13 5 13 19"></polygon>
                  <polygon points="2 19 11 12 2 5 2 19"></polygon>
                </svg>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a4632" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1"
                style={{ 
                  accentColor: '#f77f00',
                  height: '4px'
                }}
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a4632" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            </div>
          </div>

          {/* Playlist */}
          <div className="max-h-40 overflow-y-auto">
            <h4 className="font-semibold mb-2" style={{ color: '#5a4632' }}>Playlist:</h4>
            {tracks.length > 0 ? (
              tracks.map((track, index) => (
                <div 
                  key={track.id}
                  className={`p-2 border-b border-gray-100 cursor-pointer ${index === currentTrack ? 'bg-orange-50' : ''}`}
                  onClick={() => {
                    setCurrentTrack(index);
                    setIsPlaying(true);
                  }}
                >
                  <div className="flex items-center">
                    {index === currentTrack && isPlaying && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f77f00" strokeWidth="2" className="mr-2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      </svg>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate" style={{ color: '#5a4632' }}>{track.title}</div>
                      <div className="text-xs text-gray-500 truncate">{track.artist}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-2">
                Your playlist is empty. Search for songs to add!
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 text-center mt-2">
            Now playing: {currentTrack + 1} of {tracks.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;