#!/bin/bash
set -e

SRC="/Users/sougat/Downloads/FoodSafe365_developer_icon_512.png"
RES="android/app/src/main/res"

if [ ! -f "$SRC" ]; then
    echo "Error: Source icon not found at $SRC"
    exit 1
fi

echo "Copying to play_store_assets/icon_512.png..."
cp "$SRC" play_store_assets/icon_512.png

echo "Updating values/ic_launcher_background.xml..."
cat << 'XML' > "$RES/values/ic_launcher_background.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#13956B</color>
</resources>
XML

echo "Removing old capacitor vector drawables..."
rm -f "$RES/drawable-v24/ic_launcher_foreground.xml"
rm -f "$RES/drawable/ic_launcher_background.xml"

# Update mipmap-anydpi-v26/ic_launcher.xml
cat << 'XML' > "$RES/mipmap-anydpi-v26/ic_launcher.xml"
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
XML

cat << 'XML' > "$RES/mipmap-anydpi-v26/ic_launcher_round.xml"
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
XML

echo "Generating mipmap icons..."
# mdpi (48x48 icon, 108x108 foreground)
sips -z 48 48 "$SRC" --out "$RES/mipmap-mdpi/ic_launcher.png" >/dev/null
cp "$RES/mipmap-mdpi/ic_launcher.png" "$RES/mipmap-mdpi/ic_launcher_round.png"
sips -z 108 108 "$SRC" --out "$RES/mipmap-mdpi/ic_launcher_foreground.png" >/dev/null

# hdpi (72x72 icon, 162x162 foreground)
sips -z 72 72 "$SRC" --out "$RES/mipmap-hdpi/ic_launcher.png" >/dev/null
cp "$RES/mipmap-hdpi/ic_launcher.png" "$RES/mipmap-hdpi/ic_launcher_round.png"
sips -z 162 162 "$SRC" --out "$RES/mipmap-hdpi/ic_launcher_foreground.png" >/dev/null

# xhdpi (96x96 icon, 216x216 foreground)
sips -z 96 96 "$SRC" --out "$RES/mipmap-xhdpi/ic_launcher.png" >/dev/null
cp "$RES/mipmap-xhdpi/ic_launcher.png" "$RES/mipmap-xhdpi/ic_launcher_round.png"
sips -z 216 216 "$SRC" --out "$RES/mipmap-xhdpi/ic_launcher_foreground.png" >/dev/null

# xxhdpi (144x144 icon, 324x324 foreground)
sips -z 144 144 "$SRC" --out "$RES/mipmap-xxhdpi/ic_launcher.png" >/dev/null
cp "$RES/mipmap-xxhdpi/ic_launcher.png" "$RES/mipmap-xxhdpi/ic_launcher_round.png"
sips -z 324 324 "$SRC" --out "$RES/mipmap-xxhdpi/ic_launcher_foreground.png" >/dev/null

# xxxhdpi (192x192 icon, 432x432 foreground)
sips -z 192 192 "$SRC" --out "$RES/mipmap-xxxhdpi/ic_launcher.png" >/dev/null
cp "$RES/mipmap-xxxhdpi/ic_launcher.png" "$RES/mipmap-xxxhdpi/ic_launcher_round.png"
sips -z 432 432 "$SRC" --out "$RES/mipmap-xxxhdpi/ic_launcher_foreground.png" >/dev/null

echo "Generating splash screens..."
# Helper function for splash
gen_splash() {
    local target="$1"
    local w="$2"
    local h="$3"
    local icon_size="$4"

    local tmp="/tmp/splash_icon_${icon_size}.png"
    sips -z "$icon_size" "$icon_size" "$SRC" --out "$tmp" >/dev/null
    sips -p "$h" "$w" --padColor 13956B "$tmp" --out "$target" >/dev/null
    rm -f "$tmp"
}

gen_splash "$RES/drawable/splash.png" 480 320 180
gen_splash "$RES/drawable-land-mdpi/splash.png" 480 320 180
gen_splash "$RES/drawable-land-hdpi/splash.png" 800 480 240
gen_splash "$RES/drawable-land-xhdpi/splash.png" 1280 720 320
gen_splash "$RES/drawable-land-xxhdpi/splash.png" 1600 960 400
gen_splash "$RES/drawable-land-xxxhdpi/splash.png" 1920 1280 480

gen_splash "$RES/drawable-port-mdpi/splash.png" 320 480 180
gen_splash "$RES/drawable-port-hdpi/splash.png" 480 800 240
gen_splash "$RES/drawable-port-xhdpi/splash.png" 720 1280 320
gen_splash "$RES/drawable-port-xxhdpi/splash.png" 960 1600 400
gen_splash "$RES/drawable-port-xxxhdpi/splash.png" 1280 1920 480

echo "All Android launcher icons and splash screens successfully updated with FoodSafe365 branding!"
