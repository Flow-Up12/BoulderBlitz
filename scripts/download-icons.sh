#!/bin/bash

# Create directories if they don't exist
mkdir -p assets/icons/pickaxes
mkdir -p assets/icons/miners

# Download pickaxe icons
curl -o assets/icons/pickaxes/wooden-pickaxe.png "https://game-icons.net/icons/000000/transparent/1x1/delapouite/wood-axe.png"
curl -o assets/icons/pickaxes/stone-pickaxe.png "https://game-icons.net/icons/000000/transparent/1x1/lorc/stone-crafting.png"
curl -o assets/icons/pickaxes/copper-pickaxe.png "https://game-icons.net/icons/000000/transparent/1x1/lorc/mining.png"
curl -o assets/icons/pickaxes/iron-pickaxe.png "https://game-icons.net/icons/000000/transparent/1x1/lorc/sharp-axe.png"
curl -o assets/icons/pickaxes/gold-pickaxe.png "https://game-icons.net/icons/000000/transparent/1x1/lorc/gold-mine.png"
curl -o assets/icons/pickaxes/diamond-pickaxe.png "https://game-icons.net/icons/000000/transparent/1x1/lorc/crystal-shine.png"
curl -o assets/icons/pickaxes/obsidian-pickaxe.png "https://game-icons.net/icons/000000/transparent/1x1/lorc/crystal-growth.png"
curl -o assets/icons/pickaxes/plasma-pickaxe.png "https://game-icons.net/icons/000000/transparent/1x1/lorc/plasma-bolt.png"
curl -o assets/icons/pickaxes/quantum-pickaxe.png "https://game-icons.net/icons/000000/transparent/1x1/lorc/atomic.png"
curl -o assets/icons/pickaxes/ultra-diamond-pickaxe.png "https://game-icons.net/icons/000000/transparent/1x1/lorc/crystal-cluster.png"
curl -o assets/icons/pickaxes/laser-pickaxe.png "https://game-icons.net/icons/000000/transparent/1x1/lorc/laser-blast.png"
curl -o assets/icons/pickaxes/plasma-cutter.png "https://game-icons.net/icons/000000/transparent/1x1/lorc/plasma-bolt.png"
curl -o assets/icons/pickaxes/quantum-disruptor.png "https://game-icons.net/icons/000000/transparent/1x1/lorc/atom.png"

# Download miner icons
curl -o assets/icons/miners/caveman-apprentice.png "https://game-icons.net/icons/000000/transparent/1x1/delapouite/miner.png"
curl -o assets/icons/miners/caveman-miner.png "https://game-icons.net/icons/000000/transparent/1x1/delapouite/mine-worker.png"
curl -o assets/icons/miners/skilled-miner.png "https://game-icons.net/icons/000000/transparent/1x1/delapouite/mining-helmet.png"
curl -o assets/icons/miners/mining-expert.png "https://game-icons.net/icons/000000/transparent/1x1/lorc/mining.png"
curl -o assets/icons/miners/drill-operator.png "https://game-icons.net/icons/000000/transparent/1x1/lorc/drill.png"
curl -o assets/icons/miners/mining-robot.png "https://game-icons.net/icons/000000/transparent/1x1/lorc/robot-golem.png"
curl -o assets/icons/miners/quantum-miner.png "https://game-icons.net/icons/000000/transparent/1x1/lorc/android-mask.png"
curl -o assets/icons/miners/nano-miner.png "https://game-icons.net/icons/000000/transparent/1x1/lorc/processor.png"
curl -o assets/icons/miners/gravity-miner.png "https://game-icons.net/icons/000000/transparent/1x1/lorc/gravity.png"
curl -o assets/icons/miners/time-miner.png "https://game-icons.net/icons/000000/transparent/1x1/lorc/time-trap.png"
curl -o assets/icons/miners/black-hole-miner.png "https://game-icons.net/icons/000000/transparent/1x1/lorc/vortex.png"

# Make the script executable
chmod +x download-icons.sh 