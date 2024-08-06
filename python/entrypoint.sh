#!/bin/sh

provider="$1"
configUUID="$2"
configName="$3"

if [ $provider == 'aws' ]; then
    python main.py "$provider" "$configUUID" "$configName"
elif [ $provider == 'az' ]; then
    location="$4"
    python main.py "$provider" "$configUUID" "$configName" "$location"
fi