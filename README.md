### Packer 📦
This repo is a means to replicate JS bundlers (like webpack) in a very simple way to understand how they work on a high level.

#### Usage:

- Create `packer.config.js` in your app you want to bundle.
  
  ```
  module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'index.js'
    }
  };
  ```

- Add a **build** and **serve** commands to your app package.json.
  
  ```
  "scripts": {
    ...
    "build": "pckr --config packer.config.js",
    "start": "pckr serve"
  },
  ```
  
- Run `npm run build` and this will create a `/build` directory in your app root with the bundled file.

OR

- Run `npm run start` to start the packer server that looks for file changes and see your app hot reload :D