const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const flats = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const transposeChord = (chord, semitones) => {
  return chord.replace(/[A-G][#b]?/g, (match) => {
    // Cari index nada saat ini (cek di sharps maupun flats)
    let index = keys.indexOf(match);
    if (index === -1) index = flats.indexOf(match);
    
    if (index === -1) return match; // Jika bukan chord standar, biarkan
    
    // Hitung index baru (modulo 12 untuk rotasi nada)
    let newIndex = (index + semitones) % 12;
    if (newIndex < 0) newIndex += 12;
    
    // Kembalikan nada baru (default ke sharps untuk konsistensi)
    return keys[newIndex];
  });
};

export const parseAndTransposeContent = (content, semitones) => {
  if (semitones === 0) return content;
  
  // Regex untuk mencari chord di dalam kurung siku [C] atau chord yang berdiri sendiri di baris chord
  return content.replace(/\[([^\]]+)\]/g, (match, chord) => {
    return `[${transposeChord(chord, semitones)}]`;
  });
};