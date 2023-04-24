rm -rf ./lib || true
rm -f ./index.js || true
rm -rf ./tests || true
rm -rf ./coverage || true
rm -rf ./node_modules || true
rm -rf ./package-lock.json || true
npm install
npm run build
npm run build:fix-chmod