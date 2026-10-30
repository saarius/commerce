"""Original synthetic notebook illustration; no external assets or product photograph.
Writes a deterministic 900x600 RGB PNG using only Python's standard library.
"""
import struct
import sys
import zlib
from pathlib import Path

W, H = 900, 600

def pixel(x, y):
    color = (244, 237, 220)
    if 275 <= x < 650 and 100 <= y < 540:
        color = (216, 205, 178)  # flat illustrated shadow
    if 248 <= x < 626 and 70 <= y < 513:
        color = (250, 247, 234)  # paper edges
        if y > 480 and y % 6 == 0:
            color = (218, 218, 198)
    if 230 <= x < 610 and 60 <= y < 490:
        color = (48, 84, 65)  # notebook cover
    if 230 <= x < 264 and 60 <= y < 490:
        color = (32, 59, 46)  # spine
    if 300 <= x < 549 and 188 <= y < 314:
        color = (232, 217, 175)  # deliberately unbranded label
    if 325 <= x < 521 and y in (224, 225, 250, 251, 276, 277):
        color = (160, 151, 120)
    if 572 <= x < 583 and 60 <= y < 490:
        color = (166, 112, 60)  # elastic band
    return bytes(color)

raw = b''.join(b'\0' + b''.join(pixel(x, y) for x in range(W)) for y in range(H))
def chunk(kind, data):
    return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data))
png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>2I5B', W, H, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')
Path(sys.argv[1]).write_bytes(png)
