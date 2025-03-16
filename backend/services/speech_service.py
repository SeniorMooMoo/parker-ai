import streamlit as st
import librosa
import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter
import noisereduce as nr
import tempfile

class SpeechAnalysisService:
    def __init__(self):
        pass

    def butter_bandpass(self, lowcut=80, highcut=500, fs=16000, order=5):
        nyq = 0.5 * fs
        low = lowcut / nyq
        high = highcut / nyq
        b, a = butter(order, [low, high], btype='band')
        return b, a

    def analyze_audio(self, audio_bytes):
        """Analyze audio with enhanced PD-specific feature extraction"""
        try:
            # Save temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmpfile:
                tmpfile.write(audio_bytes)
                tmpfile_path = tmpfile.name

            # Load and preprocess audio
            y, sr = librosa.load(tmpfile_path, sr=None, mono=True)
            
            # Resample to 16 kHz if necessary
            if sr != 16000:
                y = librosa.resample(y, orig_sr=sr, target_sr=16000)
                sr = 16000

            # Validate audio length
            if len(y)/sr < 3:
                st.error("Recording too short (min 3 seconds required)")
                return None
                
            # Enhanced noise reduction
            y_denoised = nr.reduce_noise(
                y=y, sr=sr, stationary=True, 
                prop_decrease=0.9, n_fft=1024
            )
            
            # Bandpass filter focused on speech frequencies
            b, a = self.butter_bandpass(fs=sr)
            y_filtered = lfilter(b, a, y_denoised)

            # Feature extraction --------
            # 1. Pitch analysis with tremor detection
            pitches = librosa.yin(y_filtered, fmin=50, fmax=300, sr=sr)
            valid_pitches = pitches[(pitches > 0) & (pitches < 300)]
            pitch_mean = np.mean(valid_pitches) if len(valid_pitches) > 0 else 0
            pitch_var = np.std(valid_pitches) if len(valid_pitches) > 0 else 0

            # 2. Volume analysis with tremor modulation
            rms = librosa.feature.rms(y=y_filtered, frame_length=2048, hop_length=512)
            rms_mean = np.mean(rms)  # Convert to scalar
            volume_var = np.std(rms) * 100  # Convert to percentage

            # Adjust volume stability calculation
            # Normalize RMS to dB scale for better sensitivity
            rms_db = librosa.amplitude_to_db(rms, ref=np.max)
            volume_var_db = np.std(rms_db)  # Volume variability in dB

            # 3. Formant analysis with LPC stabilization
            formants = []
            for i in range(0, len(y_filtered), int(sr*0.03)):  # 30ms windows
                frame = y_filtered[i:i+int(sr*0.03)]
                if len(frame) < 100: continue
                try:
                    lpc_coeffs = librosa.lpc(frame, order=12)
                    roots = np.roots(lpc_coeffs)
                    roots = roots[roots.imag > 0]
                    angles = np.arctan2(roots.imag, roots.real)
                    freqs = angles * (sr / (2 * np.pi))
                    formants.extend(sorted(freqs[(freqs > 100) & (freqs < 3000)])[:3])
                except: continue

            formant_mean = np.mean(formants) if formants else 0
            formant_var = np.std(formants) if formants else 0

            # 4. Additional features: Jitter, Shimmer, HNR
            # Jitter (pitch perturbation)
            jitter = np.mean(np.abs(np.diff(valid_pitches))) / np.mean(valid_pitches)

            # Shimmer (amplitude perturbation)
            shimmer = np.mean(np.abs(np.diff(rms_db))) / np.mean(rms_db)

            # Harmonic-to-noise ratio (HNR)
            y_harmonic, y_percussive = librosa.effects.hpss(y_filtered)
            if np.sum(y_harmonic) > 0:  # Check if harmonic component exists
                hnr = 10 * np.log10(np.sum(y_harmonic**2) / np.sum(y_percussive**2))
            else:
                hnr = 0  # Default value if no harmonic content

            # Debug outputs
            st.write("### Raw Feature Values")
            st.write(f"Pitch (Hz): Mean={pitch_mean:.1f} ± {pitch_var:.1f}")
            st.write(f"Volume (dB): Var={volume_var_db:.2f} dB")
            st.write(f"Formants (Hz): Mean={formant_mean:.1f} ± {formant_var:.1f}")
            st.write(f"Jitter: {jitter:.4f}")
            st.write(f"Shimmer: {shimmer:.4f}")
            st.write(f"HNR: {hnr:.1f}")

            # Return results as scalar values
            return {
                'y': y_filtered,
                'sr': sr,
                'rms': float(rms_mean),  # Convert to scalar
                'pitches': float(pitch_mean),  # Convert to scalar
                'formant_values': float(formant_mean),  # Convert to scalar
                'pitch_variability': float(pitch_var),
                'volume_variability': float(volume_var_db),  # Use dB scale
                'formant_variability': float(formant_var),
                'jitter': float(jitter),
                'shimmer': float(shimmer),
                'hnr': float(hnr)
            }

        except Exception as e:
            st.error(f"Analysis failed: {str(e)}")
            return None
        
        
    def calculate_updrs_score(self, results):
        """Enhanced UPDRS-III scoring with clinical normalization and additional features"""
        # Normalize features to 0-1 range (adjusted thresholds)
        pitch_norm = np.clip((results["pitch_variability"] - 30) / 40, 0, 1)  # 30-70 Hz = normal
        volume_norm = np.clip((results["volume_variability"] - 10) / 20, 0, 1)  # 10-30 dB = normal
        formant_norm = np.clip(results["formant_variability"] / 200, 0, 1)  # Higher spread = worse
        jitter_norm = np.clip(results["jitter"] / 0.04, 0, 1)  # Threshold: 0.04
        shimmer_norm = np.clip(results["shimmer"] / 0.1, 0, 1)  # Threshold: 0.1
        hnr_norm = np.clip((30 - results["hnr"]) / 30, 0, 1)  # Lower HNR = worse

        # Weighted sum (adjusted weights)
        raw_score = (
            0.50 * pitch_norm +  # Pitch variability (50% weight)
            0.0001 * volume_norm +  # Volume stability (0.0001% weight)
            0.15 * formant_norm +  # Formant spread (15% weight)
            0.10 * jitter_norm +  # Jitter (10% weight)
            0.10 * shimmer_norm +  # Shimmer (10% weight)
            0.05 * hnr_norm  # Harmonic-to-noise ratio (5% weight)
        )
        
        # Sigmoid mapping (sharper transition and shifted midpoint)
        score = 4 / (1 + np.exp(-6.0 * (raw_score - 0.6)))
        return np.clip(round(score, 1), 0, 4)