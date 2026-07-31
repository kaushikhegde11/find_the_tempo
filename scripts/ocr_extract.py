#!/usr/bin/env python3
"""
OCR script that extracts song names and artists from a screenshot.
Usage: python3 ocr_extract.py <image_path>
Output: JSON array of { "name": ..., "artist": ... } objects
"""

import sys
import json
import re
import base64
import os
import tempfile

def extract_text_from_image(image_path: str) -> str:
    """Use pytesseract to extract raw text from an image file."""
    try:
        import pytesseract
        from PIL import Image, ImageFilter, ImageEnhance
    except ImportError as e:
        print(json.dumps({"error": f"Missing dependency: {e}. Run: pip3 install pytesseract pillow"}))
        sys.exit(1)

    image = Image.open(image_path)

    # Convert to RGB if needed
    if image.mode != 'RGB':
        image = image.convert('RGB')

    # Upscale small images for better OCR accuracy
    w, h = image.size
    if w < 1000:
        scale = 1000 / w
        image = image.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

    # Enhance contrast and sharpness
    image = ImageEnhance.Contrast(image).enhance(1.5)
    image = ImageEnhance.Sharpness(image).enhance(2.0)

    # Run OCR with layout-aware config
    config = r'--oem 3 --psm 6'
    text = pytesseract.image_to_string(image, config=config)
    return text


def parse_songs_from_text(raw_text: str) -> list:
    """
    Parse song entries from raw OCR text.
    Handles common playlist screenshot formats:
    - "Song Name - Artist"
    - "Song Name\nArtist"
    - Numbered lists "1. Song Name"
    Returns a list of dicts with 'name' and 'artist' keys.
    """
    lines = [line.strip() for line in raw_text.split('\n') if line.strip()]

    songs = []
    seen = set()

    # Common noise / UI labels to skip
    noise_words = {
        'playlist', 'songs', 'tracks', 'music', 'shuffle', 'play', 'queue',
        'following', 'followers', 'likes', 'saved', 'liked', 'add', 'share',
        'more', 'options', 'library', 'home', 'search', 'now playing',
        'recently', 'recommended', 'top', 'artists', 'albums', 'podcasts',
        'episodes', 'settings', 'notifications', 'account', 'profile',
        'premium', 'free', 'upgrade', 'download', 'offline', 'duration',
        'length', 'time', 'date', 'added', 'plays', 'streams',
    }

    def is_noise(line: str) -> bool:
        low = line.lower().strip()
        # Very short lines
        if len(low) < 2:
            return True
        # Pure numbers (track numbers, timestamps)
        if re.match(r'^\d{1,3}$', low):
            return True
        # Timestamps like "3:45" or "1:02:34"
        if re.match(r'^\d{1,2}:\d{2}(:\d{2})?$', low):
            return True
        # Lines that are just noise words
        if low in noise_words:
            return True
        # Lines with only punctuation / symbols
        if re.match(r'^[\W_]+$', low):
            return True
        return False

    def clean_line(line: str) -> str:
        # Remove leading list markers like "1.", "•", "-", "▷", etc.
        line = re.sub(r'^[\d]+[.)]\s*', '', line)
        line = re.sub(r'^[•\-–—▷►▶▸*]\s*', '', line)
        # Remove trailing metadata like "(feat. ...)", "[Remix]", timestamps
        line = re.sub(r'\s*\(feat\..*?\)', '', line, flags=re.IGNORECASE)
        line = re.sub(r'\s*\[.*?\]', '', line)
        line = re.sub(r'\s+\d{1,2}:\d{2}(:\d{2})?\s*$', '', line)
        return line.strip()

    i = 0
    while i < len(lines):
        line = clean_line(lines[i])

        if is_noise(line):
            i += 1
            continue

        # Check if the line contains a separator indicating "Song - Artist"
        dash_match = re.match(r'^(.+?)\s+[-–—]\s+(.+)$', line)
        if dash_match:
            name = clean_line(dash_match.group(1)).strip()
            artist = clean_line(dash_match.group(2)).strip()
            if name and artist and not is_noise(name) and not is_noise(artist):
                key = name.lower()
                if key not in seen:
                    seen.add(key)
                    songs.append({'name': name, 'artist': artist, 'confidence': 0.92})
            i += 1
            continue

        # Check if next line looks like an artist (shorter, different pattern)
        if i + 1 < len(lines):
            next_line = clean_line(lines[i + 1])
            if (not is_noise(next_line) and
                len(next_line) < len(line) + 20 and
                not re.match(r'^[\d]+[.)]', lines[i + 1]) and
                len(next_line.split()) <= 5):
                # Treat current line as song name, next as artist
                name = line
                artist = next_line
                key = name.lower()
                if key not in seen and len(name) > 1 and len(artist) > 1:
                    seen.add(key)
                    songs.append({'name': name, 'artist': artist, 'confidence': 0.78})
                i += 2
                continue

        # Otherwise treat the whole line as a song name with unknown artist
        key = line.lower()
        if key not in seen and len(line) > 2:
            seen.add(key)
            songs.append({'name': line, 'artist': 'Unknown Artist', 'confidence': 0.60})

        i += 1

    return songs


def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Usage: python3 ocr_extract.py <image_path>'}))
        sys.exit(1)

    image_path = sys.argv[1]

    if not os.path.isfile(image_path):
        print(json.dumps({'error': f'File not found: {image_path}'}))
        sys.exit(1)

    try:
        raw_text = extract_text_from_image(image_path)
        songs = parse_songs_from_text(raw_text)

        result = {
            'songs': songs,
            'raw_text': raw_text,
            'count': len(songs),
        }
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)


if __name__ == '__main__':
    main()
