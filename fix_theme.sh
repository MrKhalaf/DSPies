#!/bin/bash
# Fix theme to be light and charming

sed -i '.bak' \
  -e 's/bg-black/bg-white/g' \
  -e 's/text-white/text-gray-800/g' \
  -e 's/bg-gray-900/bg-gray-50/g' \
  -e 's/bg-blue-900/bg-blue-50/g' \
  -e 's/bg-purple-900/bg-purple-50/g' \
  -e 's/bg-orange-900/bg-orange-50/g' \
  -e 's/bg-green-900/bg-green-50/g' \
  -e 's/bg-yellow-900/bg-yellow-50/g' \
  -e 's/bg-red-900/bg-red-50/g' \
  -e 's/bg-pink-900/bg-pink-50/g' \
  -e 's/border-blue-500/border-blue-400/g' \
  -e 's/border-purple-500/border-purple-400/g' \
  -e 's/border-orange-500/border-orange-400/g' \
  -e 's/border-green-600/border-green-500/g' \
  -e 's/border-4 border-blue-500/border-3 border-blue-400/g' \
  -e 's/border-4 border-purple-500/border-3 border-purple-400/g' \
  -e 's/border-4 border-orange-500/border-3 border-orange-400/g' \
  -e 's/text-blue-200/text-blue-700/g' \
  -e 's/text-purple-200/text-purple-700/g' \
  -e 's/text-orange-200/text-orange-700/g' \
  -e 's/text-green-200/text-green-700/g' \
  -e 's/text-gray-300/text-gray-700/g' \
  -e 's/text-blue-300/text-blue-600/g' \
  -e 's/text-purple-300/text-purple-600/g' \
  -e 's/text-orange-300/text-orange-600/g' \
  -e 's/text-green-300/text-green-600/g' \
  -e 's/text-yellow-300/text-orange-600/g' \
  -e 's/rounded-lg/rounded-xl/g' \
  frontend/src/components/DSPyStory.tsx

echo "Theme updated!"
