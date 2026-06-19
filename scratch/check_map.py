import sys
from PIL import Image

def get_pixel(lat, lng):
    img = Image.open('public/images/planet-texture.png')
    width, height = img.size
    # Equirectangular projection
    # lat: -90 to 90 (bottom to top). Image Y: 0 to height (top to bottom)
    # y = height - (lat + 90) / 180 * height
    # lng: -180 to 180 (left to right). Image X: 0 to width
    # x = (lng + 180) / 360 * width
    x = int((lng + 180) / 360 * width) % width
    y = int(height - (lat + 90) / 180 * height) % height
    r, g, b = img.getpixel((x, y))[:3]
    print(f"Lat: {lat}, Lng: {lng} -> RGB({r}, {g}, {b})")

get_pixel(15, 10)     # Hive Primus
get_pixel(0, -120)    # Ash Wastes
get_pixel(45, 40)     # Magma Forges
get_pixel(10, 90)     # Orbital Tether
get_pixel(-20, 110)   # The Sump
get_pixel(60, -140)   # Rad-Zone Gamma
