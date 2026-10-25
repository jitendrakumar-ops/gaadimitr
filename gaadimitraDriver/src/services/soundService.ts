import SoundPlayer from 'react-native-sound-player';

let isPlaying = false;
let finishedListener: any = null;

export const soundService = {
  playRideSound: () => {
    try {
      isPlaying = true;
      SoundPlayer.playSoundFile('ride_request', 'mp3');

      if (!finishedListener) {
        finishedListener = SoundPlayer.addEventListener('FinishedPlaying', () => {
          if (isPlaying) {
            try {
              SoundPlayer.playSoundFile('ride_request', 'mp3');
            } catch {}
          }
        });
      }
    } catch (err) {
      console.warn('[soundService] Play error:', err);
    }
  },

  stopSound: () => {
    try {
      isPlaying = false;
      SoundPlayer.stop();
      if (finishedListener) {
        try {
          finishedListener.remove();
        } catch {}
        finishedListener = null;
      }
    } catch (err) {
      console.warn('[soundService] Stop error:', err);
    }
  },

  isPlaying: () => isPlaying,
};
