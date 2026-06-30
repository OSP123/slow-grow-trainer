#!/bin/bash
# Warhammer 40K Vox-Cast Audio Processor
# Transforms clean audio into grimdark military vox transmission
#
# Effect chain:
# 1. Generate static/crackle noise bed
# 2. Band-pass filter voice to 300Hz-3500Hz (military radio freq range)  
# 3. Apply overdrive distortion for gritty signal degradation
# 4. Add subtle bit-crushing via sample rate reduction
# 5. Heavy dynamic compression (squashed military radio feel)
# 6. Add hollow metallic resonance
# 7. Mix with static noise bed
# 8. Add periodic signal dropouts/interference bursts

set -e

INPUT="$1"
OUTPUT="$2"

if [ -z "$INPUT" ] || [ -z "$OUTPUT" ]; then
  echo "Usage: $0 <input_file> <output_file>"
  exit 1
fi

DURATION=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$INPUT")
echo "Processing ${DURATION}s of audio through Vox-Cast filter chain..."

TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

echo "[1/5] Generating static noise bed..."
# Generate white noise, then filter it to sound like radio static/crackle
ffmpeg -y -f lavfi -i "anoisesrc=d=${DURATION}:c=pink:r=48000:a=0.035" \
  -af "highpass=f=600,lowpass=f=5000,acrusher=bits=10:mix=0.2:mode=log:samples=4,acompressor=threshold=-30dB:ratio=8:attack=1:release=50" \
  -t "$DURATION" "$TMPDIR/static_noise.wav" 2>/dev/null

echo "[2/5] Generating intermittent interference bursts..."
# Create periodic crackle/burst interference using tremolo on noise
ffmpeg -y -f lavfi -i "anoisesrc=d=${DURATION}:c=white:r=48000:a=0.04" \
  -af "tremolo=f=0.25:d=0.7,highpass=f=800,lowpass=f=5000,volume=0.5" \
  -t "$DURATION" "$TMPDIR/interference.wav" 2>/dev/null

echo "[3/5] Processing voice through Vox-Cast signal chain..."
# Main voice processing chain:
# - bandpass to 300-3500Hz (vox frequency range)
# - overdrive distortion for grit
# - heavy compression for that squashed military radio sound
# - add a slight metallic resonance with equalizer peaks
# - add subtle echo for hollow vox-caster resonance
ffmpeg -y -i "$INPUT" \
  -af "
    highpass=f=400:poles=2,
    lowpass=f=3000:poles=2,
    acompressor=threshold=-25dB:ratio=15:attack=1:release=80:makeup=8dB,
    acrusher=bits=7:mix=0.5:mode=log:dc=0.3:aa=0.3:samples=3:lfo=0,
    alimiter=limit=0.9:attack=1:release=10,
    equalizer=f=1200:t=q:w=3:g=5,
    equalizer=f=2200:t=q:w=2:g=4,
    equalizer=f=700:t=q:w=1:g=-4,
    acompressor=threshold=-18dB:ratio=10:attack=2:release=150:makeup=5dB,
    aecho=0.8:0.5:12|22|35:0.2|0.12|0.06,
    volume=0.8
  " \
  -ar 48000 -ac 1 \
  "$TMPDIR/vox_voice.wav" 2>/dev/null

echo "[4/5] Mixing voice with static and interference..."
# Mix the processed voice with the static noise and interference
ffmpeg -y \
  -i "$TMPDIR/vox_voice.wav" \
  -i "$TMPDIR/static_noise.wav" \
  -i "$TMPDIR/interference.wav" \
  -filter_complex "
    [0:a]volume=1.0[voice];
    [1:a]volume=0.45[static];
    [2:a]volume=0.18[bursts];
    [voice][static][bursts]amix=inputs=3:duration=first:weights=1 0.45 0.18[mixed];
    [mixed]highpass=f=350,lowpass=f=3500,alimiter=limit=0.9:attack=1:release=10[out]
  " \
  -map "[out]" \
  -ar 48000 -ac 1 \
  "$TMPDIR/vox_mixed.wav" 2>/dev/null

echo "[5/5] Applying final Vox-Cast mastering..."
# Final pass: slight bit-crush effect via sample rate bounce, then final limiting
ffmpeg -y -i "$TMPDIR/vox_mixed.wav" \
  -af "
    aresample=11025,
    aresample=48000,
    acrusher=bits=12:mix=0.15:mode=log:samples=2,
    acompressor=threshold=-12dB:ratio=20:attack=0.5:release=30:makeup=6dB,
    alimiter=limit=0.85:attack=0.5:release=5,
    volume=1.3
  " \
  "$OUTPUT" 2>/dev/null

echo ""
echo "=== VOX-CAST PROCESSING COMPLETE ==="
echo "Output: $OUTPUT"
echo "The Emperor Protects."
